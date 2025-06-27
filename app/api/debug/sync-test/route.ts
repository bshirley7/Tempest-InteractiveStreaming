/**
 * Debug sync test endpoint - helps identify sync issues
 * This is a temporary diagnostic endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Test 1: Check if channels table exists and has data
    console.log('Testing channels table...');
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('id, name, slug, is_active')
      .limit(5);
    
    // Test 2: Check if content table exists  
    console.log('Testing content table...');
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id, title, cloudflare_video_id')
      .limit(5);
    
    // Test 3: Try to create a test channel (then delete it)
    console.log('Testing channel creation...');
    const testChannelData = {
      name: 'Test Channel - DELETE ME',
      slug: 'test-channel-delete-me',
      description: 'Temporary test channel',
      is_active: true,
      category: 'test',
      created_at: new Date().toISOString()
    };
    
    const { data: testChannel, error: createChannelError } = await supabase
      .from('channels')
      .insert([testChannelData])
      .select('id, name')
      .single();
    
    // Clean up test channel
    let deleteChannelError = null;
    if (testChannel) {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', testChannel.id);
      deleteChannelError = error;
    }
    
    // Test 4: Try to insert test content (then delete it)
    console.log('Testing content insertion...');
    let testContentResult = null;
    let deleteContentError = null;
    
    if (channels && channels.length > 0) {
      const testContentData = {
        title: 'Test Video - DELETE ME',
        cloudflare_video_id: 'test-video-id-12345',
        channel_id: channels[0].id,
        description: 'Temporary test content',
        created_at: new Date().toISOString()
      };
      
      const { data: testContent, error: createContentError } = await supabase
        .from('content')
        .insert([testContentData])
        .select('id, title')
        .single();
      
      testContentResult = {
        success: !!testContent,
        error: createContentError?.message,
        data: testContent
      };
      
      // Clean up test content
      if (testContent) {
        const { error } = await supabase
          .from('content')
          .delete()
          .eq('id', testContent.id);
        deleteContentError = error;
      }
    }
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      tests: {
        channels_table: {
          accessible: !channelsError,
          error: channelsError?.message,
          count: channels?.length || 0,
          sample_data: channels?.slice(0, 2)
        },
        content_table: {
          accessible: !contentError,
          error: contentError?.message,
          count: content?.length || 0,
          sample_data: content?.slice(0, 2)
        },
        channel_creation: {
          success: !!testChannel,
          error: createChannelError?.message,
          cleanup_success: !deleteChannelError,
          cleanup_error: deleteChannelError?.message
        },
        content_insertion: testContentResult ? {
          ...testContentResult,
          cleanup_success: !deleteContentError,
          cleanup_error: deleteContentError?.message
        } : {
          skipped: 'No channels available for test'
        }
      },
      summary: {
        all_tests_passed: !channelsError && !contentError && !!testChannel && (testContentResult?.success !== false),
        can_read_channels: !channelsError,
        can_create_channels: !!testChannel && !createChannelError,
        can_read_content: !contentError,
        can_insert_content: testContentResult?.success === true
      }
    };
    
    return NextResponse.json(diagnostics);
    
  } catch (error) {
    console.error('Sync test error:', error);
    return NextResponse.json(
      { 
        error: 'Sync test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}