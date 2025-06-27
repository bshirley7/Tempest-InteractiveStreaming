import { NextRequest, NextResponse } from 'next/server';
import { getStreamVideo } from '@/lib/stream-api';

/**
 * Verify that a video upload completed successfully in Cloudflare Stream
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, timeoutSeconds = 300 } = body; // 5 minute default timeout

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    console.log(`Verifying upload for video ${videoId} with ${timeoutSeconds}s timeout`);

    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;
    let attempts = 0;
    
    while (Date.now() - startTime < timeoutMs) {
      attempts++;
      
      try {
        console.log(`Attempt ${attempts}: Checking video ${videoId} status`);
        const video = await getStreamVideo(videoId);
        
        console.log(`Video ${videoId} status:`, {
          state: video.status.state,
          readyToStream: video.readyToStream,
          pctComplete: video.status.pctComplete
        });

        // Check if upload is complete
        if (video.status.state === 'ready' && video.readyToStream) {
          return NextResponse.json({
            success: true,
            status: 'completed',
            video: {
              uid: video.uid,
              state: video.status.state,
              readyToStream: video.readyToStream,
              duration: video.duration,
              thumbnail: video.thumbnail,
              meta: video.meta
            },
            attempts,
            elapsedSeconds: Math.round((Date.now() - startTime) / 1000)
          });
        }

        // Check for failed states
        if (video.status.state === 'error') {
          return NextResponse.json({
            success: false,
            status: 'failed',
            error: `Video processing failed: ${video.status.errorReasonText || 'Unknown error'}`,
            errorCode: video.status.errorReasonCode,
            video: {
              uid: video.uid,
              state: video.status.state,
              errorReasonText: video.status.errorReasonText,
              errorReasonCode: video.status.errorReasonCode
            },
            attempts,
            elapsedSeconds: Math.round((Date.now() - startTime) / 1000)
          });
        }

        // Still pending/processing - continue waiting
        if (['pendingupload', 'downloading', 'queued', 'inprogress'].includes(video.status.state)) {
          console.log(`Video ${videoId} still processing: ${video.status.state} (${video.status.pctComplete}% complete)`);
          
          // Return intermediate status for long-running processes
          if (attempts % 10 === 0) { // Every 10th attempt
            return NextResponse.json({
              success: true,
              status: 'processing',
              video: {
                uid: video.uid,
                state: video.status.state,
                pctComplete: video.status.pctComplete,
                readyToStream: video.readyToStream
              },
              attempts,
              elapsedSeconds: Math.round((Date.now() - startTime) / 1000),
              estimatedCompletion: video.status.pctComplete ? 
                Math.round((100 - parseInt(video.status.pctComplete)) / 10) : null // rough estimate
            });
          }

          // Wait before next check (exponential backoff)
          const waitTime = Math.min(5000, 1000 + (attempts * 100)); // Start at 1s, max 5s
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // Unknown state
        console.warn(`Unknown video state: ${video.status.state}`);
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (fetchError) {
        console.error(`Error fetching video ${videoId} on attempt ${attempts}:`, fetchError);
        
        // If video not found, it might not exist yet - wait a bit
        if (fetchError.message.includes('404')) {
          console.log(`Video ${videoId} not found yet, waiting...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }

        // Other errors - wait less time
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Timeout reached
    console.log(`Timeout reached for video ${videoId} after ${attempts} attempts`);
    
    // Try one final status check
    try {
      const finalVideo = await getStreamVideo(videoId);
      return NextResponse.json({
        success: false,
        status: 'timeout',
        message: `Upload verification timed out after ${timeoutSeconds} seconds`,
        video: {
          uid: finalVideo.uid,
          state: finalVideo.status.state,
          pctComplete: finalVideo.status.pctComplete,
          readyToStream: finalVideo.readyToStream
        },
        attempts,
        elapsedSeconds: Math.round((Date.now() - startTime) / 1000)
      });
    } catch {
      return NextResponse.json({
        success: false,
        status: 'timeout',
        message: `Upload verification timed out after ${timeoutSeconds} seconds`,
        error: 'Video not accessible after timeout',
        attempts,
        elapsedSeconds: Math.round((Date.now() - startTime) / 1000)
      });
    }

  } catch (error) {
    console.error('Upload verification API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Check current status of a video without waiting
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const video = await getStreamVideo(videoId);
    
    return NextResponse.json({
      success: true,
      video: {
        uid: video.uid,
        state: video.status.state,
        pctComplete: video.status.pctComplete,
        readyToStream: video.readyToStream,
        duration: video.duration,
        thumbnail: video.thumbnail,
        meta: video.meta,
        errorReasonText: video.status.errorReasonText,
        errorReasonCode: video.status.errorReasonCode
      }
    });

  } catch (error) {
    console.error('Video status check error:', error);
    
    if (error.message.includes('404')) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to check video status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}