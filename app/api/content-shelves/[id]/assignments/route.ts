import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }
    const { id: shelfId } = params;

    const { data, error } = await supabase
      .from('content_shelf_assignments')
      .select(`
        id,
        display_order,
        content (
          id,
          title,
          description,
          cloudflare_video_id,
          thumbnail_url,
          duration,
          category,
          genre,
          tags,
          content_type,
          is_featured,
          is_published,
          view_count,
          like_count,
          created_at,
          updated_at
        )
      `)
      .eq('shelf_id', shelfId)
      .order('display_order');

    if (error) {
      console.error('Error fetching shelf assignments:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }
    const { id: shelfId } = params;
    const body = await request.json();
    const { content_id, display_order } = body;

    if (!content_id) {
      return NextResponse.json({ success: false, error: 'Content ID is required' }, { status: 400 });
    }

    // Check if assignment already exists
    const { data: existing } = await supabase
      .from('content_shelf_assignments')
      .select('id')
      .eq('shelf_id', shelfId)
      .eq('content_id', content_id)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: 'Content already assigned to this shelf' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('content_shelf_assignments')
      .insert({
        shelf_id: shelfId,
        content_id,
        display_order: display_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }
    const { id: shelfId } = params;
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('content_id');

    if (!contentId) {
      return NextResponse.json({ success: false, error: 'Content ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('content_shelf_assignments')
      .delete()
      .eq('shelf_id', shelfId)
      .eq('content_id', contentId);

    if (error) {
      console.error('Error removing assignment:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}