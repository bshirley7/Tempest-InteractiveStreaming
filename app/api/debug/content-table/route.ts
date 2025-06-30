/**
 * Debug content table structure and test insertion
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }
    
    // First, let's see what columns exist in the content table
    console.log('Testing content table structure...');
    
    // Try to get the first record to see the column structure
    const { data: sample, error: sampleError } = await supabase
      .from('content')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('Error reading content table:', sampleError);
    }
    
    // Try to get table info (this might not work in Supabase but worth trying)
    const { data: tableInfo, error: infoError } = await supabase
      .rpc('get_table_columns', { table_name: 'content' })
      .limit(1);
    
    // Test insert with minimal data first
    const testData = {
      title: 'Test Video - DELETE ME',
      cloudflare_video_id: 'test-12345',
      created_at: new Date().toISOString()
    };
    
    console.log('Testing minimal insert...');
    const { data: insertResult, error: insertError } = await supabase
      .from('content')
      .insert([testData])
      .select('*')
      .single();
    
    let cleanupError = null;
    if (insertResult) {
      // Clean up test record
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', insertResult.id);
      cleanupError = error;
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        sample_data: {
          success: !sampleError,
          error: sampleError?.message,
          columns: sample?.[0] ? Object.keys(sample[0]) : [],
          sample_record: sample?.[0]
        },
        table_info: {
          success: !infoError,
          error: infoError?.message,
          data: tableInfo
        },
        insert_test: {
          success: !insertError,
          error: insertError?.message,
          inserted: insertResult,
          cleanup_success: !cleanupError,
          cleanup_error: cleanupError?.message
        }
      }
    });
    
  } catch (error) {
    console.error('Content table debug error:', error);
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test_video_data } = body;
    
    const supabase = createClient();
    
    // Test inserting actual video-like data
    const testVideoData = test_video_data || {
      title: 'Test Documentary Video',
      description: 'Test description',
      cloudflare_video_id: 'test-video-123',
      duration: 1234.5,
      thumbnail_url: 'https://example.com/thumb.jpg',
      preview_url: 'https://example.com/preview.mp4',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    console.log('Testing video data insert:', testVideoData);
    
    const { data: result, error } = await supabase
      .from('content')
      .insert([testVideoData])
      .select('*')
      .single();
    
    let cleanupResult = null;
    if (result) {
      const { error: cleanupError } = await supabase
        .from('content')
        .delete()
        .eq('id', result.id);
      cleanupResult = cleanupError;
    }
    
    return NextResponse.json({
      success: !error,
      error: error?.message,
      result,
      cleanup_success: !cleanupResult,
      cleanup_error: cleanupResult?.message,
      test_data: testVideoData
    });
    
  } catch (error) {
    console.error('Content table test error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}