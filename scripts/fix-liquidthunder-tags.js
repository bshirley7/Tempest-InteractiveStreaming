require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixLiquidThunderTags() {
  console.log('=== Fixing LiquidThunder Video Tags ===\n');

  // 1. Find all LiquidThunder videos that need tags
  console.log('1. Finding LiquidThunder videos without proper tags...');
  const { data: videos, error: fetchError } = await supabase
    .from('content')
    .select('id, title, tags, metadata')
    .or('title.ilike.%LiquidThunder%,title.ilike.%Liquid Thunder%')
    .eq('content_type', 'advertisement')
    .eq('is_published', true);

  if (fetchError) {
    console.error('Error fetching videos:', fetchError);
    return;
  }

  console.log(`Found ${videos.length} LiquidThunder videos\n`);

  // 2. Update each video with proper tags
  for (const video of videos) {
    console.log(`Processing: ${video.title}`);
    
    // Check if it already has the tag
    const currentTags = video.tags || [];
    if (currentTags.includes('LiquidThunder')) {
      console.log('  ✓ Already has LiquidThunder tag, skipping...');
      continue;
    }

    // Add LiquidThunder tag
    const newTags = [...currentTags, 'LiquidThunder'];
    
    // Also update metadata to include company field
    const newMetadata = {
      ...video.metadata,
      company: 'LiquidThunder'
    };

    const { error: updateError } = await supabase
      .from('content')
      .update({ 
        tags: newTags,
        metadata: newMetadata
      })
      .eq('id', video.id);

    if (updateError) {
      console.error(`  ✗ Error updating video ${video.id}:`, updateError);
    } else {
      console.log(`  ✓ Updated with tags: ${JSON.stringify(newTags)} and company metadata`);
    }
  }

  // 3. Verify the fix
  console.log('\n3. Verifying the fix...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('content')
    .select('id, title, tags, metadata')
    .or(`tags.cs.{LiquidThunder},metadata->>company.eq.LiquidThunder`)
    .eq('is_published', true)
    .eq('content_type', 'advertisement');

  if (verifyError) {
    console.error('Error verifying:', verifyError);
  } else {
    console.log(`\n✅ Success! The API query now returns ${verifyData.length} LiquidThunder videos:`);
    verifyData.forEach(v => {
      console.log(`  - ${v.title}`);
      console.log(`    Tags: ${JSON.stringify(v.tags)}`);
      console.log(`    Company: ${v.metadata?.company}`);
    });
  }

  console.log('\n4. Also checking for other companies that might have the same issue...');
  
  // List of all company names from the app structure
  const companies = [
    'CampusCash',
    'CubaTechnologies', 
    'FitFlexGym',
    'GalacticPizza',
    'HungryHawk',
    'LiquidThunder',
    'Outwest',
    'OutwestSteakhouse',
    'PhoenixStateUniversity',
    'PrimeZoom'
  ];

  for (const company of companies) {
    const { data: companyVideos } = await supabase
      .from('content')
      .select('id')
      .or(`title.ilike.%${company}%`)
      .eq('content_type', 'advertisement')
      .eq('is_published', true);

    const { data: taggedVideos } = await supabase
      .from('content')
      .select('id')
      .or(`tags.cs.{${company}},metadata->>company.eq.${company}`)
      .eq('content_type', 'advertisement')
      .eq('is_published', true);

    const totalVideos = companyVideos?.length || 0;
    const properlyTagged = taggedVideos?.length || 0;

    if (totalVideos > 0 && properlyTagged < totalVideos) {
      console.log(`  ⚠️  ${company}: ${totalVideos} total videos, but only ${properlyTagged} properly tagged`);
    } else if (totalVideos > 0) {
      console.log(`  ✓ ${company}: ${totalVideos} videos, all properly tagged`);
    }
  }
}

fixLiquidThunderTags().catch(console.error);