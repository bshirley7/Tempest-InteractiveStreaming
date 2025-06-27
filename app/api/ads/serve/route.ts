import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const position = searchParams.get('position') || 'pre_roll'; // pre_roll, mid_roll, end_roll
    const contentId = searchParams.get('content_id'); // optional for content-specific ads
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Fetch random advertisement from content table
    let query = supabase
      .from('content')
      .select(`
        id,
        title,
        description,
        cloudflare_video_id,
        thumbnail_url,
        duration,
        created_at
      `)
      .eq('content_type', 'advertisement')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    const { data: advertisements, error } = await query;

    if (error) {
      console.error('Ad serving error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch advertisements' },
        { status: 500 }
      );
    }

    // Return null if no ads available
    if (!advertisements || advertisements.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No advertisements available',
      });
    }

    // Select random ad from available ads
    const randomIndex = Math.floor(Math.random() * advertisements.length);
    const selectedAd = advertisements[randomIndex];

    // Format the ad response
    const adResponse = {
      id: selectedAd.id,
      title: selectedAd.title,
      description: selectedAd.description,
      video_url: `https://customer-ydgwaifmhmzkp7in.cloudflarestream.com/${selectedAd.cloudflare_video_id}/manifest/video.m3u8`,
      thumbnail_url: selectedAd.thumbnail_url || `https://customer-ydgwaifmhmzkp7in.cloudflarestream.com/${selectedAd.cloudflare_video_id}/thumbnails/thumbnail.jpg`,
      duration: selectedAd.duration || 15,
      position,
      cloudflare_video_id: selectedAd.cloudflare_video_id,
      skip_after_seconds: 5, // Allow skip after 5 seconds
      display_duration: selectedAd.duration || 15,
    };

    return NextResponse.json({
      success: true,
      data: adResponse,
      message: 'Advertisement served successfully',
    });
  } catch (error) {
    console.error('Ad serving API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

