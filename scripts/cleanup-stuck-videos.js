/**
 * Cleanup stuck videos from Cloudflare Stream
 * This will identify and delete videos that are stuck in 'pendingupload' state
 */

const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Cloudflare configuration
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_TOKEN) {
  console.error('❌ Missing Cloudflare credentials in environment variables');
  console.error('   CLOUDFLARE_ACCOUNT_ID:', !!CLOUDFLARE_ACCOUNT_ID);
  console.error('   CLOUDFLARE_STREAM_API_TOKEN:', !!CLOUDFLARE_STREAM_TOKEN);
  process.exit(1);
}

const CLOUDFLARE_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;

/**
 * Get all videos from Cloudflare Stream
 */
async function getCloudflareVideos() {
  try {
    const response = await fetch(CLOUDFLARE_API_BASE, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Failed to fetch Cloudflare videos:', error.message);
    throw error;
  }
}

/**
 * Delete a video from Cloudflare Stream
 */
async function deleteVideo(videoId) {
  try {
    const response = await fetch(`${CLOUDFLARE_API_BASE}/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error(`Failed to delete video ${videoId}:`, error.message);
    return false;
  }
}

/**
 * Main cleanup function
 */
async function cleanupStuckVideos() {
  console.log('🧹 Cloudflare Stream Cleanup - Removing Stuck Videos\n');

  try {
    console.log('1️⃣ Fetching all videos from Cloudflare Stream...');
    const allVideos = await getCloudflareVideos();
    console.log(`   Found ${allVideos.length} total videos`);

    if (allVideos.length === 0) {
      console.log('✅ No videos found in Cloudflare Stream');
      return;
    }

    // Categorize videos by status
    const videosByStatus = {
      ready: allVideos.filter(v => v.status?.state === 'ready'),
      pendingupload: allVideos.filter(v => v.status?.state === 'pendingupload'),
      processing: allVideos.filter(v => ['inprogress', 'queued', 'downloading'].includes(v.status?.state)),
      error: allVideos.filter(v => v.status?.state === 'error'),
      other: allVideos.filter(v => !['ready', 'pendingupload', 'inprogress', 'queued', 'downloading', 'error'].includes(v.status?.state))
    };

    console.log('\n📊 Video Status Summary:');
    console.log(`   Ready: ${videosByStatus.ready.length}`);
    console.log(`   Pending Upload: ${videosByStatus.pendingupload.length}`);
    console.log(`   Processing: ${videosByStatus.processing.length}`);
    console.log(`   Error: ${videosByStatus.error.length}`);
    console.log(`   Other: ${videosByStatus.other.length}`);

    // Identify stuck videos (pending uploads that are likely stuck)
    const stuckVideos = videosByStatus.pendingupload.filter(video => {
      // Consider videos stuck if they've been pending for more than an hour
      const uploadTime = new Date(video.created);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return uploadTime < hourAgo;
    });

    console.log(`\n🎯 Found ${stuckVideos.length} stuck videos (pending upload > 1 hour)`);

    if (stuckVideos.length === 0) {
      console.log('✅ No stuck videos to clean up!');
      return;
    }

    // Show stuck videos details
    console.log('\n📋 Stuck Videos Details:');
    stuckVideos.forEach((video, index) => {
      const age = Math.round((Date.now() - new Date(video.created)) / (1000 * 60 * 60));
      console.log(`   ${index + 1}. ${video.uid}`);
      console.log(`      Name: ${video.meta?.name || 'Unnamed'}`);
      console.log(`      Status: ${video.status?.state}`);
      console.log(`      Created: ${new Date(video.created).toLocaleString()}`);
      console.log(`      Age: ${age} hours`);
      console.log(`      Size: ${video.size ? Math.round(video.size / 1024 / 1024) + 'MB' : 'Unknown'}`);
    });

    // Ask for confirmation (simulate user input for script)
    console.log(`\n⚠️  WARNING: This will permanently delete ${stuckVideos.length} stuck videos from Cloudflare Stream!`);
    console.log('   These videos cannot be recovered after deletion.');
    console.log('   Only videos stuck in "pendingupload" for >1 hour will be deleted.\n');

    // In a real scenario, you'd want to prompt for confirmation
    // For now, we'll proceed with deletion
    console.log('🗑️  Proceeding with deletion...\n');

    let deletedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < stuckVideos.length; i++) {
      const video = stuckVideos[i];
      console.log(`Deleting ${i + 1}/${stuckVideos.length}: ${video.uid} (${video.meta?.name || 'Unnamed'})`);
      
      const success = await deleteVideo(video.uid);
      if (success) {
        deletedCount++;
        console.log(`   ✅ Deleted successfully`);
      } else {
        failedCount++;
        console.log(`   ❌ Failed to delete`);
      }

      // Add small delay to avoid rate limiting
      if (i < stuckVideos.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 Cleanup Summary:');
    console.log(`   Videos processed: ${stuckVideos.length}`);
    console.log(`   Successfully deleted: ${deletedCount}`);
    console.log(`   Failed to delete: ${failedCount}`);

    if (deletedCount > 0) {
      console.log(`\n🎉 Successfully cleaned up ${deletedCount} stuck videos!`);
      console.log('   Your Cloudflare Stream dashboard should now show fewer stuck uploads.');
    }

    if (failedCount > 0) {
      console.log(`\n⚠️  ${failedCount} videos could not be deleted automatically.`);
      console.log('   You may need to delete these manually from the Cloudflare dashboard.');
    }

    // Show remaining video counts
    const remainingReady = videosByStatus.ready.length;
    const remainingPending = videosByStatus.pendingupload.length - deletedCount;
    
    console.log('\n📊 Remaining Videos After Cleanup:');
    console.log(`   Ready videos: ${remainingReady}`);
    console.log(`   Pending uploads: ${remainingPending}`);
    console.log(`   Processing: ${videosByStatus.processing.length}`);
    console.log(`   Error state: ${videosByStatus.error.length}`);

    console.log('\n💡 Next Steps:');
    console.log('1. Run the sync dashboard to check if ready videos sync properly');
    console.log('2. If there are still pending uploads, they may be actively processing');
    console.log('3. Check the Cloudflare Stream dashboard to verify cleanup');
    console.log('4. Re-upload any important videos that were deleted');

  } catch (error) {
    console.error('💥 Cleanup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your Cloudflare API credentials');
    console.error('2. Verify your account ID and API token');
    console.error('3. Ensure you have permission to delete videos');
    throw error;
  }
}

// Add safety check
if (require.main === module) {
  console.log('⚠️  SAFETY WARNING: This script will delete videos from Cloudflare Stream!');
  console.log('   Make sure you have backups of any important videos.');
  console.log('   Press Ctrl+C within 5 seconds to cancel...\n');
  
  setTimeout(() => {
    cleanupStuckVideos()
      .then(() => {
        console.log('\n🎯 Cleanup process complete!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Cleanup failed:', error);
        process.exit(1);
      });
  }, 5000);
}

module.exports = { cleanupStuckVideos, getCloudflareVideos, deleteVideo };