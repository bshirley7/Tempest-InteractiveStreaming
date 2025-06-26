import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Fetch content by ID with channel information
    const { data: content, error } = await supabase
      .from('content')
      .select(`
        *,
        channels(name, slug, category)
      `)
      .eq('id', params.id)
      .single();
    
    if (error) {
      console.error('Content fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch content' },
        { status: 500 }
      );
    }
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}