/**
 * Test script to check ad video sync functionality
 * Usage: node scripts/test-ad-video-sync.js
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testAdVideoSync() {
  console.log('🧪 Testing Ad Video Sync with Cloudflare Stream...\n');
  
  try {
    // 1. First get the current status summary
    console.log('📊 Getting current video status summary...');
    const summaryResponse = await fetch(`${BASE_URL}/api/admin/ad-videos/sync-status`);
    const summaryData = await summaryResponse.json();
    
    if (summaryData.success) {
      console.log('✅ Current status summary:');
      console.log(`   Total videos: ${summaryData.summary.total}`);
      console.log(`   Needs update: ${summaryData.summary.needs_update}`);
      console.log(`   Status breakdown:`, summaryData.summary.by_status);
    } else {
      console.log('❌ Failed to get status summary:', summaryData.error);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Run sync for all videos
    console.log('🔄 Running sync for all ad videos...');
    const syncResponse = await fetch(`${BASE_URL}/api/admin/ad-videos/sync-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ check_all: true }),
    });
    
    const syncData = await syncResponse.json();
    
    if (syncData.success) {
      console.log('✅ Sync completed successfully!');
      console.log(`   ${syncData.message}`);
      console.log('\n📈 Sync Summary:');
      console.log(`   Total checked: ${syncData.summary.total_checked}`);
      console.log(`   Updated: ${syncData.summary.updated}`);
      console.log(`   No change: ${syncData.summary.no_change}`);
      console.log(`   Errors: ${syncData.summary.errors}`);
      
      if (syncData.results && syncData.results.length > 0) {
        console.log('\n📋 Detailed Results:');
        syncData.results.forEach((result, index) => {
          console.log(`   ${index + 1}. Video ${result.video_id} (${result.cloudflare_video_id}):`);
          console.log(`      Status: ${result.status}`);
          
          if (result.status === 'updated') {
            console.log(`      Changed: ${result.old_status} → ${result.new_status}`);
            console.log(`      Cloudflare State: ${result.cloudflare_state}`);
            console.log(`      Ready to Stream: ${result.ready_to_stream}`);
          } else if (result.status === 'no_change') {
            console.log(`      Current Status: ${result.current_status}`);
            console.log(`      Cloudflare State: ${result.cloudflare_state}`);
            console.log(`      Ready to Stream: ${result.ready_to_stream}`);
          } else if (result.status === 'error') {
            console.log(`      Error: ${result.error}`);
          } else if (result.status === 'not_found_in_cloudflare') {
            console.log(`      ⚠️  Video not found in Cloudflare Stream`);
          }
        });
      }
    } else {
      console.log('❌ Sync failed:', syncData.error);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Get updated summary
    console.log('📊 Getting updated status summary...');
    const updatedSummaryResponse = await fetch(`${BASE_URL}/api/admin/ad-videos/sync-status`);
    const updatedSummaryData = await updatedSummaryResponse.json();
    
    if (updatedSummaryData.success) {
      console.log('✅ Updated status summary:');
      console.log(`   Total videos: ${updatedSummaryData.summary.total}`);
      console.log(`   Needs update: ${updatedSummaryData.summary.needs_update}`);
      console.log(`   Status breakdown:`, updatedSummaryData.summary.by_status);
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    process.exit(1);
  }
}

// Run the test
testAdVideoSync()
  .then(() => {
    console.log('\n🎉 Ad video sync test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });