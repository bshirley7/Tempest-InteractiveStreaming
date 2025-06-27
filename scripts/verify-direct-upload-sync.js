/**
 * Verify Direct Upload Sync Readiness
 * Run this after uploading videos directly to Cloudflare to check sync status
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
  try {
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
  } catch (error) {
    console.error('Failed to fetch Cloudflare videos:', error.message);
    throw error;
  }
}

/**
 * Get content from Supabase via API (public endpoint)
 */
async function getSupabaseContent() {
  try {
    // Try without auth first (public read access)
    const response = await fetch(`${BASE_URL}/api/content?limit=1000`);
    
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    } else {
      console.log(`ℹ️  API requires auth (${response.status}), using direct analysis`);
      return null;
    }
  } catch (error) {
    console.log('ℹ️  Cannot reach API, using direct analysis');
    return null;
  }
}

async function verifyDirectUploadSync() {
  console.log('🔍 Verifying Direct Upload Sync Readiness\n');

  try {
    console.log('1️⃣ Fetching videos from Cloudflare Stream...');
    const cloudflareVideos = await getCloudflareVideos();
    console.log(`   Found ${cloudflareVideos.length} total videos`);

    if (cloudflareVideos.length === 0) {
      console.log('✅ No videos in Cloudflare Stream - ready for uploads!');
      return;
    }

    // Categorize videos by status
    const readyVideos = cloudflareVideos.filter(v => 
      v.status?.state === 'ready' && v.readyToStream
    );
    const pendingVideos = cloudflareVideos.filter(v => 
      v.status?.state === 'pendingupload'
    );
    const processingVideos = cloudflareVideos.filter(v => 
      ['inprogress', 'queued', 'downloading'].includes(v.status?.state)
    );
    const errorVideos = cloudflareVideos.filter(v => 
      v.status?.state === 'error'
    );

    console.log('\n📊 Cloudflare Video Status:');
    console.log(`   Ready to sync: ${readyVideos.length}`);
    console.log(`   Pending upload: ${pendingVideos.length}`);
    console.log(`   Processing: ${processingVideos.length}`);
    console.log(`   Error state: ${errorVideos.length}`);

    if (pendingVideos.length > 0) {
      console.log('\n⚠️  Pending Upload Videos Found:');
      pendingVideos.forEach((video, index) => {
        const age = Math.round((Date.now() - new Date(video.created)) / (1000 * 60 * 60));
        console.log(`   ${index + 1}. ${video.uid} - ${video.meta?.name || 'Unnamed'} (${age}h old)`);
      });
      console.log('   These will NOT sync until they reach "Ready" status');
      if (pendingVideos.some(v => (Date.now() - new Date(v.created)) > 60 * 60 * 1000)) {
        console.log('   💡 Consider deleting videos stuck >1 hour');
      }
    }

    if (errorVideos.length > 0) {
      console.log('\n❌ Error State Videos:');
      errorVideos.forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.uid} - ${video.meta?.name || 'Unnamed'}`);
      });
      console.log('   These need to be re-uploaded');
    }

    console.log('\n2️⃣ Checking Supabase content...');
    const supabaseContent = await getSupabaseContent();
    
    let supabaseVideoIds = new Set();
    if (supabaseContent) {
      supabaseContent.forEach(item => {
        if (item.cloudflare_video_id) {
          supabaseVideoIds.add(item.cloudflare_video_id);
        }
      });
      console.log(`   Found ${supabaseVideoIds.size} videos with Cloudflare IDs`);
    } else {
      console.log(`   Cannot access Supabase via API (needs authentication)`);
    }

    console.log('\n3️⃣ Sync Analysis:');
    
    if (readyVideos.length === 0) {
      console.log('   ✅ No ready videos to sync');
    } else {
      const unsynced = supabaseContent ? 
        readyVideos.filter(v => !supabaseVideoIds.has(v.uid)) : 
        readyVideos;
      
      if (supabaseContent) {
        console.log(`   Ready videos: ${readyVideos.length}`);
        console.log(`   Already synced: ${readyVideos.length - unsynced.length}`);
        console.log(`   Need syncing: ${unsynced.length}`);
        
        if (unsynced.length > 0) {
          console.log('\n📋 Videos Ready for Sync:');
          unsynced.slice(0, 5).forEach((video, index) => {
            console.log(`   ${index + 1}. ${video.uid} - ${video.meta?.name || 'Unnamed'}`);
          });
          if (unsynced.length > 5) {
            console.log(`   ... and ${unsynced.length - 5} more`);
          }
        }
      } else {
        console.log(`   Ready videos found: ${readyVideos.length}`);
        console.log(`   (Cannot verify sync status without API access)`);
      }
    }

    console.log('\n4️⃣ Sync Readiness Check:');
    
    const hasReadyVideos = readyVideos.length > 0;
    const hasStuckVideos = pendingVideos.some(v => 
      (Date.now() - new Date(v.created)) > 60 * 60 * 1000
    );
    const hasErrorVideos = errorVideos.length > 0;

    if (!hasReadyVideos && !hasStuckVideos && !hasErrorVideos) {
      console.log('   ✅ Perfect! Ready for new uploads');
    } else {
      console.log('   📝 Recommendations:');
      
      if (hasStuckVideos) {
        console.log('   🗑️  Delete stuck videos (>1 hour pending)');
      }
      
      if (hasErrorVideos) {
        console.log('   🔄 Re-upload error videos');
      }
      
      if (hasReadyVideos) {
        console.log('   📥 Run sync to import ready videos');
      }
    }

    console.log('\n💡 How to Sync After Upload:');
    console.log('   1. Upload video directly to Cloudflare Stream');
    console.log('   2. Wait for "Ready" status (not "Pending Upload")');
    console.log('   3. Go to admin sync dashboard');
    console.log('   4. Click "Force Sync Ready Videos"');
    console.log('   5. Verify video appears in content management');
    
    console.log('\n🌐 Admin Dashboard:');
    console.log(`   ${BASE_URL}/admin/sync-dashboard`);
    
    if (BASE_URL.includes('localhost')) {
      console.log('   ⚠️  Make sure dev server is running: npm run dev');
    }

  } catch (error) {
    console.error('💥 Verification failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check Cloudflare API credentials');
    console.error('2. Ensure development server is running');
    console.error('3. Verify network connectivity');
  }
}

// Run verification
verifyDirectUploadSync()
  .then(() => {
    console.log('\n🎯 Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  });