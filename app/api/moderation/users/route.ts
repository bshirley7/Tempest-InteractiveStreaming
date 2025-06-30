import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const filter = searchParams.get('filter'); // 'banned', 'shadow_banned', 'violations'

    let query = supabase
      .from('user_moderation_status')
      .select(`
        *,
        user_profiles!user_id(
          clerk_user_id,
          username,
          full_name,
          email
        )
      `)
      .order('last_violation_at', { ascending: false, nullsLast: true })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (filter === 'banned') {
      query = query.eq('is_banned', true);
    } else if (filter === 'shadow_banned') {
      query = query.eq('is_shadow_banned', true);
    } else if (filter === 'violations') {
      query = query.gt('violation_count', 0);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user moderation status:', error);
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
      user_id,
      is_banned = false,
      is_shadow_banned = false,
      banned_until,
      ban_reason,
      moderator_id
    } = body;

    // Validation
    if (!user_id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const updateData: any = {
      is_banned,
      is_shadow_banned,
      ban_reason,
      moderator_id,
      updated_at: new Date().toISOString()
    };

    if (banned_until) {
      updateData.banned_until = banned_until;
    }

    // Try to update existing record first
    const { data: existing } = await supabase
      .from('user_moderation_status')
      .select('id')
      .eq('user_id', user_id)
      .single();

    let result;
    if (existing) {
      // Update existing record
      result = await supabase
        .from('user_moderation_status')
        .update(updateData)
        .eq('user_id', user_id)
        .select()
        .single();
    } else {
      // Create new record
      result = await supabase
        .from('user_moderation_status')
        .insert({
          user_id,
          ...updateData,
          violation_count: 0,
          warning_count: 0
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error updating user moderation status:', result.error);
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}