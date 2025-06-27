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
    const file_type = searchParams.get('file_type');
    const is_active = searchParams.get('is_active');
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from('ad_overlay_assets')
      .select(`
        *,
        created_by_profile:created_by(id, full_name)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,alt_text.ilike.%${search}%`);
    }

    if (file_type) {
      query = query.eq('file_type', file_type);
    }

    if (is_active !== null && is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    // Build count query with same filters
    let countQuery = supabase
      .from('ad_overlay_assets')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,alt_text.ilike.%${search}%`);
    }

    if (file_type) {
      countQuery = countQuery.eq('file_type', file_type);
    }

    if (is_active !== null && is_active !== undefined) {
      countQuery = countQuery.eq('is_active', is_active === 'true');
    }

    // Get total count for pagination
    const { count } = await countQuery;

    // Get paginated results
    const { data: assets, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Ad overlay assets fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ad overlay assets' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assets || [],
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
    console.error('Ad overlay assets API error:', error);
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
      cloudflare_r2_url,
      cloudflare_r2_key,
      file_type,
      file_size,
      dimensions,
      alt_text,
    } = body;

    // Validate required fields
    if (!name || !cloudflare_r2_url || !cloudflare_r2_key || !file_type) {
      return NextResponse.json(
        { error: 'Name, Cloudflare R2 URL, R2 key, and file type are required' },
        { status: 400 }
      );
    }

    // Validate file type is an image
    if (!file_type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File type must be an image' },
        { status: 400 }
      );
    }

    // Validate dimensions format if provided
    if (dimensions) {
      if (typeof dimensions !== 'object' || !dimensions.width || !dimensions.height) {
        return NextResponse.json(
          { error: 'Dimensions must be an object with width and height properties' },
          { status: 400 }
        );
      }
      
      if (dimensions.width <= 0 || dimensions.height <= 0) {
        return NextResponse.json(
          { error: 'Dimensions width and height must be positive numbers' },
          { status: 400 }
        );
      }
    }

    // Validate file size if provided
    if (file_size !== undefined && file_size < 0) {
      return NextResponse.json(
        { error: 'File size must be non-negative' },
        { status: 400 }
      );
    }

    const { data: asset, error } = await supabase
      .from('ad_overlay_assets')
      .insert([{
        name,
        cloudflare_r2_url,
        cloudflare_r2_key,
        file_type,
        file_size,
        dimensions,
        alt_text,
      }])
      .select(`
        *,
        created_by_profile:created_by(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Ad overlay asset creation error:', error);
      
      // Handle specific constraint violations
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'An asset with this R2 URL or key already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create ad overlay asset' },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('ad-overlay-assets');
    
    return NextResponse.json({
      success: true,
      data: asset,
      message: 'Ad overlay asset created successfully',
    });
  } catch (error) {
    console.error('Ad overlay asset creation API error:', error);
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
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // Validate file type if being updated
    if (updates.file_type && !updates.file_type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File type must be an image' },
        { status: 400 }
      );
    }

    // Validate dimensions format if being updated
    if (updates.dimensions) {
      if (typeof updates.dimensions !== 'object' || !updates.dimensions.width || !updates.dimensions.height) {
        return NextResponse.json(
          { error: 'Dimensions must be an object with width and height properties' },
          { status: 400 }
        );
      }
      
      if (updates.dimensions.width <= 0 || updates.dimensions.height <= 0) {
        return NextResponse.json(
          { error: 'Dimensions width and height must be positive numbers' },
          { status: 400 }
        );
      }
    }

    // Validate file size if being updated
    if (updates.file_size !== undefined && updates.file_size < 0) {
      return NextResponse.json(
        { error: 'File size must be non-negative' },
        { status: 400 }
      );
    }

    const { data: asset, error } = await supabase
      .from('ad_overlay_assets')
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
      console.error('Ad overlay asset update error:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ad overlay asset not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update ad overlay asset' },
        { status: 500 }
      );
    }

    // Revalidate cache
    revalidateTag('ad-overlay-assets');
    
    return NextResponse.json({
      success: true,
      data: asset,
      message: 'Ad overlay asset updated successfully',
    });
  } catch (error) {
    console.error('Ad overlay asset update API error:', error);
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
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // Check if asset is being used in any active placements
    const { data: activePlacements, error: placementsError } = await supabase
      .from('ad_placements')
      .select('id')
      .eq('overlay_asset_id', id)
      .eq('is_active', true);

    if (placementsError) {
      console.error('Error checking ad placements:', placementsError);
      return NextResponse.json(
        { error: 'Failed to check asset usage' },
        { status: 500 }
      );
    }

    if (activePlacements && activePlacements.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete overlay asset that is used in active placements' },
        { status: 409 }
      );
    }

    // Get asset details before deletion for potential R2 cleanup
    const { data: asset, error: fetchError } = await supabase
      .from('ad_overlay_assets')
      .select('cloudflare_r2_key')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching asset details:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch asset details' },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from('ad_overlay_assets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Ad overlay asset deletion error:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ad overlay asset not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to delete ad overlay asset' },
        { status: 500 }
      );
    }

    // Note: In a production environment, you might want to also delete the file from Cloudflare R2
    // This would require implementing R2 deletion logic here using the cloudflare_r2_key

    // Revalidate cache
    revalidateTag('ad-overlay-assets');
    
    return NextResponse.json({
      success: true,
      message: 'Ad overlay asset deleted successfully',
      data: { 
        deleted_r2_key: asset?.cloudflare_r2_key 
      },
    });
  } catch (error) {
    console.error('Ad overlay asset deletion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}