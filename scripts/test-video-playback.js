/**
 * Test video playback data fetching
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

async function testVideoPlayback() {
  console.log('🔍 Testing Video Playback Data\n');

  try {
    // 1. Get all content
    console.log('1️⃣ Fetching all content...');
    const { data: allContent, error: allError } = await supabase
      .from('content')
      .select('id, title, cloudflare_video_id, channel_id, is_published')
      .limit(10);

    if (allError) {
      console.error('❌ Error fetching content:', allError);
      return;
    }

    console.log(`✅ Found ${allContent.length} content items\n`);
    
    if (allContent.length === 0) {
      console.log('No content found in database');
      return;
    }

    // 2. Test fetching with channel join
    const testId = allContent[0].id;
    console.log(`2️⃣ Testing content fetch with channel join for ID: ${testId}`);
    
    const { data: contentWithChannel, error: channelError } = await supabase
      .from('content')
      .select(`
        *,
        channels!left(id, name, slug, category)
      `)
      .eq('id', testId)
      .single();

    if (channelError) {
      console.error('❌ Error with channel join:', channelError);
    } else {
      console.log('✅ Successfully fetched with channel join');
      console.log('Content:', {
        id: contentWithChannel.id,
        title: contentWithChannel.title,
        cloudflare_video_id: contentWithChannel.cloudflare_video_id,
        channel: contentWithChannel.channels || 'No channel'
      });
    }

    // 3. Test published content endpoint
    console.log('\n3️⃣ Testing published content endpoint...');
    const publishedContent = allContent.filter(c => c.is_published);
    console.log(`Found ${publishedContent.length} published content items`);

    // 4. Show sample video data for debugging
    console.log('\n4️⃣ Sample video data:');
    allContent.slice(0, 3).forEach((content, index) => {
      console.log(`\nVideo ${index + 1}:`);
      console.log(`  ID: ${content.id}`);
      console.log(`  Title: ${content.title}`);
      console.log(`  Cloudflare ID: ${content.cloudflare_video_id || 'MISSING!'}`);
      console.log(`  Channel ID: ${content.channel_id || 'None'}`);
      console.log(`  Published: ${content.is_published ? 'Yes' : 'No'}`);
    });

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testVideoPlayback()
  .then(() => {
    console.log('\n🎯 Video playback test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });