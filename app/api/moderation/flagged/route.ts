import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabase
      .from('flagged_content_queue')
      .select(`
        *,
        user_profiles!user_id(
          clerk_user_id,
          username,
          full_name
        ),
        reporter:user_profiles!reporter_id(
          clerk_user_id,
          username,
          full_name
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching flagged content:', error);
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
      content_type,
      content_id,
      user_id,
      content_text,
      flag_reason,
      severity = 'medium',
      reporter_id
    } = body;

    // Validation
    if (!content_type || !content_id || !content_text || !flag_reason) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content type, ID, text, and reason are required' 
      }, { status: 400 });
    }

    const validContentTypes = ['chat_message', 'interaction', 'poll', 'quiz'];
    if (!validContentTypes.includes(content_type)) {
      return NextResponse.json({ success: false, error: 'Invalid content type' }, { status: 400 });
    }

    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json({ success: false, error: 'Invalid severity level' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('flagged_content_queue')
      .insert({
        content_type,
        content_id,
        user_id,
        content_text,
        flag_reason,
        severity,
        reporter_id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error flagging content:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}