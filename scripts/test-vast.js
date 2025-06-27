const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testVastData() {
  console.log('Testing VAST data generation...\n');

  try {
    // Test the same query as the VAST endpoint
    const query = supabase
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
      console.error('Database error:', error);
      return;
    }

    console.log(`Found ${advertisements?.length || 0} advertisements`);

    if (!advertisements || advertisements.length === 0) {
      console.log('No advertisements found - VAST will return empty XML');
      return;
    }

    // Select random ad
    const randomIndex = Math.floor(Math.random() * advertisements.length);
    const selectedAd = advertisements[randomIndex];

    console.log('Selected ad for VAST:');
    console.log(`- ID: ${selectedAd.id}`);
    console.log(`- Title: ${selectedAd.title}`);
    console.log(`- Cloudflare Video ID: ${selectedAd.cloudflare_video_id}`);
    console.log(`- Duration: ${selectedAd.duration}`);

    // Generate sample VAST XML
    const duration = selectedAd.duration || 15;
    const videoUrl = `https://customer-ydgwaifmhmzkp7in.cloudflarestream.com/${selectedAd.cloudflare_video_id}/manifest/video.m3u8`;
    
    console.log(`\nGenerated video URL: ${videoUrl}`);
    
    // Test if all required fields are present
    const hasRequiredFields = selectedAd.id && selectedAd.title && selectedAd.cloudflare_video_id;
    console.log(`\nHas all required fields: ${hasRequiredFields}`);

    if (hasRequiredFields) {
      console.log('\n✅ VAST XML generation should work!');
      
      // Show sample VAST structure
      console.log('\nSample VAST XML structure:');
      console.log(`<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.0">
  <Ad id="${selectedAd.id}">
    <InLine>
      <AdTitle><![CDATA[${selectedAd.title}]]></AdTitle>
      <MediaFiles>
        <MediaFile delivery="streaming" type="application/x-mpegURL">
          <![CDATA[${videoUrl}]]>
        </MediaFile>
      </MediaFiles>
    </InLine>
  </Ad>
</VAST>`);
    } else {
      console.log('\n❌ Missing required fields for VAST XML');
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

testVastData();