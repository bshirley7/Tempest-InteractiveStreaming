require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugLiquidThunderVideos() {
  console.log('=== Debugging LiquidThunder Videos ===\n');

  // 1. Check all videos with "LiquidThunder" or "Liquid Thunder" in title
  console.log('1. Checking videos with LiquidThunder/Liquid Thunder in title:');
  const { data: titleVideos, error: titleError } = await supabase
    .from('content')
    .select('id, title, tags, metadata, content_type, is_published')
    .or('title.ilike.%LiquidThunder%,title.ilike.%Liquid Thunder%');

  if (titleError) {
    console.error('Error:', titleError);
  } else {
    console.log(`Found ${titleVideos?.length || 0} videos with LiquidThunder/Liquid Thunder in title`);
    titleVideos?.forEach(v => {
      console.log(`  - ID: ${v.id}`);
      console.log(`    Title: ${v.title}`);
      console.log(`    Tags: ${JSON.stringify(v.tags)}`);
      console.log(`    Metadata: ${JSON.stringify(v.metadata)}`);
      console.log(`    Type: ${v.content_type}, Published: ${v.is_published}`);
      console.log();
    });
  }

  // 2. Check what the API query would return for "LiquidThunder"
  console.log('\n2. Testing API query for company="LiquidThunder":');
  const { data: apiVideos, error: apiError } = await supabase
    .from('content')
    .select('*')
    .or(`tags.cs.{LiquidThunder},metadata->>company.eq.LiquidThunder`)
    .eq('is_published', true)
    .eq('content_type', 'advertisement');

  if (apiError) {
    console.error('Error:', apiError);
  } else {
    console.log(`API query would return ${apiVideos?.length || 0} videos`);
    apiVideos?.forEach(v => {
      console.log(`  - ${v.title} (ID: ${v.id})`);
    });
  }

  // 3. Check with space: "Liquid Thunder"
  console.log('\n3. Testing API query for company="Liquid Thunder" (with space):');
  const { data: spaceVideos, error: spaceError } = await supabase
    .from('content')
    .select('*')
    .or(`tags.cs.{Liquid Thunder},metadata->>company.eq.Liquid Thunder`)
    .eq('is_published', true)
    .eq('content_type', 'advertisement');

  if (spaceError) {
    console.error('Error:', spaceError);
  } else {
    console.log(`API query with space would return ${spaceVideos?.length || 0} videos`);
    spaceVideos?.forEach(v => {
      console.log(`  - ${v.title} (ID: ${v.id})`);
    });
  }

  // 4. Check all advertisement videos to see how they're tagged
  console.log('\n4. Checking all advertisement videos for company tagging patterns:');
  const { data: allAds, error: allAdsError } = await supabase
    .from('content')
    .select('id, title, tags, metadata')
    .eq('content_type', 'advertisement')
    .eq('is_published', true)
    .limit(20);

  if (allAdsError) {
    console.error('Error:', allAdsError);
  } else {
    console.log(`Sample of ${allAds?.length || 0} advertisement videos:`);
    allAds?.forEach(v => {
      if (v.tags?.length > 0 || v.metadata?.company) {
        console.log(`  - ${v.title}`);
        console.log(`    Tags: ${JSON.stringify(v.tags)}`);
        console.log(`    Company in metadata: ${v.metadata?.company || 'Not set'}`);
      }
    });
  }

  // 5. Check if there are any videos with content_type !== 'advertisement' but with LiquidThunder
  console.log('\n5. Checking for LiquidThunder videos with different content_type:');
  const { data: otherTypeVideos, error: otherTypeError } = await supabase
    .from('content')
    .select('id, title, content_type, tags, metadata')
    .or('title.ilike.%LiquidThunder%,title.ilike.%Liquid Thunder%,tags.cs.{LiquidThunder},tags.cs.{Liquid Thunder}')
    .neq('content_type', 'advertisement');

  if (otherTypeError) {
    console.error('Error:', otherTypeError);
  } else {
    console.log(`Found ${otherTypeVideos?.length || 0} non-advertisement videos`);
    otherTypeVideos?.forEach(v => {
      console.log(`  - ${v.title} (Type: ${v.content_type})`);
    });
  }
}

debugLiquidThunderVideos().catch(console.error);