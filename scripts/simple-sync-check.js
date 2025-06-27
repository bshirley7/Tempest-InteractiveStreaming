/**
 * Simple sync check that can be run to debug the 8 missing videos
 * This script provides detailed output about what's blocking the sync
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function simpleSyncCheck() {
  console.log('🔍 Simple Sync Check - Debugging 8 Missing Videos\n');
  
  try {
    console.log('1️⃣ Testing API Connectivity...');
    
    // Test if APIs are accessible
    try {
      const testResponse = await fetch(`${BASE_URL}/api/stream`);
      if (testResponse.ok) {
        console.log('✅ Stream API accessible');
      } else {
        console.log(`❌ Stream API failed: ${testResponse.status}`);
        return;
      }
    } catch (error) {
      console.log(`❌ Cannot reach APIs: ${error.message}`);
      console.log('   Make sure the development server is running: npm run dev');
      return;
    }
    
    console.log('\n2️⃣ Getting Current Sync Status...');
    
    const statusResponse = await fetch(`${BASE_URL}/api/content-library/sync`);
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      console.log(`📊 Current Status:`);
      console.log(`   Cloudflare videos: ${statusData.sync_status.cloudflare_videos}`);
      console.log(`   Supabase videos: ${statusData.sync_status.supabase_videos}`);
      console.log(`   Missing videos: ${statusData.sync_status.missing_videos}`);
      console.log(`   Is synced: ${statusData.sync_status.is_synced ? 'Yes' : 'No'}`);
    } else {
      console.log(`❌ Status check failed: ${statusData.error}`);
      return;
    }
    
    console.log('\n3️⃣ Analyzing Cloudflare Videos...');
    
    const streamResponse = await fetch(`${BASE_URL}/api/stream`);
    const streamData = await streamResponse.json();
    
    if (!streamData.success) {
      console.log(`❌ Failed to get Cloudflare videos: ${streamData.error}`);
      return;
    }
    
    const allVideos = streamData.videos;
    const readyVideos = allVideos.filter(v => v.status?.state === 'ready' && v.readyToStream);
    const pendingVideos = allVideos.filter(v => v.status?.state === 'pendingupload');
    const processingVideos = allVideos.filter(v => 
      ['inprogress', 'queued', 'downloading'].includes(v.status?.state)
    );
    const errorVideos = allVideos.filter(v => v.status?.state === 'error');
    
    console.log(`📈 Video Status Breakdown:`);
    console.log(`   Total videos: ${allVideos.length}`);
    console.log(`   Ready to stream: ${readyVideos.length}`);
    console.log(`   Pending upload: ${pendingVideos.length}`);
    console.log(`   Processing: ${processingVideos.length}`);
    console.log(`   Error state: ${errorVideos.length}`);
    
    console.log('\n4️⃣ Checking Supabase Content...');
    
    const contentResponse = await fetch(`${BASE_URL}/api/content`);
    const contentData = await contentResponse.json();
    
    let supabaseVideoIds = new Set();
    if (contentData.success && contentData.data) {
      contentData.data.forEach(video => {
        if (video.cloudflare_video_id) {
          supabaseVideoIds.add(video.cloudflare_video_id);
        }
      });
    }
    
    console.log(`📊 Supabase Analysis:`);
    console.log(`   Videos with Cloudflare IDs: ${supabaseVideoIds.size}`);
    
    console.log('\n5️⃣ Finding Missing Videos...');
    
    const missingVideos = readyVideos.filter(video => !supabaseVideoIds.has(video.uid));
    
    console.log(`🎯 Analysis Results:`);
    console.log(`   Ready videos in Cloudflare: ${readyVideos.length}`);
    console.log(`   Videos in Supabase: ${supabaseVideoIds.size}`);
    console.log(`   Missing from Supabase: ${missingVideos.length}`);
    
    if (missingVideos.length > 0) {
      console.log('\n📋 Missing Videos Details:');
      missingVideos.forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.uid}`);
        console.log(`      Name: ${video.meta?.name || 'Unnamed'}`);
        console.log(`      Status: ${video.status.state} (Ready: ${video.readyToStream})`);
        console.log(`      Duration: ${video.duration || 'Unknown'}s`);
        console.log(`      Created: ${new Date(video.created).toLocaleDateString()}`);
      });
    }
    
    console.log('\n6️⃣ Checking Channels...');
    
    try {
      const channelsResponse = await fetch(`${BASE_URL}/api/admin/channels`);
      const channelsData = await channelsResponse.json();
      
      if (channelsData.success && channelsData.data && channelsData.data.length > 0) {
        const activeChannels = channelsData.data.filter(c => c.is_active);
        console.log(`✅ Channels available: ${channelsData.data.length} total, ${activeChannels.length} active`);
      } else {
        console.log(`⚠️  No channels found - this could block sync!`);
      }
    } catch (channelError) {
      console.log(`⚠️  Could not check channels: ${channelError.message}`);
    }
    
    console.log('\n7️⃣ Recommended Actions:');
    
    if (missingVideos.length > 0) {
      console.log(`\n🔧 To sync ${missingVideos.length} missing videos:`);
      console.log('   Option A: Use the force sync API directly');
      console.log('   Option B: Try the manual sync button in the admin dashboard');
      console.log('   Option C: Run the force sync via browser console');
    }
    
    if (pendingVideos.length > 0) {
      console.log(`\n🧹 Clean up ${pendingVideos.length} stuck pending uploads:`);
      console.log('   These should be deleted from Cloudflare dashboard');
    }
    
    console.log('\n🌐 Browser Console Method:');
    console.log('   1. Open browser dev tools (F12)');
    console.log('   2. Go to Console tab');
    console.log('   3. Run this command:');
    console.log(`   
fetch('/api/content-library/force-sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sync_all_ready: true })
}).then(r => r.json()).then(console.log);
    `);
    
  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

// Run the check
simpleSyncCheck()
  .then(() => {
    console.log('\n🎯 Simple sync check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Check failed:', error);
    process.exit(1);
  });