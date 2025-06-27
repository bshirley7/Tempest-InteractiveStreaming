/**
 * Debug ad placements - check what's in the database
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAdPlacements() {
  console.log('🔍 Debugging Ad Placements\n');

  try {
    // 1. Check ad_placements table
    console.log('1️⃣ Checking ad_placements table...');
    const { data: placements, error: placementsError } = await supabase
      .from('ad_placements')
      .select('*')
      .order('created_at', { ascending: false });

    if (placementsError) {
      console.error('❌ Error fetching ad_placements:', placementsError);
    } else {
      console.log(`✅ Found ${placements.length} ad placements`);
      if (placements.length > 0) {
        console.log('\nAd Placements:');
        placements.forEach((placement, index) => {
          console.log(`\n${index + 1}. ${placement.name || placement.id}`);
          console.log(`   ID: ${placement.id}`);
          console.log(`   Campaign ID: ${placement.campaign_id || 'None'}`);
          console.log(`   Channel: ${placement.channel_id || 'All channels'}`);
          console.log(`   Positions: ${JSON.stringify(placement.ad_positions)}`);
          console.log(`   Status: ${placement.status}`);
          console.log(`   Created: ${placement.created_at}`);
        });
      }
    }

    // 2. Check ad_campaigns table
    console.log('\n2️⃣ Checking ad_campaigns table...');
    const { data: campaigns, error: campaignsError } = await supabase
      .from('ad_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('❌ Error fetching ad_campaigns:', campaignsError);
    } else {
      console.log(`✅ Found ${campaigns.length} ad campaigns`);
      if (campaigns.length > 0) {
        console.log('\nAd Campaigns:');
        campaigns.forEach((campaign, index) => {
          console.log(`\n${index + 1}. ${campaign.name}`);
          console.log(`   ID: ${campaign.id}`);
          console.log(`   Status: ${campaign.status}`);
          console.log(`   Budget: $${campaign.budget || 0}`);
          console.log(`   Created: ${campaign.created_at}`);
        });
      }
    }

    // 3. Check ad_videos table
    console.log('\n3️⃣ Checking ad_videos table...');
    const { data: adVideos, error: adVideosError } = await supabase
      .from('ad_videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (adVideosError) {
      console.error('❌ Error fetching ad_videos:', adVideosError);
    } else {
      console.log(`✅ Found ${adVideos.length} ad videos`);
      if (adVideos.length > 0) {
        console.log('\nAd Videos:');
        adVideos.forEach((video, index) => {
          console.log(`\n${index + 1}. ${video.title}`);
          console.log(`   ID: ${video.id}`);
          console.log(`   Cloudflare ID: ${video.cloudflare_video_id}`);
          console.log(`   Campaign ID: ${video.campaign_id || 'None'}`);
          console.log(`   Status: ${video.approval_status}`);
          console.log(`   Duration: ${video.duration}s`);
          console.log(`   Created: ${video.created_at}`);
        });
      }
    }

    // 4. Check content table for advertisement type
    console.log('\n4️⃣ Checking content table for advertisements...');
    const { data: contentAds, error: contentAdsError } = await supabase
      .from('content')
      .select('*')
      .eq('content_type', 'advertisement')
      .order('created_at', { ascending: false });

    if (contentAdsError) {
      console.error('❌ Error fetching content advertisements:', contentAdsError);
    } else {
      console.log(`✅ Found ${contentAds.length} content marked as advertisements`);
      if (contentAds.length > 0) {
        console.log('\nContent Advertisements:');
        contentAds.forEach((content, index) => {
          console.log(`\n${index + 1}. ${content.title}`);
          console.log(`   ID: ${content.id}`);
          console.log(`   Cloudflare ID: ${content.cloudflare_video_id}`);
          console.log(`   Duration: ${content.duration}s`);
          console.log(`   Published: ${content.is_published}`);
          console.log(`   Created: ${content.created_at}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Debug failed:', error);
  }
}

debugAdPlacements()
  .then(() => {
    console.log('\n🎯 Ad placements debug complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });