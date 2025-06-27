#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateSyncIssue() {
  try {
    console.log('🔍 Investigating Content Library Sync Issue');
    console.log('==========================================\n');

    // 1. Check content table
    console.log('1. Checking CONTENT table:');
    const { data: contentData, error: contentError, count: contentCount } = await supabase
      .from('content')
      .select('*', { count: 'exact' })
      .limit(5);

    if (contentError) {
      console.error('❌ Content table error:', contentError);
    } else {
      console.log(`✅ Content table has ${contentCount} total records`);
      if (contentData && contentData.length > 0) {
        console.log('   Sample records:');
        contentData.forEach(item => {
          console.log(`   - ${item.title} (ID: ${item.id}, Cloudflare: ${item.cloudflare_video_id})`);
        });
      }
    }

    // 2. Check videos table (if it exists)
    console.log('\n2. Checking VIDEOS table:');
    const { data: videosData, error: videosError, count: videosCount } = await supabase
      .from('videos')
      .select('*', { count: 'exact' })
      .limit(5);

    if (videosError) {
      console.error('❌ Videos table error:', videosError);
    } else {
      console.log(`✅ Videos table has ${videosCount} total records`);
      if (videosData && videosData.length > 0) {
        console.log('   Sample records:');
        videosData.forEach(item => {
          console.log(`   - ${item.title} (ID: ${item.id}, Cloudflare: ${item.cloudflare_stream_id})`);
        });
      }
    }

    // 3. Check channels table
    console.log('\n3. Checking CHANNELS table:');
    const { data: channelsData, error: channelsError } = await supabase
      .from('channels')
      .select('id, name, slug, is_active');

    if (channelsError) {
      console.error('❌ Channels table error:', channelsError);
    } else {
      console.log(`✅ Found ${channelsData.length} channels:`);
      channelsData.forEach(channel => {
        console.log(`   - ${channel.name} (${channel.slug}) - Active: ${channel.is_active}`);
      });
    }

    // 4. Check if content has proper channel relationships
    console.log('\n4. Checking content-channel relationships:');
    const { data: contentWithChannels, error: relationError } = await supabase
      .from('content')
      .select('id, title, channel_id, channels(name)')
      .limit(5);

    if (relationError) {
      console.error('❌ Relationship query error:', relationError);
    } else {
      console.log(`✅ Content with channels:`);
      contentWithChannels?.forEach(item => {
        console.log(`   - ${item.title} -> Channel: ${item.channels?.name || 'NULL'} (ID: ${item.channel_id || 'NULL'})`);
      });
    }

    // 5. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`- Content table: ${contentCount || 0} records`);
    console.log(`- Videos table: ${videosCount || 0} records`);
    console.log(`- Channels: ${channelsData?.length || 0} channels`);
    
    if (contentCount === 0 && videosCount > 0) {
      console.log('\n⚠️  ISSUE IDENTIFIED: Videos are being synced to the "videos" table but the UI is reading from the "content" table!');
      console.log('   The sync process needs to be updated to sync to the "content" table instead.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

investigateSyncIssue();