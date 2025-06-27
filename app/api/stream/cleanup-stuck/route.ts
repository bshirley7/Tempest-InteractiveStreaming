/**
 * API endpoint to cleanup stuck videos from Cloudflare Stream
 * Only accessible to admin users
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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
    if (ADMIN_USER_IDS.includes(clerkUserId)) {
      return true;
    }

    const supabase = createClient();
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

/**
 * Get all videos from Cloudflare Stream
 */
async function getCloudflareVideos() {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Cloudflare API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.result || [];
}

/**
 * Delete a video from Cloudflare Stream
 */
async function deleteCloudflareVideo(videoId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.ok;
  } catch (error) {
    console.error(`Failed to delete video ${videoId}:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await isUserAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { dry_run = true, max_age_hours = 1 } = body;

    console.log('Cleanup stuck videos request:', { dry_run, max_age_hours });

    // Get all videos from Cloudflare
    const allVideos = await getCloudflareVideos();
    
    // Find stuck videos (pending uploads older than specified age)
    const cutoffTime = new Date(Date.now() - max_age_hours * 60 * 60 * 1000);
    const stuckVideos = allVideos.filter(video => {
      const isPending = video.status?.state === 'pendingupload';
      const isOld = new Date(video.created) < cutoffTime;
      return isPending && isOld;
    });

    console.log(`Found ${stuckVideos.length} stuck videos out of ${allVideos.length} total`);

    if (dry_run) {
      // Return analysis without deleting
      return NextResponse.json({
        success: true,
        dry_run: true,
        analysis: {
          total_videos: allVideos.length,
          stuck_videos: stuckVideos.length,
          ready_videos: allVideos.filter(v => v.status?.state === 'ready').length,
          processing_videos: allVideos.filter(v => 
            ['inprogress', 'queued', 'downloading'].includes(v.status?.state)
          ).length,
          error_videos: allVideos.filter(v => v.status?.state === 'error').length
        },
        stuck_videos: stuckVideos.map(video => ({
          id: video.uid,
          name: video.meta?.name || 'Unnamed',
          status: video.status?.state,
          created: video.created,
          age_hours: Math.round((Date.now() - new Date(video.created).getTime()) / (1000 * 60 * 60)),
          size_mb: video.size ? Math.round(video.size / 1024 / 1024) : null
        }))
      });
    }

    // Actually delete the stuck videos
    const results = [];
    let deletedCount = 0;
    let failedCount = 0;

    for (const video of stuckVideos) {
      console.log(`Deleting stuck video: ${video.uid} (${video.meta?.name || 'Unnamed'})`);
      
      const success = await deleteCloudflareVideo(video.uid);
      
      results.push({
        id: video.uid,
        name: video.meta?.name || 'Unnamed',
        success,
        error: success ? null : 'Failed to delete'
      });

      if (success) {
        deletedCount++;
      } else {
        failedCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Cleanup complete: ${deletedCount} deleted, ${failedCount} failed`);

    return NextResponse.json({
      success: true,
      dry_run: false,
      summary: {
        total_stuck: stuckVideos.length,
        deleted: deletedCount,
        failed: failedCount,
        max_age_hours
      },
      results
    });

  } catch (error) {
    console.error('Cleanup stuck videos API error:', error);
    return NextResponse.json(
      { 
        error: 'Cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for analysis only
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await isUserAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const maxAgeHours = parseInt(searchParams.get('max_age_hours') || '1');

    // Get all videos from Cloudflare
    const allVideos = await getCloudflareVideos();
    
    // Analyze video statuses
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    const analysis = {
      total_videos: allVideos.length,
      ready: allVideos.filter(v => v.status?.state === 'ready').length,
      pending_upload: allVideos.filter(v => v.status?.state === 'pendingupload').length,
      stuck_videos: allVideos.filter(v => 
        v.status?.state === 'pendingupload' && new Date(v.created) < cutoffTime
      ).length,
      processing: allVideos.filter(v => 
        ['inprogress', 'queued', 'downloading'].includes(v.status?.state)
      ).length,
      error: allVideos.filter(v => v.status?.state === 'error').length
    };

    return NextResponse.json({
      success: true,
      analysis,
      max_age_hours: maxAgeHours
    });

  } catch (error) {
    console.error('Get stuck videos analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}