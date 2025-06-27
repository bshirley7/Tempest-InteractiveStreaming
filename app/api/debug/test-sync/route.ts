/**
 * Simple test sync endpoint to debug the 500 error
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Test 1: Authentication
    console.log('Step 1: Testing authentication...');
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No user ID' }, { status: 401 });
    }
    console.log('✅ Auth successful, user:', userId);

    // Test 2: Import stream API
    console.log('Step 2: Testing stream API import...');
    const { listStreamVideos } = await import('@/lib/stream-api');
    console.log('✅ Stream API imported successfully');

    // Test 3: Call Cloudflare API
    console.log('Step 3: Testing Cloudflare API call...');
    const streamVideos = await listStreamVideos({ limit: 5 });
    console.log(`✅ Retrieved ${streamVideos.length} videos from Cloudflare`);

    // Test 4: Import sync function
    console.log('Step 4: Testing sync function import...');
    const { syncSingleVideo } = await import('@/lib/content-library-sync');
    console.log('✅ Sync function imported successfully');

    // Test 5: Database connection
    console.log('Step 5: Testing database connection...');
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    
    const { data: testQuery, error: dbError } = await supabase
      .from('content')
      .select('id')
      .limit(1);
      
    if (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: dbError.message,
        step: 'database_connection'
      }, { status: 500 });
    }
    console.log('✅ Database connection successful');

    // Test 6: Find a ready video
    console.log('Step 6: Finding ready videos...');
    const readyVideos = streamVideos.filter(v => 
      v.status?.state === 'ready' && v.readyToStream
    );
    console.log(`✅ Found ${readyVideos.length} ready videos`);

    if (readyVideos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All tests passed, but no ready videos to sync',
        steps_completed: 6,
        cloudflare_videos: streamVideos.length,
        ready_videos: 0
      });
    }

    // Test 7: Try syncing one video
    console.log('Step 7: Testing single video sync...');
    const testVideo = readyVideos[0];
    console.log(`Testing with video: ${testVideo.uid} - ${testVideo.meta?.name || 'Unnamed'}`);
    
    const syncResult = await syncSingleVideo(testVideo);
    console.log('✅ Single video sync successful:', syncResult);

    return NextResponse.json({
      success: true,
      message: 'All tests passed successfully!',
      steps_completed: 7,
      test_video: {
        id: testVideo.uid,
        name: testVideo.meta?.name || 'Unnamed',
        sync_result: syncResult
      },
      cloudflare_videos: streamVideos.length,
      ready_videos: readyVideos.length
    });

  } catch (error) {
    console.error('❌ Test sync failed at step:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Test sync endpoint - use POST to run tests',
    available_tests: [
      'Authentication',
      'Stream API import',
      'Cloudflare API call', 
      'Sync function import',
      'Database connection',
      'Find ready videos',
      'Single video sync'
    ]
  });
}