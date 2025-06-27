import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStreamVideos } from '@/lib/stream-api';

interface SyncStatus {
  cloudflareVideoId: string;
  existsInCloudflare: boolean;
  existsInSupabase: boolean;
  cloudflareData?: any;
  supabaseData?: any;
  syncStatus: 'synced' | 'missing_in_supabase' | 'missing_in_cloudflare' | 'data_mismatch';
  issues: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check Cloudflare Stream
    let cloudflareVideo = null;
    let existsInCloudflare = false;
    
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        cloudflareVideo = data.result;
        existsInCloudflare = true;
      }
    } catch (error) {
      console.error('Error checking Cloudflare Stream:', error);
    }

    // Check Supabase
    const { data: supabaseContent, error: supabaseError } = await supabase
      .from('content')
      .select('*')
      .eq('cloudflare_video_id', videoId)
      .single();

    const existsInSupabase = !supabaseError && !!supabaseContent;

    // Determine sync status and issues
    const issues: string[] = [];
    let syncStatus: SyncStatus['syncStatus'] = 'synced';

    if (!existsInCloudflare && !existsInSupabase) {
      syncStatus = 'missing_in_cloudflare';
      issues.push('Video not found in either Cloudflare or Supabase');
    } else if (!existsInCloudflare) {
      syncStatus = 'missing_in_cloudflare';
      issues.push('Video exists in Supabase but not in Cloudflare Stream');
    } else if (!existsInSupabase) {
      syncStatus = 'missing_in_supabase';
      issues.push('Video exists in Cloudflare Stream but not in Supabase');
    } else {
      // Both exist, check for data mismatches
      if (cloudflareVideo.meta?.name !== supabaseContent.title) {
        syncStatus = 'data_mismatch';
        issues.push(`Title mismatch: Cloudflare="${cloudflareVideo.meta?.name}", Supabase="${supabaseContent.title}"`);
      }
      
      if (cloudflareVideo.duration !== supabaseContent.duration) {
        syncStatus = 'data_mismatch';
        issues.push(`Duration mismatch: Cloudflare=${cloudflareVideo.duration}, Supabase=${supabaseContent.duration}`);
      }
    }

    const status: SyncStatus = {
      cloudflareVideoId: videoId,
      existsInCloudflare,
      existsInSupabase,
      cloudflareData: cloudflareVideo,
      supabaseData: supabaseContent,
      syncStatus,
      issues,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Sync verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify sync status' },
      { status: 500 }
    );
  }
}

// Bulk sync verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get all videos from Cloudflare
    const cloudflareVideos = await getStreamVideos({ limit });
    const cloudflareVideoIds = new Set(cloudflareVideos.map(v => v.uid));

    // Get all videos from Supabase
    const { data: supabaseContent, error } = await supabase
      .from('content')
      .select('id, title, cloudflare_video_id, duration, created_at')
      .not('cloudflare_video_id', 'is', null)
      .limit(limit);

    if (error) {
      throw new Error('Failed to fetch Supabase content');
    }

    const supabaseVideoIds = new Set(
      supabaseContent?.map(c => c.cloudflare_video_id).filter(Boolean) || []
    );

    // Find sync issues
    const missingInSupabase = Array.from(cloudflareVideoIds).filter(
      id => !supabaseVideoIds.has(id)
    );
    
    const missingInCloudflare = Array.from(supabaseVideoIds).filter(
      id => !cloudflareVideoIds.has(id)
    );

    // Create detailed sync report
    const syncReport = {
      summary: {
        totalCloudflareVideos: cloudflareVideoIds.size,
        totalSupabaseVideos: supabaseVideoIds.size,
        synced: Array.from(cloudflareVideoIds).filter(id => supabaseVideoIds.has(id)).length,
        missingInSupabase: missingInSupabase.length,
        missingInCloudflare: missingInCloudflare.length,
      },
      issues: {
        missingInSupabase: missingInSupabase.map(videoId => {
          const cloudflareVideo = cloudflareVideos.find(v => v.uid === videoId);
          return {
            cloudflareVideoId: videoId,
            title: cloudflareVideo?.meta?.name || 'Unknown',
            uploadedAt: cloudflareVideo?.uploaded || null,
            ready: cloudflareVideo?.ready || false,
          };
        }),
        missingInCloudflare: missingInCloudflare.map(videoId => {
          const supabaseVideo = supabaseContent?.find(c => c.cloudflare_video_id === videoId);
          return {
            cloudflareVideoId: videoId,
            supabaseId: supabaseVideo?.id,
            title: supabaseVideo?.title || 'Unknown',
            createdAt: supabaseVideo?.created_at,
          };
        }),
      },
      lastChecked: new Date().toISOString(),
    };

    return NextResponse.json(syncReport);
  } catch (error) {
    console.error('Bulk sync verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify bulk sync status' },
      { status: 500 }
    );
  }
}