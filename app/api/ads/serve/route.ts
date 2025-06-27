import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

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
    const content_id = searchParams.get('content_id');
    const channel_id = searchParams.get('channel_id');
    const placement_type = searchParams.get('placement_type') || 'pre_roll';
    const user_id = searchParams.get('user_id'); // Clerk user ID (optional for anonymous users)
    const session_id = searchParams.get('session_id');
    const limit = parseInt(searchParams.get('limit') || '1');

    // Validate placement_type
    const validPlacementTypes = ['pre_roll', 'mid_roll', 'end_roll'];
    if (!validPlacementTypes.includes(placement_type)) {
      return NextResponse.json(
        { error: 'Invalid placement type. Must be one of: pre_roll, mid_roll, end_roll' },
        { status: 400 }
      );
    }

    // Either content_id or channel_id should be provided
    if (!content_id && !channel_id) {
      return NextResponse.json(
        { error: 'Either content_id or channel_id must be provided' },
        { status: 400 }
      );
    }

    // Use the database function to get applicable ads
    const { data: ads, error } = await supabase
      .rpc('get_applicable_ads', {
        p_content_id: content_id,
        p_channel_id: channel_id,
        p_placement_type: placement_type,
        p_user_id: user_id
      })
      .limit(limit);

    if (error) {
      console.error('Error fetching ads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ads' },
        { status: 500 }
      );
    }

    // If no ads found, return empty array
    if (!ads || ads.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No ads available for this placement',
      });
    }

    // Select ads based on weight (weighted random selection)
    const selectedAds = selectAdsByWeight(ads, limit);

    // Format the response
    const formattedAds = selectedAds.map(ad => ({
      placement_id: ad.placement_id,
      ad_video: {
        id: ad.ad_video_id,
        cloudflare_video_id: ad.cloudflare_video_id,
      },
      overlay: ad.overlay_asset_id ? {
        id: ad.overlay_asset_id,
        url: ad.overlay_url,
      } : null,
      content: {
        ad_copy: ad.ad_copy,
        call_to_action: ad.call_to_action,
        click_url: ad.click_url,
      },
      settings: {
        display_duration: ad.display_duration,
        skip_after_seconds: ad.skip_after_seconds,
        priority: ad.priority,
      },
      tracking: {
        session_id: session_id,
        placement_type: placement_type,
        content_id: content_id,
        channel_id: channel_id,
        user_id: user_id,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedAds,
      placement_type: placement_type,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Ad serving API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      placement_id,
      event_type,
      user_id,
      content_id,
      channel_id,
      session_id,
      user_agent,
      ip_address,
      watch_time_seconds,
      event_data = {}
    } = body;

    // Validate required fields
    if (!placement_id || !event_type) {
      return NextResponse.json(
        { error: 'Placement ID and event type are required' },
        { status: 400 }
      );
    }

    // Validate event_type
    const validEventTypes = ['impression', 'click', 'completion', 'skip', 'error'];
    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json(
        { error: 'Invalid event type. Must be one of: impression, click, completion, skip, error' },
        { status: 400 }
      );
    }

    // Get client IP address from headers if not provided
    const clientIp = ip_address || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'unknown';

    // Get user agent from headers if not provided
    const clientUserAgent = user_agent || request.headers.get('user-agent') || 'unknown';

    // Use the database function to record analytics
    const { data: analyticsId, error } = await supabase
      .rpc('record_ad_analytics', {
        p_placement_id: placement_id,
        p_event_type: event_type,
        p_user_id: user_id,
        p_content_id: content_id,
        p_channel_id: channel_id,
        p_session_id: session_id,
        p_user_agent: clientUserAgent,
        p_ip_address: clientIp,
        p_watch_time_seconds: watch_time_seconds,
        p_event_data: event_data
      });

    if (error) {
      console.error('Error recording ad analytics:', error);
      return NextResponse.json(
        { error: 'Failed to record analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analytics_id: analyticsId,
      message: 'Analytics recorded successfully',
    });

  } catch (error) {
    console.error('Ad analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function for weighted random selection
function selectAdsByWeight(ads: any[], limit: number): any[] {
  if (ads.length <= limit) {
    return ads;
  }

  // Calculate total weight
  const totalWeight = ads.reduce((sum, ad) => sum + (ad.weight || 1), 0);
  
  const selected: any[] = [];
  const remaining = [...ads];

  for (let i = 0; i < limit && remaining.length > 0; i++) {
    // Recalculate total weight for remaining ads
    const currentTotalWeight = remaining.reduce((sum, ad) => sum + (ad.weight || 1), 0);
    
    // Generate random number
    let random = Math.random() * currentTotalWeight;
    
    // Select ad based on weight
    let selectedIndex = 0;
    for (let j = 0; j < remaining.length; j++) {
      random -= remaining[j].weight || 1;
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }
    
    // Add selected ad and remove from remaining
    selected.push(remaining[selectedIndex]);
    remaining.splice(selectedIndex, 1);
  }

  return selected;
}