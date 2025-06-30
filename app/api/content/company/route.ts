import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');

    if (!company) {
      return NextResponse.json({ error: 'Company parameter required' }, { status: 400 });
    }

    // Query videos tagged with the company name
    const { data: videos, error } = await supabase
      .from('content')
      .select(`
        id,
        title,
        description,
        duration,
        thumbnail_url,
        created_at,
        view_count,
        category,
        tags,
        metadata,
        cloudflare_video_id
      `)
      .or(`tags.cs.{${company}},metadata->>company.eq.${company}`)
      .eq('is_published', true)
      .eq('content_type', 'advertisement')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }

    // Transform videos to match the ad format expected by company pages
    const transformedVideos = videos?.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description || `${company} advertisement`,
      duration: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:30',
      views: video.view_count || 0,
      thumbnail: video.thumbnail_url || `/api/video/${video.id}/thumbnail`,
      videoUrl: `/vod/details/${video.id}`,
      cloudflare_video_id: video.cloudflare_video_id,
      category: video.category || 'Advertisement',
      createdAt: video.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
    })) || [];

    return NextResponse.json(transformedVideos);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}