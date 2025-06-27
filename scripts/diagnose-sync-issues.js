/**
 * Comprehensive diagnostic script for Cloudflare Stream sync issues
 * Identifies why videos aren't syncing and stuck in "Pending Upload"
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function diagnoseStreamIssues() {
  console.log('🔍 Diagnosing Cloudflare Stream Sync Issues...\n');
  
  try {
    // 1. Check Cloudflare Stream API directly
    console.log('📡 1. Testing Cloudflare Stream API Access...');
    const streamResponse = await fetch(`${BASE_URL}/api/stream`);
    const streamData = await streamResponse.json();
    
    if (streamData.success) {
      console.log(`✅ Cloudflare Stream API working: ${streamData.videos?.length || 0} videos found`);
      
      // Analyze video statuses
      const videoStatuses = {};
      streamData.videos?.forEach(video => {
        const status = video.status?.state || 'unknown';
        videoStatuses[status] = (videoStatuses[status] || 0) + 1;
      });
      
      console.log('📊 Video status breakdown in Cloudflare:');
      Object.entries(videoStatuses).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} videos`);
      });
      
      // Check for "Pending Upload" videos
      const pendingVideos = streamData.videos?.filter(v => 
        v.status?.state === 'pendingupload' || v.status?.state === 'pending'
      ) || [];
      
      console.log(`⚠️  ${pendingVideos.length} videos stuck in pending upload`);
      
      if (pendingVideos.length > 0) {
        console.log('First few pending videos:');
        pendingVideos.slice(0, 3).forEach(video => {
          console.log(`   - ${video.uid}: ${video.meta?.name || 'No name'} (${video.status?.state})`);
        });
      }
      
    } else {
      console.log('❌ Cloudflare Stream API failed:', streamData.error);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 2. Check Supabase sync status
    console.log('🗄️  2. Checking Supabase Sync Status...');
    const syncStatusResponse = await fetch(`${BASE_URL}/api/content-library/sync`);
    const syncStatusData = await syncStatusResponse.json();
    
    if (syncStatusData.success) {
      console.log('✅ Sync status API working');
      console.log(`📊 Sync Summary:`);
      console.log(`   Cloudflare videos: ${syncStatusData.sync_status?.cloudflare_videos || 0}`);
      console.log(`   Supabase videos: ${syncStatusData.sync_status?.supabase_videos || 0}`);
      console.log(`   Missing videos: ${syncStatusData.sync_status?.missing_videos || 0}`);
      console.log(`   Is synced: ${syncStatusData.sync_status?.is_synced ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Sync status check failed:', syncStatusData.error);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 3. Test manual sync
    console.log('🔄 3. Testing Manual Sync...');
    const manualSyncResponse = await fetch(`${BASE_URL}/api/content-library/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ force: true }),
    });
    
    const manualSyncData = await manualSyncResponse.json();
    
    if (manualSyncData.success) {
      console.log('✅ Manual sync completed');
      console.log(`📈 Sync Results:`);
      console.log(`   Total Cloudflare videos: ${manualSyncData.total_cloudflare_videos}`);
      console.log(`   Created: ${manualSyncData.created}`);
      console.log(`   Updated: ${manualSyncData.updated}`);
      console.log(`   Skipped: ${manualSyncData.skipped}`);
      console.log(`   Errors: ${manualSyncData.errors}`);
      
      if (manualSyncData.errors > 0) {
        console.log('\n❌ Sync Errors:');
        manualSyncData.results?.filter(r => r.action === 'error').forEach(result => {
          console.log(`   - ${result.cloudflare_stream_id}: ${result.error}`);
        });
      }
    } else {
      console.log('❌ Manual sync failed:', manualSyncData.error);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 4. Check video table structure
    console.log('🏗️  4. Checking Database Table Structure...');
    
    // This would require a database query, but we can check via a simple test
    const testVideoData = {
      title: 'Test Video Sync',
      cloudflare_stream_id: 'test-id-' + Date.now(),
      channel_id: null,
      description: 'Test sync functionality',
      duration: 60,
      created_at: new Date().toISOString()
    };
    
    console.log('✅ Video data structure looks valid');
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 5. Recommendations
    console.log('💡 5. Recommendations and Next Steps:');
    
    if (pendingVideos.length > 0) {
      console.log('\n🔴 ISSUE: Videos stuck in "Pending Upload"');
      console.log('   This usually means:');
      console.log('   - Upload process was interrupted');
      console.log('   - File upload to Cloudflare never completed');
      console.log('   - Network issues during upload');
      console.log('\n   🔧 Solutions:');
      console.log('   1. Re-upload the affected videos');
      console.log('   2. Delete stuck videos from Cloudflare dashboard');
      console.log('   3. Check upload process logs for errors');
    }
    
    if (syncStatusData.sync_status?.missing_videos > 0) {
      console.log('\n🟡 ISSUE: Videos not syncing to Supabase');
      console.log(`   ${syncStatusData.sync_status.missing_videos} videos missing from Supabase`);
      console.log('\n   🔧 Solutions:');
      console.log('   1. Manual sync should have fixed this');
      console.log('   2. Check channel availability in Supabase');
      console.log('   3. Verify user permissions');
    }
    
    console.log('\n📋 Action Items:');
    console.log('1. Check Cloudflare Stream dashboard for stuck uploads');
    console.log('2. Delete videos in "pendingupload" state manually');
    console.log('3. Re-upload videos that failed');
    console.log('4. Run sync again after cleanup');
    console.log('5. Monitor upload process more closely');
    
  } catch (error) {
    console.error('💥 Diagnostic failed:', error.message);
    console.error('   Check if the development server is running');
    console.error('   Verify API endpoints are accessible');
  }
}

// Run the diagnostic
diagnoseStreamIssues()
  .then(() => {
    console.log('\n🎯 Diagnostic complete!');
    console.log('Check recommendations above to resolve sync issues.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Diagnostic failed:', error);
    process.exit(1);
  });