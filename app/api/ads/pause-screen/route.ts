import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    // Fetch the highest priority active pause screen ad
    const { data, error } = await supabase
      .from('pause_ads')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching pause screen ad:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // No active ads found
    if (!data) {
      return NextResponse.json({ success: true, data: null });
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
    const { adId, action } = body;

    if (!adId || !action) {
      return NextResponse.json({ success: false, error: 'Missing adId or action' }, { status: 400 });
    }

    // Update analytics based on action
    if (action === 'impression') {
      await supabase.rpc('increment_impression', { ad_id: adId });
    } else if (action === 'click') {
      await supabase.rpc('increment_click', { ad_id: adId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking ad action:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}