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
    const campaign_id = searchParams.get('campaign_id');
    const is_active = searchParams.get('is_active');
    const approval_status = searchParams.get('approval_status');
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from('ad_videos')
      .select(`
        *,
        campaign:campaign_id(id, name, advertiser_name),
        created_by_profile:created_by(id, full_name)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,advertiser_name.ilike.%${search}%`);
    }

    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    if (is_active !== null && is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    if (approval_status) {
      query = query.eq('approval_status', approval_status);
    }

    // Build count query with same filters
    let countQuery = supabase
      .from('ad_videos')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,advertiser_name.ilike.%${search}%`);
    }

    if (campaign_id) {
      countQuery = countQuery.eq('campaign_id', campaign_id);
    }

    if (is_active !== null && is_active !== undefined) {
      countQuery = countQuery.eq('is_active', is_active === 'true');
    }

    if (approval_status) {
      countQuery = countQuery.eq('approval_status', approval_status);
    }

    // Get total count for pagination
    const { count } = await countQuery;

    // Get paginated results
    const { data: adVideos, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Ad videos fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ad videos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: adVideos || [],
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
    console.error('Ad videos API error:', error);
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
      title,
      description,
      cloudflare_video_id,
      thumbnail_url,
      duration,
      category = 'commercial',
      advertiser_name,
      campaign_id,
      file_size,
      metadata = {},
    } = body;

    // Validate required fields
    if (!title || !cloudflare_video_id || !duration) {
      return NextResponse.json(
        { error: 'Title, Cloudflare video ID, and duration are required' },
        { status: 400 }
      );
    }

    // Validate duration is positive
    if (duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate campaign exists if provided
    if (campaign_id) {
      const { data: campaign, error: campaignError } = await supabase
        .from('ad_campaigns')
        .select('id')
        .eq('id', campaign_id)
        .single();

      if (campaignError || !campaign) {
        return NextResponse.json(
          { error: 'Invalid campaign ID' },
          { status: 400 }
        );
      }
    }

    const { data: adVideo, error } = await supabase
      .from('ad_videos')
      .insert([{
        title,
        description,
        cloudflare_video_id,
        thumbnail_url,
        duration,
        category,
        advertiser_name,
        campaign_id,
        file_size,
        metadata,
      }])
      .select(`
        *,
        campaign:campaign_id(id, name, advertiser_name),
        created_by_profile:created_by(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Ad video creation error:', error);
      
      // Handle specific constraint violations
      if (error.code === '23505' && error.message.includes('cloudflare_video_id')) {
        return NextResponse.json(
          { error: 'A video with this Cloudflare video ID already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create ad video' },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('ad-videos');
    
    return NextResponse.json({
      success: true,
      data: adVideo,
      message: 'Ad video created successfully',
    });
  } catch (error) {
    console.error('Ad video creation API error:', error);
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
        { error: 'Ad video ID is required' },
        { status: 400 }
      );
    }

    // Validate campaign exists if being updated
    if (updates.campaign_id) {
      const { data: campaign, error: campaignError } = await supabase
        .from('ad_campaigns')
        .select('id')
        .eq('id', updates.campaign_id)
        .single();

      if (campaignError || !campaign) {
        return NextResponse.json(
          { error: 'Invalid campaign ID' },
          { status: 400 }
        );
      }
    }

    // Validate duration if being updated
    if (updates.duration !== undefined && updates.duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be greater than 0' },
        { status: 400 }
      );
    }

    const { data: adVideo, error } = await supabase
      .from('ad_videos')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        campaign:campaign_id(id, name, advertiser_name),
        created_by_profile:created_by(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Ad video update error:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ad video not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update ad video' },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('ad-videos');
    
    return NextResponse.json({
      success: true,
      data: adVideo,
      message: 'Ad video updated successfully',
    });
  } catch (error) {
    console.error('Ad video update API error:', error);
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
        { error: 'Ad video ID is required' },
        { status: 400 }
      );
    }

    // Check if ad video is being used in any active placements
    const { data: activePlacements, error: placementsError } = await supabase
      .from('ad_placements')
      .select('id')
      .eq('ad_video_id', id)
      .eq('is_active', true);

    if (placementsError) {
      console.error('Error checking ad placements:', placementsError);
      return NextResponse.json(
        { error: 'Failed to check ad video usage' },
        { status: 500 }
      );
    }

    if (activePlacements && activePlacements.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete ad video that is used in active placements' },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from('ad_videos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Ad video deletion error:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ad video not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to delete ad video' },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('ad-videos');
    
    return NextResponse.json({
      success: true,
      message: 'Ad video deleted successfully',
    });
  } catch (error) {
    console.error('Ad video deletion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}