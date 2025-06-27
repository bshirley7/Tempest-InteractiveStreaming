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
    const is_active = searchParams.get('is_active');
    const status = searchParams.get('status'); // 'upcoming', 'active', 'ended'
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from('ad_campaigns')
      .select(`
        *,
        created_by_profile:created_by(id, full_name),
        ad_videos:ad_videos(count)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,advertiser_name.ilike.%${search}%`);
    }

    if (is_active !== null && is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    // Status filter based on dates
    const now = new Date().toISOString();
    if (status === 'upcoming') {
      query = query.gt('start_date', now);
    } else if (status === 'active') {
      query = query.lte('start_date', now).gte('end_date', now);
    } else if (status === 'ended') {
      query = query.lt('end_date', now);
    }

    // Build count query with same filters
    let countQuery = supabase
      .from('ad_campaigns')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%,advertiser_name.ilike.%${search}%`);
    }

    if (is_active !== null && is_active !== undefined) {
      countQuery = countQuery.eq('is_active', is_active === 'true');
    }

    if (status === 'upcoming') {
      countQuery = countQuery.gt('start_date', now);
    } else if (status === 'active') {
      countQuery = countQuery.lte('start_date', now).gte('end_date', now);
    } else if (status === 'ended') {
      countQuery = countQuery.lt('end_date', now);
    }

    // Get total count for pagination
    const { count } = await countQuery;

    // Get paginated results
    const { data: campaigns, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Ad campaigns fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ad campaigns' },
        { status: 500 }
      );
    }

    // Add calculated status to each campaign
    const campaignsWithStatus = campaigns?.map(campaign => {
      const startDate = new Date(campaign.start_date);
      const endDate = new Date(campaign.end_date);
      const currentDate = new Date();
      
      let campaignStatus = 'upcoming';
      if (currentDate >= startDate && currentDate <= endDate) {
        campaignStatus = 'active';
      } else if (currentDate > endDate) {
        campaignStatus = 'ended';
      }

      return {
        ...campaign,
        computed_status: campaignStatus,
      };
    });

    return NextResponse.json({
      success: true,
      data: campaignsWithStatus || [],
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
    console.error('Ad campaigns API error:', error);
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
      description,
      advertiser_name,
      start_date,
      end_date,
      budget_limit,
      daily_budget_limit,
      target_audience = {},
      targeting_rules = {},
      settings = {},
    } = body;

    // Validate required fields
    if (!name || !advertiser_name || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Name, advertiser name, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Validate date range
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    
    if (startDateObj >= endDateObj) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Validate budget values
    if (budget_limit !== undefined && budget_limit < 0) {
      return NextResponse.json(
        { error: 'Budget limit must be non-negative' },
        { status: 400 }
      );
    }

    if (daily_budget_limit !== undefined && daily_budget_limit < 0) {
      return NextResponse.json(
        { error: 'Daily budget limit must be non-negative' },
        { status: 400 }
      );
    }

    const { data: campaign, error } = await supabase
      .from('ad_campaigns')
      .insert([{
        name,
        description,
        advertiser_name,
        start_date,
        end_date,
        budget_limit,
        daily_budget_limit,
        target_audience,
        targeting_rules,
        settings,
      }])
      .select(`
        *,
        created_by_profile:created_by(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Ad campaign creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create ad campaign' },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('ad-campaigns');
    
    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Ad campaign created successfully',
    });
  } catch (error) {
    console.error('Ad campaign creation API error:', error);
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
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Validate date range if being updated
    if (updates.start_date && updates.end_date) {
      const startDateObj = new Date(updates.start_date);
      const endDateObj = new Date(updates.end_date);
      
      if (startDateObj >= endDateObj) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Validate budget values if being updated
    if (updates.budget_limit !== undefined && updates.budget_limit < 0) {
      return NextResponse.json(
        { error: 'Budget limit must be non-negative' },
        { status: 400 }
      );
    }

    if (updates.daily_budget_limit !== undefined && updates.daily_budget_limit < 0) {
      return NextResponse.json(
        { error: 'Daily budget limit must be non-negative' },
        { status: 400 }
      );
    }

    const { data: campaign, error } = await supabase
      .from('ad_campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        created_by_profile:created_by(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Ad campaign update error:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update ad campaign' },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('ad-campaigns');
    
    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Ad campaign updated successfully',
    });
  } catch (error) {
    console.error('Ad campaign update API error:', error);
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
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Check if campaign has associated ad videos
    const { data: adVideos, error: videosError } = await supabase
      .from('ad_videos')
      .select('id')
      .eq('campaign_id', id);

    if (videosError) {
      console.error('Error checking ad videos:', videosError);
      return NextResponse.json(
        { error: 'Failed to check campaign usage' },
        { status: 500 }
      );
    }

    if (adVideos && adVideos.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete campaign that has associated ad videos' },
        { status: 409 }
      );
    }

    // Check if campaign has associated placements
    const { data: placements, error: placementsError } = await supabase
      .from('ad_placements')
      .select('id')
      .eq('campaign_id', id);

    if (placementsError) {
      console.error('Error checking ad placements:', placementsError);
      return NextResponse.json(
        { error: 'Failed to check campaign usage' },
        { status: 500 }
      );
    }

    if (placements && placements.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete campaign that has associated placements' },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from('ad_campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Ad campaign deletion error:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to delete ad campaign' },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('ad-campaigns');
    
    return NextResponse.json({
      success: true,
      message: 'Ad campaign deleted successfully',
    });
  } catch (error) {
    console.error('Ad campaign deletion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}