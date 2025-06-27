import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { revalidateTag } from 'next/cache';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const placement_type = searchParams.get('placement_type');
    const target_type = searchParams.get('target_type');
    const target_id = searchParams.get('target_id');
    const campaign_id = searchParams.get('campaign_id');
    const is_active = searchParams.get('is_active');
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from('ad_placements')
      .select(`
        *,
        ad_video:ad_video_id(id, title, cloudflare_video_id, duration, advertiser_name),
        campaign:campaign_id(id, name, advertiser_name),
        overlay_asset:overlay_asset_id(id, name, cloudflare_r2_url, dimensions),
        target_content:target_id(id, title),
        target_channel:target_id(id, name),
        created_by_profile:created_by(id, full_name)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,ad_copy.ilike.%${search}%,call_to_action.ilike.%${search}%`);
    }

    if (placement_type) {
      query = query.eq('placement_type', placement_type);
    }

    if (target_type) {
      query = query.eq('target_type', target_type);
    }

    if (target_id) {
      query = query.eq('target_id', target_id);
    }

    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    if (is_active !== null && is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    // Build count query with same filters
    let countQuery = supabase
      .from('ad_placements')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,ad_copy.ilike.%${search}%,call_to_action.ilike.%${search}%`);
    }

    if (placement_type) {
      countQuery = countQuery.eq('placement_type', placement_type);
    }

    if (target_type) {
      countQuery = countQuery.eq('target_type', target_type);
    }

    if (target_id) {
      countQuery = countQuery.eq('target_id', target_id);
    }

    if (campaign_id) {
      countQuery = countQuery.eq('campaign_id', campaign_id);
    }

    if (is_active !== null && is_active !== undefined) {
      countQuery = countQuery.eq('is_active', is_active === 'true');
    }

    // Get total count for pagination
    const { count } = await countQuery;

    // Get paginated results
    const { data: placements, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Ad placements fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ad placements' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: placements || [],
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
    console.error('Ad placements API error:', error);
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
      name,
      ad_video_id,
      campaign_id,
      overlay_asset_id,
      placement_type,
      target_type,
      target_id,
      ad_copy,
      call_to_action,
      click_url,
      display_duration = 30,
      skip_after_seconds = 5,
      priority = 1,
      frequency_cap = 3,
      weight = 1,
      start_time,
      end_time,
      days_of_week,
    } = body;

    // Validate required fields
    if (!name || !ad_video_id || !campaign_id || !placement_type || !target_type) {
      return NextResponse.json(
        { error: 'Name, ad video ID, campaign ID, placement type, and target type are required' },
        { status: 400 }
      );
    }

    // Validate placement_type
    const validPlacementTypes = ['pre_roll', 'mid_roll', 'end_roll'];
    if (!validPlacementTypes.includes(placement_type)) {
      return NextResponse.json(
        { error: 'Placement type must be one of: pre_roll, mid_roll, end_roll' },
        { status: 400 }
      );
    }

    // Validate target_type
    const validTargetTypes = ['content', 'channel', 'global'];
    if (!validTargetTypes.includes(target_type)) {
      return NextResponse.json(
        { error: 'Target type must be one of: content, channel, global' },
        { status: 400 }
      );
    }

    // Validate target_id based on target_type
    if (target_type !== 'global' && !target_id) {
      return NextResponse.json(
        { error: 'Target ID is required for content and channel targeting' },
        { status: 400 }
      );
    }

    if (target_type === 'global' && target_id) {
      return NextResponse.json(
        { error: 'Target ID should not be provided for global targeting' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (display_duration < 0) {
      return NextResponse.json(
        { error: 'Display duration must be non-negative' },
        { status: 400 }
      );
    }

    if (skip_after_seconds < 0) {
      return NextResponse.json(
        { error: 'Skip after seconds must be non-negative' },
        { status: 400 }
      );
    }

    if (frequency_cap < 0) {
      return NextResponse.json(
        { error: 'Frequency cap must be non-negative' },
        { status: 400 }
      );
    }

    if (weight < 1) {
      return NextResponse.json(
        { error: 'Weight must be at least 1' },
        { status: 400 }
      );
    }

    // Validate days_of_week if provided
    if (days_of_week && (!Array.isArray(days_of_week) || days_of_week.some(day => day < 0 || day > 6))) {
      return NextResponse.json(
        { error: 'Days of week must be an array of integers 0-6 (0=Sunday)' },
        { status: 400 }
      );
    }

    // Validate URL format if provided
    if (click_url && !isValidUrl(click_url)) {
      return NextResponse.json(
        { error: 'Click URL must be a valid URL' },
        { status: 400 }
      );
    }

    // Verify ad video exists and is active
    const { data: adVideo, error: adVideoError } = await supabase
      .from('ad_videos')
      .select('id, is_active')
      .eq('id', ad_video_id)
      .single();

    if (adVideoError || !adVideo) {
      return NextResponse.json(
        { error: 'Invalid ad video ID' },
        { status: 400 }
      );
    }

    if (!adVideo.is_active) {
      return NextResponse.json(
        { error: 'Ad video must be active' },
        { status: 400 }
      );
    }

    // Verify campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from('ad_campaigns')
      .select('id, is_active')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    if (!campaign.is_active) {
      return NextResponse.json(
        { error: 'Campaign must be active' },
        { status: 400 }
      );
    }

    // Verify overlay asset exists if provided
    if (overlay_asset_id) {
      const { data: overlayAsset, error: overlayError } = await supabase
        .from('ad_overlay_assets')
        .select('id, is_active')
        .eq('id', overlay_asset_id)
        .single();

      if (overlayError || !overlayAsset) {
        return NextResponse.json(
          { error: 'Invalid overlay asset ID' },
          { status: 400 }
        );
      }

      if (!overlayAsset.is_active) {
        return NextResponse.json(
          { error: 'Overlay asset must be active' },
          { status: 400 }
        );
      }
    }

    // Verify target exists if targeting specific content/channel
    if (target_type === 'content') {
      const { data: content, error: contentError } = await supabase
        .from('content')
        .select('id')
        .eq('id', target_id)
        .single();

      if (contentError || !content) {
        return NextResponse.json(
          { error: 'Invalid content target ID' },
          { status: 400 }
        );
      }
    } else if (target_type === 'channel') {
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('id', target_id)
        .single();

      if (channelError || !channel) {
        return NextResponse.json(
          { error: 'Invalid channel target ID' },
          { status: 400 }
        );
      }
    }

    const { data: placement, error } = await supabase
      .from('ad_placements')
      .insert([{
        name,
        ad_video_id,
        campaign_id,
        overlay_asset_id,
        placement_type,
        target_type,
        target_id: target_type === 'global' ? null : target_id,
        ad_copy,
        call_to_action,
        click_url,
        display_duration,
        skip_after_seconds,
        priority,
        frequency_cap,
        weight,
        start_time,
        end_time,
        days_of_week,
      }])
      .select(`
        *,
        ad_video:ad_video_id(id, title, cloudflare_video_id, duration, advertiser_name),
        campaign:campaign_id(id, name, advertiser_name),
        overlay_asset:overlay_asset_id(id, name, cloudflare_r2_url, dimensions),
        created_by_profile:created_by(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Ad placement creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create ad placement' },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('ad-placements');
    
    return NextResponse.json({
      success: true,
      data: placement,
      message: 'Ad placement created successfully',
    });
  } catch (error) {
    console.error('Ad placement creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Placement ID is required' },
        { status: 400 }
      );
    }

    // Validate placement_type if being updated
    if (updates.placement_type) {
      const validPlacementTypes = ['pre_roll', 'mid_roll', 'end_roll'];
      if (!validPlacementTypes.includes(updates.placement_type)) {
        return NextResponse.json(
          { error: 'Placement type must be one of: pre_roll, mid_roll, end_roll' },
          { status: 400 }
        );
      }
    }

    // Validate target_type if being updated
    if (updates.target_type) {
      const validTargetTypes = ['content', 'channel', 'global'];
      if (!validTargetTypes.includes(updates.target_type)) {
        return NextResponse.json(
          { error: 'Target type must be one of: content, channel, global' },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields if being updated
    if (updates.display_duration !== undefined && updates.display_duration < 0) {
      return NextResponse.json(
        { error: 'Display duration must be non-negative' },
        { status: 400 }
      );
    }

    if (updates.skip_after_seconds !== undefined && updates.skip_after_seconds < 0) {
      return NextResponse.json(
        { error: 'Skip after seconds must be non-negative' },
        { status: 400 }
      );
    }

    if (updates.frequency_cap !== undefined && updates.frequency_cap < 0) {
      return NextResponse.json(
        { error: 'Frequency cap must be non-negative' },
        { status: 400 }
      );
    }

    if (updates.weight !== undefined && updates.weight < 1) {
      return NextResponse.json(
        { error: 'Weight must be at least 1' },
        { status: 400 }
      );
    }

    // Validate URL format if being updated
    if (updates.click_url && !isValidUrl(updates.click_url)) {
      return NextResponse.json(
        { error: 'Click URL must be a valid URL' },
        { status: 400 }
      );
    }

    const { data: placement, error } = await supabase
      .from('ad_placements')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        ad_video:ad_video_id(id, title, cloudflare_video_id, duration, advertiser_name),
        campaign:campaign_id(id, name, advertiser_name),
        overlay_asset:overlay_asset_id(id, name, cloudflare_r2_url, dimensions),
        created_by_profile:created_by(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Ad placement update error:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ad placement not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update ad placement' },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('ad-placements');
    
    return NextResponse.json({
      success: true,
      data: placement,
      message: 'Ad placement updated successfully',
    });
  } catch (error) {
    console.error('Ad placement update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Placement ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('ad_placements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Ad placement deletion error:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ad placement not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to delete ad placement' },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('ad-placements');
    
    return NextResponse.json({
      success: true,
      message: 'Ad placement deleted successfully',
    });
  } catch (error) {
    console.error('Ad placement deletion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to validate URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}