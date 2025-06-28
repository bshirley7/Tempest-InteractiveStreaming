import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }
    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get('include_content') === 'true';

    let query = supabase
      .from('content_shelves')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    const { data: shelves, error } = await query;

    if (error) {
      console.error('Error fetching shelves:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (includeContent) {
      // Fetch content for each shelf
      const shelvesWithContent = await Promise.all(
        shelves.map(async (shelf) => {
          const { data: assignments } = await supabase
            .from('content_shelf_assignments')
            .select(`
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
            .eq('shelf_id', shelf.id)
            .order('display_order')
            .limit(shelf.max_items || 12);

          return {
            ...shelf,
            content: assignments?.map(a => a.content).filter(Boolean) || []
          };
        })
      );

      return NextResponse.json({ success: true, data: shelvesWithContent });
    }

    return NextResponse.json({ success: true, data: shelves });
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

    const { name, description, layout_style, aspect_ratio, max_items, display_order } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('content_shelves')
      .insert({
        name,
        description,
        layout_style: layout_style || 'row',
        aspect_ratio: aspect_ratio || '16:9',
        max_items: max_items || 12,
        display_order: display_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating shelf:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}