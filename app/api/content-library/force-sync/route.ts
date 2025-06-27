/**
 * Force sync specific videos from Cloudflare to Supabase
 * Useful for syncing videos that were uploaded directly to Cloudflare
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStreamVideo, listStreamVideos } from '@/lib/stream-api';
import { syncSingleVideo } from '@/lib/content-library-sync';
import { createClient } from '@/lib/supabase/server';

// Simple admin user IDs for immediate access
const ADMIN_USER_IDS: string[] = [
  'user_2y232PRIhXVR9omfFBhPQdG6DZU',
  'user_2ykxfPwP3yMZH0HbqadSs4FaDXT'
];

/**
 * Check if user is admin
 */
async function isUserAdmin(clerkUserId: string): Promise<boolean> {
  try {
    // Check simple admin list first
    if (ADMIN_USER_IDS.includes(clerkUserId)) {
      return true;
    }

    // Check Supabase user role as fallback
    const supabase = await createClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', clerkUserId)
      .single();
    
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

// Removed channel creation - videos will sync without forced channel assignment

export async function POST(request: NextRequest) {
  console.log('🚀 Force sync API called');
  
  try {
    // Check authentication
    console.log('Step 1: Checking authentication...');
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ No user ID found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log(`✅ User authenticated: ${userId}`);

    // Check admin permissions
    console.log('Step 2: Checking admin permissions...');
    const isAdmin = await isUserAdmin(userId);
    if (!isAdmin) {
      console.log('❌ User is not admin');
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    console.log('✅ Admin access confirmed');

    const body = await request.json();
    const { video_ids, sync_all_ready } = body;

    if (!video_ids && !sync_all_ready) {
      return NextResponse.json(
        { error: 'Either video_ids array or sync_all_ready=true must be provided' },
        { status: 400 }
      );
    }

    console.log('Force sync request:', { video_ids, sync_all_ready });
    
    let videosToSync = [];

    if (sync_all_ready) {
      // Get all ready videos from Cloudflare that aren't in Supabase
      console.log('Finding all ready videos not in Supabase...');
      
      try {
        const streamVideos = await listStreamVideos({ limit: 1000 });
        
        console.log(`Retrieved ${streamVideos.length} videos from Cloudflare`);
        
        // Get existing video IDs from Supabase
        const supabase = await createClient();
        const { data: existingVideos, error: existingError } = await supabase
          .from('content')
          .select('cloudflare_video_id')
          .not('cloudflare_video_id', 'is', null);

        if (existingError) {
          console.error('Error fetching existing videos:', existingError);
          throw new Error(`Database error: ${existingError.message}`);
        }

        const existingIds = new Set(existingVideos?.map(v => v.cloudflare_video_id) || []);
        console.log(`Found ${existingIds.size} existing videos in Supabase`);
        
        // Filter for ready videos not in Supabase
        videosToSync = streamVideos.filter(video => {
          const isReady = video.status?.state === 'ready';
          const canStream = video.readyToStream;
          const notInSupabase = !existingIds.has(video.uid);
          
          if (isReady && canStream && notInSupabase) {
            console.log(`Video to sync: ${video.uid} - ${video.meta?.name || 'Unnamed'}`);
          }
          
          return isReady && canStream && notInSupabase;
        });
        
        console.log(`Found ${videosToSync.length} ready videos to sync`);
        
      } catch (streamError) {
        console.error('Error calling stream API:', streamError);
        throw new Error(`Stream API error: ${streamError.message}`);
      }
      
    } else {
      // Sync specific video IDs
      console.log(`Syncing specific videos: ${video_ids.join(', ')}`);
      
      for (const videoId of video_ids) {
        try {
          const video = await getStreamVideo(videoId);
          videosToSync.push(video);
        } catch (error) {
          console.error(`Failed to get video ${videoId}:`, error);
        }
      }
    }

    if (videosToSync.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No videos to sync',
        results: []
      });
    }

    // Sync each video without channel assignment
    const results = [];
    for (const video of videosToSync) {
      console.log(`Syncing video: ${video.uid} (${video.meta?.name || 'Unnamed'})`);
      
      const result = await syncSingleVideo(video);
      results.push(result);
      
      console.log(`  Result: ${result.action}${result.error ? ` - ${result.error}` : ''}`);
    }

    // Calculate summary
    const summary = {
      total_processed: results.length,
      created: results.filter(r => r.action === 'created').length,
      updated: results.filter(r => r.action === 'updated').length,
      skipped: results.filter(r => r.action === 'skipped').length,
      errors: results.filter(r => r.action === 'error').length
    };

    console.log('Force sync complete:', summary);

    return NextResponse.json({
      success: true,
      message: `Force sync completed: ${summary.created} created, ${summary.updated} updated, ${summary.errors} errors`,
      summary,
      results
    });

  } catch (error) {
    console.error('Force sync API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Force sync failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}