import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      // Return empty channels list if Supabase not configured
      return NextResponse.json({
        channels: [],
        message: 'Database not configured'
      });
    }

    const { data: channels, error } = await supabase
      .from('channels')
      .select('id, name, category, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching channels:', error);
      return NextResponse.json(
        { error: 'Failed to fetch channels', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      channels: channels || [],
      total: channels?.length || 0
    });

  } catch (error) {
    console.error('Channels API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, description, category } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data: channel, error } = await supabase
      .from('channels')
      .insert({
        name,
        slug,
        description: description || null,
        category,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating channel:', error);
      return NextResponse.json(
        { error: 'Failed to create channel', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      channel,
      message: 'Channel created successfully'
    });

  } catch (error) {
    console.error('Channel creation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}