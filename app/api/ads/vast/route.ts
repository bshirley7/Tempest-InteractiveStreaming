import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  console.log('VAST endpoint called:', request.url);
  
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const position = searchParams.get('position') || 'pre_roll';
    const contentId = searchParams.get('content_id');
    
    console.log('VAST request params:', { position, contentId });
    
    if (!supabase) {
      console.error('Supabase client not available');
      return new NextResponse('Database not configured', { status: 500 });
    }

    // Fetch random advertisement from content table
    // Using basic fields first to avoid column-not-found errors
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
      console.error('VAST ad serving error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return new NextResponse('Failed to fetch advertisements', { status: 500 });
    }

    console.log(`Found ${advertisements?.length || 0} advertisements`);

    // Return empty VAST if no ads available
    if (!advertisements || advertisements.length === 0) {
      const emptyVast = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.0">
</VAST>`;
      return new NextResponse(emptyVast, {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    // Select random ad from available ads
    const randomIndex = Math.floor(Math.random() * advertisements.length);
    const selectedAd = advertisements[randomIndex];

    // Generate VAST XML using basic fields
    const duration = selectedAd.duration || 15;
    // Use MP4 URL instead of HLS for VAST compatibility
    const videoUrl = `https://customer-ydgwaifmhmzkp7in.cloudflarestream.com/${selectedAd.cloudflare_video_id}/downloads/default.mp4`;
    const clickThroughUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/vod/details/${selectedAd.id}`;
    const thumbnailUrl = selectedAd.thumbnail_url || `https://customer-ydgwaifmhmzkp7in.cloudflarestream.com/${selectedAd.cloudflare_video_id}/thumbnails/thumbnail.jpg`;
    const adSystem = 'Tempest Streaming Platform';
    const advertiserName = 'Tempest Media';
    const campaignId = selectedAd.id;
    
    console.log('Generated VAST data:', {
      adId: campaignId,
      title: selectedAd.title,
      videoUrl,
      duration
    });

    const vastXml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.0">
  <Ad id="${campaignId}">
    <InLine>
      <AdSystem version="1.0">${adSystem}</AdSystem>
      <AdTitle><![CDATA[${selectedAd.title}]]></AdTitle>
      <Description><![CDATA[${selectedAd.description || ''}]]></Description>
      <Advertiser><![CDATA[${advertiserName}]]></Advertiser>
      <Impression><![CDATA[${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ads/impression?id=${selectedAd.id}&position=${position}&campaign=${campaignId}]]></Impression>
      <Creatives>
        <Creative id="${selectedAd.id}-creative" AdID="${campaignId}">
          <Linear>
            <Duration>${formatDuration(duration)}</Duration>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ads/tracking?event=start&id=${selectedAd.id}&campaign=${campaignId}]]></Tracking>
              <Tracking event="firstQuartile"><![CDATA[${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ads/tracking?event=firstQuartile&id=${selectedAd.id}&campaign=${campaignId}]]></Tracking>
              <Tracking event="midpoint"><![CDATA[${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ads/tracking?event=midpoint&id=${selectedAd.id}&campaign=${campaignId}]]></Tracking>
              <Tracking event="thirdQuartile"><![CDATA[${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ads/tracking?event=thirdQuartile&id=${selectedAd.id}&campaign=${campaignId}]]></Tracking>
              <Tracking event="complete"><![CDATA[${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ads/tracking?event=complete&id=${selectedAd.id}&campaign=${campaignId}]]></Tracking>
            </TrackingEvents>
            <VideoClicks>
              <ClickThrough><![CDATA[${clickThroughUrl}]]></ClickThrough>
              <ClickTracking><![CDATA[${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ads/tracking?event=click&id=${selectedAd.id}&campaign=${campaignId}]]></ClickTracking>
            </VideoClicks>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080">
                <![CDATA[${videoUrl}]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

    return new NextResponse(vastXml, {
      headers: { 
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('VAST XML generation error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

// Helper function to format duration as HH:MM:SS
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}