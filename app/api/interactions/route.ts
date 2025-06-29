import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channel_id');
    const contentId = searchParams.get('content_id');
    const type = searchParams.get('type');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('interactions')
      .select(`
        *,
        content (
          id,
          title
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (channelId) {
      query = query.eq('channel_id', channelId);
    }
    if (contentId) {
      query = query.eq('content_id', contentId);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching interactions:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { 
      type, 
      title, 
      description, 
      options, 
      correct_answer, 
      channel_id, 
      content_id, 
      created_by,
      is_active = true,
      starts_at,
      ends_at,
      metadata = {}
    } = body;

    // Validation
    if (!type || !title) {
      return NextResponse.json({ success: false, error: 'Type and title are required' }, { status: 400 });
    }

    if (['poll', 'quiz'].includes(type) && (!options || !Array.isArray(options) || options.length === 0)) {
      return NextResponse.json({ success: false, error: 'Options are required for polls and quizzes' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('interactions')
      .insert({
        type,
        title,
        description,
        options,
        correct_answer,
        channel_id,
        content_id,
        created_by,
        is_active,
        starts_at,
        ends_at,
        metadata,
        results: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating interaction:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { 
      id,
      type, 
      title, 
      description, 
      options, 
      correct_answer, 
      channel_id, 
      content_id, 
      is_active,
      starts_at,
      ends_at,
      metadata = {}
    } = body;

    // Validation
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required for updates' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('interactions')
      .update({
        type,
        title,
        description,
        options,
        correct_answer,
        channel_id,
        content_id,
        is_active,
        starts_at,
        ends_at,
        metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating interaction:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { id } = body;

    // Validation
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required for deletion' }, { status: 400 });
    }

    const { error } = await supabase
      .from('interactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting interaction:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}