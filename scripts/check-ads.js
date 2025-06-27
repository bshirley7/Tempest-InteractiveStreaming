const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAds() {
  console.log('Checking for advertisement content...\n');

  try {
    // Check all content
    const { data: allContent, error: allError } = await supabase
      .from('content')
      .select('content_type');

    if (allError) {
      console.error('Error fetching content:', allError);
      return;
    }

    // Count content types manually
    const contentTypeCounts = {};
    allContent?.forEach(item => {
      contentTypeCounts[item.content_type] = (contentTypeCounts[item.content_type] || 0) + 1;
    });

    console.log('Content types in database:');
    Object.entries(contentTypeCounts).forEach(([type, count]) => {
      console.log(`- ${type}: ${count} items`);
    });
    console.log();

    // Check specifically for advertisements
    const { data: ads, error: adsError } = await supabase
      .from('content')
      .select(`
        id,
        title,
        content_type,
        cloudflare_video_id,
        is_published,
        duration,
        created_at
      `)
      .eq('content_type', 'advertisement');

    if (adsError) {
      console.error('Error fetching advertisements:', adsError);
      return;
    }

    console.log(`Found ${ads?.length || 0} advertisement(s):`);
    if (ads && ads.length > 0) {
      ads.forEach(ad => {
        console.log(`- "${ad.title}" (${ad.cloudflare_video_id}) - Published: ${ad.is_published}`);
      });
    } else {
      console.log('No advertisements found in database!');
      console.log('\nTo add advertisements:');
      console.log('1. Upload video content to Cloudflare');
      console.log('2. Add records to content table with content_type = "advertisement"');
      console.log('3. Set is_published = true');
    }

    // Check if we have any content that could be used as ads
    const { data: potentialAds, error: potentialError } = await supabase
      .from('content')
      .select('id, title, content_type, cloudflare_video_id')
      .not('cloudflare_video_id', 'is', null)
      .eq('is_published', true)
      .limit(5);

    if (!potentialError && potentialAds && potentialAds.length > 0) {
      console.log('\nExisting published content (could be converted to ads):');
      potentialAds.forEach(content => {
        console.log(`- "${content.title}" (${content.content_type}) - ID: ${content.id}`);
      });
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkAds();