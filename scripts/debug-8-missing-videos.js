/**
 * Debug the specific 8 videos that are Ready in Cloudflare but not syncing to Supabase
 * This will identify exactly what's blocking them
 */

const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_TOKEN) {
  console.error('❌ Missing Cloudflare credentials');
  process.exit(1);
}

/**
 * Get videos directly from Cloudflare API
 */
async function getCloudflareVideos() {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
    {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Cloudflare API error: ${response.status}`);
  }

  const data = await response.json();
  return data.result || [];
}

/**
 * Get individual video details from Cloudflare
 */
async function getCloudflareVideoDetails(videoId) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return { error: `API error: ${response.status}` };
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Check if video exists in Supabase content table
 */
async function checkSupabaseContent() {
  try {
    const response = await fetch(`${BASE_URL}/api/content?limit=1000`);
    
    if (!response.ok) {
      console.log(`⚠️  Cannot access content API: ${response.status}`);
      return new Set();
    }

    const data = await response.json();
    const videoIds = new Set();
    
    if (data.success && data.data) {
      data.data.forEach(item => {
        if (item.cloudflare_video_id) {
          videoIds.add(item.cloudflare_video_id);
        }
      });
    }
    
    return videoIds;
  } catch (error) {
    console.log(`⚠️  Cannot reach content API: ${error.message}`);
    return new Set();
  }
}

/**
 * Test the force sync API with specific video
 */
async function testForceSyncSingle(videoId) {
  try {
    const response = await fetch(`${BASE_URL}/api/content-library/force-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        video_ids: [videoId]
      }),
    });

    const result = await response.json();
    return {
      status: response.status,
      success: result.success,
      error: result.error,
      details: result.details,
      message: result.message
    };
  } catch (error) {
    return {
      status: 'network_error',
      error: error.message
    };
  }
}

async function debug8MissingVideos() {
  console.log('🔍 Debugging 8 Missing Videos - Deep Analysis\n');

  try {
    console.log('1️⃣ Getting all Cloudflare videos...');
    const allVideos = await getCloudflareVideos();
    console.log(`   Found ${allVideos.length} total videos`);

    console.log('\n2️⃣ Filtering for ready videos...');
    const readyVideos = allVideos.filter(video => {
      const isReady = video.status?.state === 'ready';
      const canStream = video.readyToStream;
      return isReady && canStream;
    });
    console.log(`   Found ${readyVideos.length} ready videos`);

    if (readyVideos.length === 0) {
      console.log('✅ No ready videos found - nothing to sync!');
      return;
    }

    console.log('\n3️⃣ Checking Supabase content...');
    const supabaseVideoIds = await checkSupabaseContent();
    console.log(`   Found ${supabaseVideoIds.size} videos in Supabase`);

    console.log('\n4️⃣ Identifying missing videos...');
    const missingVideos = readyVideos.filter(video => !supabaseVideoIds.has(video.uid));
    console.log(`   Missing from Supabase: ${missingVideos.length}`);

    if (missingVideos.length === 0) {
      console.log('✅ All ready videos are already synced!');
      return;
    }

    console.log('\n📋 Missing Videos Analysis:');
    console.log('='.repeat(80));
    
    for (let i = 0; i < Math.min(missingVideos.length, 10); i++) {
      const video = missingVideos[i];
      console.log(`\n${i + 1}. Video ID: ${video.uid}`);
      console.log(`   Name: ${video.meta?.name || 'Unnamed'}`);
      console.log(`   Status: ${video.status?.state}`);
      console.log(`   Ready to Stream: ${video.readyToStream}`);
      console.log(`   Duration: ${video.duration || 'Unknown'}s`);
      console.log(`   Size: ${video.size ? Math.round(video.size / 1024 / 1024) + 'MB' : 'Unknown'}`);
      console.log(`   Created: ${new Date(video.created).toLocaleString()}`);
      console.log(`   Modified: ${new Date(video.modified).toLocaleString()}`);
      
      // Get detailed video info
      console.log('   📝 Getting detailed info...');
      const details = await getCloudflareVideoDetails(video.uid);
      if (details.error) {
        console.log(`   ❌ Error getting details: ${details.error}`);
      } else {
        console.log(`   ✅ Video accessible via API`);
        console.log(`   Thumbnail: ${details.thumbnail ? 'Available' : 'Missing'}`);
        console.log(`   Preview: ${details.preview ? 'Available' : 'Missing'}`);
        console.log(`   Playback URL: ${details.playback?.hls ? 'Available' : 'Missing'}`);
        
        // Check metadata structure
        if (details.meta) {
          console.log(`   Metadata: ${Object.keys(details.meta).length} fields`);
          if (details.meta.name) {
            console.log(`   Title: "${details.meta.name}"`);
          }
        } else {
          console.log(`   ⚠️  No metadata found`);
        }
      }
      
      // Test force sync for this specific video
      console.log('   🧪 Testing force sync...');
      const syncTest = await testForceSyncSingle(video.uid);
      console.log(`   Sync Test Status: ${syncTest.status}`);
      if (syncTest.success === false) {
        console.log(`   ❌ Sync Error: ${syncTest.error}`);
        if (syncTest.details) {
          console.log(`   Details: ${syncTest.details}`);
        }
      } else if (syncTest.status === 401 || syncTest.status === 403) {
        console.log(`   🔒 Authentication required for API test`);
      } else {
        console.log(`   Response: ${JSON.stringify(syncTest, null, 2)}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (missingVideos.length > 10) {
      console.log(`\n... and ${missingVideos.length - 10} more videos`);
    }

    console.log('\n🔍 Common Issues Analysis:');
    console.log('='.repeat(80));
    
    // Check for common patterns
    const hasMetadata = missingVideos.filter(v => v.meta && Object.keys(v.meta).length > 0).length;
    const hasNames = missingVideos.filter(v => v.meta?.name).length;
    const hasThumbnails = missingVideos.filter(v => v.thumbnail).length;
    const oldVideos = missingVideos.filter(v => 
      (Date.now() - new Date(v.created)) > 24 * 60 * 60 * 1000
    ).length;
    
    console.log(`📊 Pattern Analysis:`);
    console.log(`   Videos with metadata: ${hasMetadata}/${missingVideos.length}`);
    console.log(`   Videos with names: ${hasNames}/${missingVideos.length}`);
    console.log(`   Videos with thumbnails: ${hasThumbnails}/${missingVideos.length}`);
    console.log(`   Videos >24h old: ${oldVideos}/${missingVideos.length}`);
    
    console.log('\n💡 Recommended Actions:');
    console.log('1. Try force sync via admin dashboard (with auth)');
    console.log('2. Check browser console for detailed error messages');
    console.log('3. Verify database permissions and channel existence');
    console.log('4. Check if videos have required metadata fields');
    
    console.log('\n🌐 Next Steps:');
    console.log(`   Admin Dashboard: ${BASE_URL}/admin`);
    console.log('   1. Go to Sync Dashboard');
    console.log('   2. Click "Force Sync Ready Videos"');
    console.log('   3. Check browser console for errors');
    console.log('   4. Verify success/failure counts');

  } catch (error) {
    console.error('💥 Debug failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check Cloudflare API credentials');
    console.error('2. Ensure development server is running');
    console.error('3. Verify network connectivity');
  }
}

// Run debug
debug8MissingVideos()
  .then(() => {
    console.log('\n🎯 Debug analysis complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });