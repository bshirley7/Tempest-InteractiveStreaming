/**
 * API route for Cloudflare Stream operations
 */
import { NextRequest, NextResponse } from 'next/server';
import { 
  listStreamVideos, 
  getStreamVideo, 
  deleteStreamVideo, 
  updateStreamVideo,
  getStreamUploadUrl,
  createLiveInput
} from '@/lib/stream-api';
import { isCloudflareStreamConfigured } from '@/lib/cloudflare';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  try {
    console.log('Stream API GET request received');
    console.log('Environment variables check:');
    console.log('- CLOUDFLARE_ACCOUNT_ID:', process.env.CLOUDFLARE_ACCOUNT_ID ? '✅ Set' : '❌ Missing');
    console.log('- CLOUDFLARE_STREAM_API_TOKEN:', process.env.CLOUDFLARE_STREAM_API_TOKEN ? '✅ Set' : '❌ Missing');
    console.log('- CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN:', process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN ? '✅ Set' : '❌ Missing');
    
    if (!isCloudflareStreamConfigured()) {
      console.error('Cloudflare Stream not configured');
      console.error('Missing configuration. Please set these environment variables:');
      console.error('- CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_STREAM_API_TOKEN, CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN');
      return NextResponse.json(
        { error: 'Cloudflare Stream is not properly configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');

    if (videoId) {
      console.log('Fetching specific video:', videoId);
      // Get specific video
      const video = await getStreamVideo(videoId);
      return NextResponse.json({ success: true, video });
    } else {
      console.log('Listing videos with options:', { search, limit, status });
      // List videos
      const options: any = {};
      if (search) options.search = search;
      if (limit) options.limit = parseInt(limit);
      if (status) options.status = status;

      const videos = await listStreamVideos(options);
      console.log('Found videos:', videos?.length || 0);
      return NextResponse.json({ success: true, videos });
    }

  } catch (error) {
    console.error('Stream API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    console.error('Detailed error:', errorMessage);
    Sentry.captureException(error);
    
    return NextResponse.json(
      { error: `Stream operation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Stream API POST request received');
    
    if (!isCloudflareStreamConfigured()) {
      console.error('POST - Cloudflare Stream not configured');
      return NextResponse.json(
        { error: 'Cloudflare Stream is not properly configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('POST request body:', body);
    const { action, ...data } = body;

    switch (action) {
      case 'getUploadUrl':
        console.log('Getting upload URL for:', data);
        const uploadResult = await getStreamUploadUrl(data);
        console.log('Upload URL result:', uploadResult);
        return NextResponse.json({ success: true, ...uploadResult });

      case 'createLiveInput':
        console.log('Creating live input:', data);
        const liveInput = await createLiveInput(data);
        return NextResponse.json({ success: true, liveInput });

      case 'updateVideo':
        console.log('Updating video:', data.videoId, data.metadata);
        if (!data.videoId) {
          console.error('Missing videoId for update operation');
          return NextResponse.json(
            { error: 'videoId is required for update' },
            { status: 400 }
          );
        }
        
        // Log the metadata being sent to Cloudflare
        console.log('Sending metadata to Cloudflare:', data.metadata);
        
        const updatedVideo = await updateStreamVideo(data.videoId, data.metadata);
        console.log('Video updated successfully:', updatedVideo.uid);
        return NextResponse.json({ success: true, video: updatedVideo });

      default:
        console.error('Invalid action:', action);
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Stream API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    console.error('Detailed POST error:', errorMessage);
    Sentry.captureException(error);
    
    return NextResponse.json(
      { error: `Stream operation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('Stream API DELETE request received');
    
    if (!isCloudflareStreamConfigured()) {
      console.error('DELETE - Cloudflare Stream not configured');
      return NextResponse.json(
        { error: 'Cloudflare Stream is not properly configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    console.log('Deleting video:', videoId);
    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId is required' },
        { status: 400 }
      );
    }

    const success = await deleteStreamVideo(videoId);
    console.log('Delete result:', success);
    return NextResponse.json({ success });

  } catch (error) {
    console.error('Stream delete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('DELETE Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    console.error('Detailed DELETE error:', errorMessage);
    Sentry.captureException(error);
    
    return NextResponse.json(
      { error: `Delete operation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}