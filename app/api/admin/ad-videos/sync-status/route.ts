import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getStreamVideo } from '@/lib/stream-api';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { video_id, check_all } = body;

    let videosToCheck: any[] = [];

    if (check_all) {
      // Get all ad videos that are pending or have unknown status
      const { data: allVideos, error: fetchError } = await supabase
        .from('ad_videos')
        .select('id, cloudflare_video_id, approval_status')
        .in('approval_status', ['pending', 'processing', 'uploaded']);

      if (fetchError) {
        console.error('Error fetching ad videos:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch ad videos' },
          { status: 500 }
        );
      }

      videosToCheck = allVideos || [];
    } else if (video_id) {
      // Check specific video
      const { data: video, error: fetchError } = await supabase
        .from('ad_videos')
        .select('id, cloudflare_video_id, approval_status')
        .eq('id', video_id)
        .single();

      if (fetchError || !video) {
        return NextResponse.json(
          { error: 'Video not found' },
          { status: 404 }
        );
      }

      videosToCheck = [video];
    } else {
      return NextResponse.json(
        { error: 'Either video_id or check_all must be provided' },
        { status: 400 }
      );
    }

    const results = [];
    let updatedCount = 0;
    let errorCount = 0;

    for (const video of videosToCheck) {
      try {
        // Get video status from Cloudflare Stream
        const streamVideo = await getStreamVideo(video.cloudflare_video_id);
        
        // Determine approval status based on Cloudflare Stream status
        let newApprovalStatus = video.approval_status;
        let isActive = true;
        
        // Map Cloudflare Stream status to our approval status
        switch (streamVideo.status.state) {
          case 'ready':
            newApprovalStatus = streamVideo.readyToStream ? 'approved' : 'processing';
            break;
          case 'inprogress':
          case 'queued':
            newApprovalStatus = 'processing';
            break;
          case 'pendingupload':
            newApprovalStatus = 'pending';
            isActive = false;
            break;
          case 'downloading':
            newApprovalStatus = 'processing';
            break;
          case 'error':
            newApprovalStatus = 'rejected';
            isActive = false;
            break;
          default:
            console.warn(`Unknown Cloudflare Stream status: ${streamVideo.status.state}`);
            newApprovalStatus = 'pending';
        }

        // Update database if status changed
        if (newApprovalStatus !== video.approval_status) {
          const updateData: any = {
            approval_status: newApprovalStatus,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          };

          // Update additional metadata from Cloudflare Stream
          if (streamVideo.duration && streamVideo.duration > 0) {
            updateData.duration = Math.round(streamVideo.duration);
          }
          
          if (streamVideo.thumbnail) {
            updateData.thumbnail_url = streamVideo.thumbnail;
          }

          if (streamVideo.size) {
            updateData.file_size = streamVideo.size;
          }

          // Update metadata with stream info
          const metadata = {
            cloudflare_status: streamVideo.status,
            cloudflare_meta: streamVideo.meta,
            last_sync: new Date().toISOString(),
          };
          updateData.metadata = metadata;

          const { error: updateError } = await supabase
            .from('ad_videos')
            .update(updateData)
            .eq('id', video.id);

          if (updateError) {
            console.error(`Error updating video ${video.id}:`, updateError);
            errorCount++;
            results.push({
              video_id: video.id,
              cloudflare_video_id: video.cloudflare_video_id,
              status: 'error',
              error: updateError.message,
            });
          } else {
            updatedCount++;
            results.push({
              video_id: video.id,
              cloudflare_video_id: video.cloudflare_video_id,
              status: 'updated',
              old_status: video.approval_status,
              new_status: newApprovalStatus,
              cloudflare_state: streamVideo.status.state,
              ready_to_stream: streamVideo.readyToStream,
            });
          }
        } else {
          results.push({
            video_id: video.id,
            cloudflare_video_id: video.cloudflare_video_id,
            status: 'no_change',
            current_status: video.approval_status,
            cloudflare_state: streamVideo.status.state,
            ready_to_stream: streamVideo.readyToStream,
          });
        }

      } catch (streamError) {
        console.error(`Error checking Cloudflare Stream video ${video.cloudflare_video_id}:`, streamError);
        errorCount++;
        
        // If video not found in Cloudflare, mark as rejected
        if (streamError.message.includes('404') || streamError.message.includes('not found')) {
          const { error: updateError } = await supabase
            .from('ad_videos')
            .update({
              approval_status: 'rejected',
              is_active: false,
              metadata: {
                error: 'Video not found in Cloudflare Stream',
                last_sync: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', video.id);

          if (!updateError) {
            updatedCount++;
          }

          results.push({
            video_id: video.id,
            cloudflare_video_id: video.cloudflare_video_id,
            status: 'not_found_in_cloudflare',
            error: 'Video not found in Cloudflare Stream - marked as rejected',
          });
        } else {
          results.push({
            video_id: video.id,
            cloudflare_video_id: video.cloudflare_video_id,
            status: 'error',
            error: streamError.message,
          });
        }
      }
    }

    // Revalidate cache if any updates were made
    if (updatedCount > 0) {
      revalidateTag('ad-videos');
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${videosToCheck.length} videos. Updated: ${updatedCount}, Errors: ${errorCount}`,
      summary: {
        total_checked: videosToCheck.length,
        updated: updatedCount,
        errors: errorCount,
        no_change: videosToCheck.length - updatedCount - errorCount,
      },
      results,
    });

  } catch (error) {
    console.error('Ad video sync status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get summary of video statuses
    const { data: statusCounts, error } = await supabase
      .from('ad_videos')
      .select('approval_status, is_active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching video status summary:', error);
      return NextResponse.json(
        { error: 'Failed to fetch video status summary' },
        { status: 500 }
      );
    }

    // Count videos by status
    const summary = statusCounts.reduce((acc: any, video: any) => {
      const status = video.approval_status;
      acc[status] = (acc[status] || 0) + 1;
      if (!video.is_active) {
        acc.inactive = (acc.inactive || 0) + 1;
      }
      return acc;
    }, {});

    // Get videos that might need status updates
    const needsUpdate = statusCounts.filter((video: any) => 
      ['pending', 'processing', 'uploaded'].includes(video.approval_status)
    ).length;

    return NextResponse.json({
      success: true,
      summary: {
        total: statusCounts.length,
        by_status: summary,
        needs_update: needsUpdate,
        last_checked: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Ad video status summary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}