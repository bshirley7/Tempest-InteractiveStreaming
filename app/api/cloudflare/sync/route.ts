import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 500 }
      );
    }
    
    // Fetch videos from Cloudflare Stream
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.error('Cloudflare API error:', response.status, await response.text());
      return NextResponse.json(
        { error: 'Failed to fetch from Cloudflare Stream' },
        { status: response.status }
      );
    }
    
    const { result: videos, success } = await response.json();
    
    if (!success) {
      return NextResponse.json(
        { error: 'Cloudflare API returned error' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: videos,
      count: videos.length,
    });
  } catch (error) {
    console.error('Cloudflare sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { force = false } = body;
    
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 500 }
      );
    }
    
    // Fetch videos from Cloudflare Stream
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from Cloudflare Stream' },
        { status: response.status }
      );
    }
    
    const { result: cloudflareVideos, success } = await response.json();
    
    if (!success) {
      return NextResponse.json(
        { error: 'Cloudflare API returned error' },
        { status: 500 }
      );
    }
    
    // Get existing videos from database
    const { data: existingVideos } = await supabase
      .from('content')
      .select('cloudflare_video_id')
      .not('cloudflare_video_id', 'is', null);
    
    const existingIds = new Set(existingVideos?.map(v => v.cloudflare_video_id) || []);
    
    // Filter out videos that already exist (unless force sync)
    const videosToSync = cloudflareVideos.filter((video: any) => 
      force || !existingIds.has(video.uid)
    );
    
    const syncResults = {
      total: cloudflareVideos.length,
      synced: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[],
    };
    
    // Determine appropriate channel for each video
    const determineChannel = (video: any) => {
      const title = (video.meta?.name || '').toLowerCase();
      const description = (video.meta?.description || '').toLowerCase();
      
      // Travel content
      if (title.includes('travel') || title.includes('guide') || title.includes('city')) {
        return 'retirewise';
      }
      
      // Educational content
      if (title.includes('lecture') || title.includes('education') || title.includes('learning')) {
        return 'mindfeed';
      }
      
      // Career content
      if (title.includes('career') || title.includes('business') || title.includes('startup')) {
        return 'career-compass';
      }
      
      // Wellness content
      if (title.includes('wellness') || title.includes('meditation') || title.includes('relaxation')) {
        return 'wellness-wave';
      }
      
      // How-to content
      if (title.includes('how to') || title.includes('tutorial') || title.includes('diy')) {
        return 'how-to-hub';
      }
      
      // Default to Campus Pulse
      return 'campus-pulse';
    };
    
    // Get channel IDs
    const { data: channels } = await supabase
      .from('channels')
      .select('id, slug');
    
    const channelMap = new Map(channels?.map(c => [c.slug, c.id]) || []);
    
    // Sync videos to database
    for (const video of videosToSync) {
      try {
        const channelSlug = determineChannel(video);
        const channelId = channelMap.get(channelSlug);
        
        const videoData = {
          title: video.meta?.name || `Video ${video.uid.substring(0, 8)}`,
          description: video.meta?.description || null,
          channel_id: channelId,
          cloudflare_video_id: video.uid,
          thumbnail_url: video.thumbnail,
          duration: video.duration ? Math.floor(parseFloat(video.duration)) : null,
          category: video.meta?.category || 'general',
          language: video.meta?.language || 'English',
          keywords: video.meta?.keywords ? video.meta.keywords.split(',').map((k: string) => k.trim()) : [],
          tags: video.meta?.tags ? video.meta.tags.split(',').map((t: string) => t.trim()) : [],
          is_published: false,
          sync_status: 'synced',
          last_synced_at: new Date().toISOString(),
          stream_metadata: video,
          metadata: {
            syncedAt: new Date().toISOString(),
            source: 'cloudflare_sync',
          },
        };
        
        if (force && existingIds.has(video.uid)) {
          // Update existing video
          const { error } = await supabase
            .from('content')
            .update({
              ...videoData,
              updated_at: new Date().toISOString(),
            })
            .eq('cloudflare_video_id', video.uid);
          
          if (error) {
            syncResults.errors++;
            syncResults.details.push({
              id: video.uid,
              title: videoData.title,
              action: 'update_failed',
              error: error.message,
            });
          } else {
            syncResults.synced++;
            syncResults.details.push({
              id: video.uid,
              title: videoData.title,
              action: 'updated',
            });
          }
        } else {
          // Insert new video
          const { error } = await supabase
            .from('content')
            .insert([videoData]);
          
          if (error) {
            syncResults.errors++;
            syncResults.details.push({
              id: video.uid,
              title: videoData.title,
              action: 'insert_failed',
              error: error.message,
            });
          } else {
            syncResults.synced++;
            syncResults.details.push({
              id: video.uid,
              title: videoData.title,
              action: 'created',
            });
          }
        }
      } catch (error) {
        syncResults.errors++;
        syncResults.details.push({
          id: video.uid,
          title: video.meta?.name || 'Unknown',
          action: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    syncResults.skipped = syncResults.total - syncResults.synced - syncResults.errors;
    
    return NextResponse.json({
      success: true,
      data: syncResults,
      message: `Sync completed: ${syncResults.synced} synced, ${syncResults.skipped} skipped, ${syncResults.errors} errors`,
    });
  } catch (error) {
    console.error('Cloudflare sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}