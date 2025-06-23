import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const channel = searchParams.get('channel');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('content')
      .select(`
        *,
        channels(name, slug, category)
      `)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (channel) {
      query = query.eq('channel_id', channel);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (status) {
      if (status === 'published') {
        query = query.eq('is_published', true);
      } else if (status === 'draft') {
        query = query.eq('is_published', false);
      }
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Get total count for pagination
    const { count } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true });
    
    // Get paginated results
    const { data: content, error } = await query
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Content fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch content' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: content || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: offset + limit < (count || 0),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const {
      title,
      description,
      channel_id,
      cloudflare_video_id,
      thumbnail_url,
      duration,
      category,
      genre,
      keywords = [],
      language = 'English',
      instructor,
      difficulty_level = 'Beginner',
      target_audience,
      learning_objectives = [],
      prerequisites = [],
      tags = [],
      is_featured = false,
      is_published = false,
      metadata = {},
    } = body;
    
    // Validate required fields
    if (!title || !cloudflare_video_id) {
      return NextResponse.json(
        { error: 'Title and Cloudflare video ID are required' },
        { status: 400 }
      );
    }
    
    const { data: content, error } = await supabase
      .from('content')
      .insert([{
        title,
        description,
        channel_id,
        cloudflare_video_id,
        thumbnail_url,
        duration,
        category,
        genre,
        keywords,
        language,
        instructor,
        difficulty_level,
        target_audience,
        learning_objectives,
        prerequisites,
        tags,
        is_featured,
        is_published,
        sync_status: 'manual',
        last_synced_at: new Date().toISOString(),
        metadata,
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Content creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create content' },
        { status: 500 }
      );
    }
    
    // Revalidate cache
    revalidateTag('content');
    
    return NextResponse.json({
      success: true,
      data: content,
      message: 'Content created successfully',
    });
  } catch (error) {
    console.error('Content creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }
    
    const { data: content, error } = await supabase
      .from('content')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Content update error:', error);
      return NextResponse.json(
        { error: 'Failed to update content' },
        { status: 500 }
      );
    }
    
    // Revalidate cache
    revalidateTag('content');
    
    return NextResponse.json({
      success: true,
      data: content,
      message: 'Content updated successfully',
    });
  } catch (error) {
    console.error('Content update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Content deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete content' },
        { status: 500 }
      );
    }
    
    // Revalidate cache
    revalidateTag('content');
    
    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    console.error('Content deletion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}