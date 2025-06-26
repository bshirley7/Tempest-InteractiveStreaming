#!/usr/bin/env node

/**
 * Simple Database Video Query Script
 * 
 * This script performs simple database queries to show Cloudflare video IDs
 * and related data without external API calls.
 * 
 * Usage:
 *   node scripts/query-video-ids.js
 *   node scripts/query-video-ids.js --published-only
 *   node scripts/query-video-ids.js --ids-only
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const args = process.argv.slice(2);
const publishedOnly = args.includes('--published-only');
const idsOnly = args.includes('--ids-only');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryVideoIDs() {
  try {
    console.log('🔍 Querying Cloudflare Video IDs from Database');
    console.log('==============================================\n');

    // Build query
    let query = supabase
      .from('content')
      .select(`
        id,
        title,
        cloudflare_video_id,
        duration,
        is_published,
        sync_status,
        created_at,
        channels(name, slug)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (publishedOnly) {
      query = query.eq('is_published', true);
      console.log('🔹 Filter: Published videos only\n');
    }

    const { data: videos, error } = await query;

    if (error) {
      console.error('❌ Query Error:', error);
      process.exit(1);
    }

    if (!videos || videos.length === 0) {
      console.log('❌ No videos found in database');
      if (publishedOnly) {
        console.log('   💡 Try without --published-only flag');
      } else {
        console.log('   💡 Consider running sync script: npm run sync:simple');
      }
      return;
    }

    console.log(`✅ Found ${videos.length} videos in database:`);
    console.log('='.repeat(50));

    if (idsOnly) {
      // Just show the video IDs
      console.log('\n📋 Cloudflare Video IDs:');
      videos.forEach((video, index) => {
        console.log(`${index + 1}. ${video.cloudflare_video_id}`);
      });
    } else {
      // Show detailed information
      videos.forEach((video, index) => {
        const publishedIcon = video.is_published ? '🟢' : '🔴';
        const syncIcon = video.sync_status === 'synced' ? '✅' : 
                        video.sync_status === 'pending' ? '⏳' : '❌';
        const channelName = video.channels?.name || 'No Channel';
        const duration = video.duration ? 
          `${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, '0')}` : 
          'N/A';
        const createdDate = new Date(video.created_at).toLocaleDateString();

        console.log(`\n${index + 1}. ${video.title}`);
        console.log(`   🎬 Cloudflare Video ID: ${video.cloudflare_video_id}`);
        console.log(`   📋 Database ID: ${video.id}`);
        console.log(`   📺 Channel: ${channelName}`);
        console.log(`   ⏱️  Duration: ${duration}`);
        console.log(`   ${publishedIcon} Published: ${video.is_published}`);
        console.log(`   ${syncIcon} Sync Status: ${video.sync_status}`);
        console.log(`   📅 Created: ${createdDate}`);
      });
    }

    // Show summary statistics
    const publishedCount = videos.filter(v => v.is_published).length;
    const syncedCount = videos.filter(v => v.sync_status === 'synced').length;
    const channelCounts = {};
    
    videos.forEach(video => {
      const channelName = video.channels?.name || 'No Channel';
      channelCounts[channelName] = (channelCounts[channelName] || 0) + 1;
    });

    console.log('\n📊 Summary Statistics:');
    console.log('======================');
    console.log(`   Total Videos: ${videos.length}`);
    console.log(`   Published: ${publishedCount} (${Math.round(publishedCount/videos.length*100)}%)`);
    console.log(`   Unpublished: ${videos.length - publishedCount} (${Math.round((videos.length - publishedCount)/videos.length*100)}%)`);
    console.log(`   Synced: ${syncedCount} (${Math.round(syncedCount/videos.length*100)}%)`);

    console.log('\n📺 Videos by Channel:');
    Object.entries(channelCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([channel, count]) => {
        console.log(`   ${channel}: ${count} videos`);
      });

    // Show recent additions
    const recentVideos = videos.slice(0, 5);
    if (recentVideos.length > 0) {
      console.log('\n🆕 Most Recent Videos:');
      recentVideos.forEach((video, index) => {
        const date = new Date(video.created_at).toLocaleDateString();
        console.log(`   ${index + 1}. ${video.title} (${date})`);
      });
    }

    console.log('\n✅ Query completed successfully!');
    console.log('\n💡 Usage Tips:');
    console.log('   - Use --published-only to see only published videos');
    console.log('   - Use --ids-only to see just the Cloudflare video IDs');
    console.log('   - Run "npm run verify:videos" for full verification against Cloudflare Stream');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('   💡 Content table doesn\'t exist. Run: npm run db:setup');
    } else if (error.message.includes('authentication')) {
      console.error('   💡 Check your Supabase credentials in .env.local');
    }
    
    process.exit(1);
  }
}

// Add help text
if (args.includes('--help') || args.includes('-h')) {
  console.log('📖 Cloudflare Video ID Query Script');
  console.log('====================================\n');
  console.log('Usage:');
  console.log('  node scripts/query-video-ids.js                  # Show all videos with details');
  console.log('  node scripts/query-video-ids.js --published-only # Show only published videos');
  console.log('  node scripts/query-video-ids.js --ids-only       # Show only video IDs');
  console.log('  node scripts/query-video-ids.js --help           # Show this help\n');
  console.log('Examples:');
  console.log('  npm run query:videos');
  console.log('  npm run query:videos -- --published-only');
  console.log('  npm run query:videos -- --ids-only\n');
  process.exit(0);
}

queryVideoIDs();