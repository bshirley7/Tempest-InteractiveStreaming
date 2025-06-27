/**
 * Force sync videos that were uploaded directly to Cloudflare
 * This will sync ready videos that aren't in Supabase yet
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function forceSyncDirectUploads() {
  console.log('🔄 Force Syncing Direct Cloudflare Uploads...\n');
  
  try {
    // 1. First, let's see what we're dealing with
    console.log('📊 Getting current sync status...');
    const statusResponse = await fetch(`${BASE_URL}/api/content-library/sync`);
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      console.log(`   Cloudflare videos: ${statusData.sync_status.cloudflare_videos}`);
      console.log(`   Supabase videos: ${statusData.sync_status.supabase_videos}`);
      console.log(`   Missing: ${statusData.sync_status.missing_videos}`);
      console.log(`   Currently synced: ${statusData.sync_status.is_synced ? 'Yes' : 'No'}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 2. Force sync all ready videos
    console.log('🚀 Starting force sync for all ready videos...');
    
    const forceSyncResponse = await fetch(`${BASE_URL}/api/content-library/force-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        sync_all_ready: true 
      }),
    });
    
    const forceSyncData = await forceSyncResponse.json();
    
    if (forceSyncData.success) {
      console.log('✅ Force sync completed successfully!');
      console.log(`   ${forceSyncData.message}`);
      
      console.log('\n📈 Sync Results:');
      console.log(`   Total processed: ${forceSyncData.summary.total_processed}`);
      console.log(`   Created: ${forceSyncData.summary.created}`);
      console.log(`   Updated: ${forceSyncData.summary.updated}`);
      console.log(`   Skipped: ${forceSyncData.summary.skipped}`);
      console.log(`   Errors: ${forceSyncData.summary.errors}`);
      
      if (forceSyncData.default_channel) {
        console.log(`\n📁 Default Channel Used:`);
        console.log(`   Name: ${forceSyncData.default_channel.name}`);
        console.log(`   ID: ${forceSyncData.default_channel.id}`);
        console.log(`   Slug: ${forceSyncData.default_channel.slug}`);
      }
      
      if (forceSyncData.results && forceSyncData.results.length > 0) {
        console.log('\n📋 Detailed Results:');
        forceSyncData.results.forEach((result, index) => {
          const status = result.action === 'created' ? '✅ CREATED' :
                        result.action === 'updated' ? '🔄 UPDATED' :
                        result.action === 'skipped' ? '⏭️  SKIPPED' :
                        result.action === 'error' ? '❌ ERROR' : '❓ UNKNOWN';
          
          console.log(`   ${index + 1}. ${status}: ${result.title}`);
          console.log(`      ID: ${result.cloudflare_stream_id}`);
          if (result.error) {
            console.log(`      Error: ${result.error}`);
          }
        });
      }
      
      // Success summary
      if (forceSyncData.summary.created > 0) {
        console.log(`\n🎉 SUCCESS: ${forceSyncData.summary.created} videos synced from Cloudflare to Supabase!`);
      } else if (forceSyncData.summary.total_processed === 0) {
        console.log('\n✅ All ready videos are already synced!');
      } else {
        console.log('\n⚠️  No new videos were created. Check results above for details.');
      }
      
    } else {
      console.log('❌ Force sync failed:', forceSyncData.error);
      if (forceSyncData.details) {
        console.log('   Details:', forceSyncData.details);
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 3. Verify the results
    console.log('🔍 Verifying sync results...');
    const verifyStatusResponse = await fetch(`${BASE_URL}/api/content-library/sync`);
    const verifyStatusData = await verifyStatusResponse.json();
    
    if (verifyStatusData.success) {
      console.log('📊 Updated Status:');
      console.log(`   Cloudflare videos: ${verifyStatusData.sync_status.cloudflare_videos}`);
      console.log(`   Supabase videos: ${verifyStatusData.sync_status.supabase_videos}`);
      console.log(`   Missing: ${verifyStatusData.sync_status.missing_videos}`);
      console.log(`   Is synced: ${verifyStatusData.sync_status.is_synced ? '✅ Yes' : '❌ No'}`);
      
      if (verifyStatusData.sync_status.missing_videos === 0) {
        console.log('\n🎯 Perfect! All videos are now synced.');
      } else {
        console.log(`\n⚠️  Still ${verifyStatusData.sync_status.missing_videos} videos missing.`);
        console.log('   These might be stuck/pending uploads that need cleanup.');
      }
    }
    
    console.log('\n💡 Next Steps:');
    console.log('1. Check your Supabase content library to see the synced videos');
    console.log('2. If videos are still missing, run cleanup-pending-uploads.js');
    console.log('3. Delete stuck videos from Cloudflare dashboard');
    console.log('4. Re-upload any videos that were lost');
    
  } catch (error) {
    console.error('💥 Force sync failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure the development server is running');
    console.error('2. Check that you have admin permissions');
    console.error('3. Verify Cloudflare Stream API configuration');
    console.error('4. Check database connectivity');
  }
}

// Run the force sync
forceSyncDirectUploads()
  .then(() => {
    console.log('\n🎯 Force sync process complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Force sync failed:', error);
    process.exit(1);
  });