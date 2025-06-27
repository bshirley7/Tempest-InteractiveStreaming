import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    console.log('Content-channels POST API called');
    
    const supabase = createServiceClient();
    
    if (!supabase) {
      console.error('Supabase service client not available - check SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json(
        { error: 'Database service role not configured. Contact administrator.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { content_id, channel_id } = body;
    
    if (!content_id || !channel_id) {
      return NextResponse.json(
        { error: 'Content ID and Channel ID are required' },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const { data: existing, error: checkError } = await supabase
      .from('content_channels')
      .select('*')
      .eq('content_id', content_id)
      .eq('channel_id', channel_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing assignment:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing assignment' },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Content is already assigned to this channel' },
        { status: 409 }
      );
    }

    // Create new assignment
    console.log('Creating assignment:', { content_id, channel_id });
    
    const { data, error } = await supabase
      .from('content_channels')
      .insert({
        content_id,
        channel_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Return specific error message based on error code
      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Row Level Security policy violation. Please check database permissions.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: error.message || 'Failed to create assignment',
          code: error.code,
          details: error.details 
        },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('content');
    revalidateTag('content-channels');

    return NextResponse.json({
      success: true,
      data,
      message: 'Content assigned to channel successfully',
    });
  } catch (error) {
    console.error('Content-channels API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { content_id, channel_id } = await request.json();
    
    if (!content_id || !channel_id) {
      return NextResponse.json(
        { error: 'Content ID and Channel ID are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('content_channels')
      .delete()
      .eq('content_id', content_id)
      .eq('channel_id', channel_id);

    if (error) {
      console.error('Error deleting assignment:', error);
      return NextResponse.json(
        { error: 'Failed to delete assignment' },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('content');
    revalidateTag('content-channels');

    return NextResponse.json({
      success: true,
      message: 'Assignment removed successfully',
    });
  } catch (error) {
    console.error('Content-channels DELETE API error:', error);
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

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('content_id');
    const channelId = searchParams.get('channel_id');

    let query = supabase
      .from('content_channels')
      .select(`
        content_id,
        channel_id,
        content:content_id(id, title, cloudflare_video_id, thumbnail_url),
        channels:channel_id(id, name)
      `);

    if (contentId) {
      query = query.eq('content_id', contentId);
    }

    if (channelId) {
      query = query.eq('channel_id', channelId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching assignments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch assignments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Content-channels GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}