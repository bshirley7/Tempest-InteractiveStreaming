import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || 'HungryHawk';

    // First, let's see ALL videos with "Ad HungryHawk" in the title
    const { data: allVideos, error: allError } = await supabase
      .from('content')
      .select('*')
      .ilike('title', `%Ad ${company}%`);

    if (allError) {
      console.error('Error fetching all videos:', allError);
      return NextResponse.json({ error: 'Database error', details: allError }, { status: 500 });
    }

    // Now let's see what the tag/metadata filtering returns
    const { data: taggedVideos, error: tagError } = await supabase
      .from('content')
      .select('*')
      .or(`tags.cs.{${company}},metadata->>company.eq.${company}`);

    if (tagError) {
      console.error('Error with tag filtering:', tagError);
    }

    return NextResponse.json({
      company,
      totalVideosWithNameInTitle: allVideos?.length || 0,
      videosWithNameInTitle: allVideos?.map(v => ({
        id: v.id,
        title: v.title,
        tags: v.tags,
        metadata: v.metadata,
        content_type: v.content_type,
        is_published: v.is_published
      })) || [],
      totalTaggedVideos: taggedVideos?.length || 0,
      taggedVideos: taggedVideos?.map(v => ({
        id: v.id,
        title: v.title,
        tags: v.tags,
        metadata: v.metadata
      })) || []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}