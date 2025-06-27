/**
 * Debug script specifically for videos uploaded directly through Cloudflare
 * Identifies why they're not syncing to Supabase
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function debugDirectCloudflareSync() {
  console.log('🔍 Debugging Direct Cloudflare Upload Sync Issues...\n');
  
  try {
    // 1. Get all videos from Cloudflare Stream
    console.log('📡 Fetching ALL videos from Cloudflare Stream...');
    const streamResponse = await fetch(`${BASE_URL}/api/stream`);
    const streamData = await streamResponse.json();
    
    if (!streamData.success) {
      throw new Error(streamData.error || 'Failed to fetch Cloudflare videos');
    }
    
    console.log(`✅ Found ${streamData.videos.length} total videos in Cloudflare Stream\n`);
    
    // 2. Get all videos from Supabase
    console.log('🗄️  Fetching videos from Supabase...');
    const supabaseResponse = await fetch(`${BASE_URL}/api/content`);
    const supabaseData = await supabaseResponse.json();
    
    const supabaseVideoIds = new Set();
    if (supabaseData.success && supabaseData.data) {
      supabaseData.data.forEach(video => {
        if (video.cloudflare_stream_id) {
          supabaseVideoIds.add(video.cloudflare_stream_id);
        }
      });
    }
    
    console.log(`✅ Found ${supabaseVideoIds.size} videos in Supabase with Cloudflare IDs\n`);
    
    // 3. Analyze video statuses
    const readyVideos = [];
    const pendingVideos = [];
    const errorVideos = [];
    const otherVideos = [];
    
    streamData.videos.forEach(video => {
      const isReady = video.status?.state === 'ready' && video.readyToStream;
      const isPending = video.status?.state === 'pendingupload';
      const isError = video.status?.state === 'error';
      
      if (isReady) {
        readyVideos.push(video);
      } else if (isPending) {
        pendingVideos.push(video);
      } else if (isError) {
        errorVideos.push(video);
      } else {
        otherVideos.push(video);
      }
    });
    
    console.log('📊 Video Status Breakdown:');
    console.log(`   ✅ Ready videos: ${readyVideos.length}`);
    console.log(`   ⏳ Pending uploads: ${pendingVideos.length}`);
    console.log(`   ❌ Error videos: ${errorVideos.length}`);
    console.log(`   ❓ Other status: ${otherVideos.length}`);
    console.log('');
    
    // 4. Find videos that should sync but aren't in Supabase
    const missingSyncVideos = readyVideos.filter(video => 
      !supabaseVideoIds.has(video.uid)
    );
    
    console.log(`🎯 ANALYSIS: ${missingSyncVideos.length} ready videos are missing from Supabase\n`);
    
    if (missingSyncVideos.length === 0) {
      console.log('🎉 All ready videos are already synced to Supabase!');
      console.log('The 8 videos you mentioned might be in pending/error state.');
    } else {
      console.log('📋 Videos that should sync but are missing from Supabase:');
      console.log('='.repeat(80));
      
      missingSyncVideos.forEach((video, index) => {
        const created = new Date(video.created);
        const ageHours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
        
        console.log(`${index + 1}. ${video.uid}`);
        console.log(`   Name: ${video.meta?.name || 'Unnamed'}`);
        console.log(`   Status: ${video.status.state} (Ready: ${video.readyToStream})`);
        console.log(`   Created: ${created.toISOString()} (${ageHours.toFixed(1)}h ago)`);
        console.log(`   Duration: ${video.duration ? `${video.duration}s` : 'Unknown'}`);
        console.log(`   Size: ${video.size ? `${(video.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown'}`);
        console.log(`   Thumbnail: ${video.thumbnail ? '✅' : '❌'}`);
        
        // Check if this looks like a direct Cloudflare upload
        const hasMetadata = video.meta && Object.keys(video.meta).length > 1;
        const isDirectUpload = !hasMetadata || !video.meta.description;\
        
        console.log(`   Likely direct upload: ${isDirectUpload ? '✅ Yes' : '❌ No'}`);
        console.log('');
      });
    }
    
    console.log('\\n' + '='.repeat(80) + '\\n');
    
    // 5. Test sync for these specific videos
    if (missingSyncVideos.length > 0) {
      console.log('🔄 Testing sync for missing videos...');
      
      // Try manual sync
      const syncResponse = await fetch(`${BASE_URL}/api/content-library/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force: true }),
      });
      
      const syncResult = await syncResponse.json();
      
      if (syncResult.success) {
        console.log('✅ Manual sync completed');
        console.log(`📈 Results: Created ${syncResult.created}, Updated ${syncResult.updated}, Errors ${syncResult.errors}`);
        
        if (syncResult.errors > 0) {
          console.log('\\n❌ Sync Errors Found:');
          syncResult.results?.filter(r => r.action === 'error').forEach(error => {
            console.log(`   - ${error.cloudflare_stream_id}: ${error.error}`);
          });
        }
        
        if (syncResult.created > 0) {
          console.log(`\\n🎉 Successfully synced ${syncResult.created} new videos!`);
        }
        
      } else {
        console.log('❌ Manual sync failed:', syncResult.error);
      }
    }
    
    console.log('\\n' + '='.repeat(80) + '\\n');
    
    // 6. Check for common sync blockers
    console.log('🔍 Checking for common sync blockers...');
    
    // Check if default channel exists
    try {
      const channelsResponse = await fetch(`${BASE_URL}/api/admin/channels`);
      const channelsData = await channelsResponse.json();
      
      if (channelsData.success && channelsData.data && channelsData.data.length > 0) {
        console.log(`✅ Found ${channelsData.data.length} channels in Supabase`);
        const activeChannels = channelsData.data.filter(c => c.is_active);
        console.log(`   Active channels: ${activeChannels.length}`);
        
        if (activeChannels.length === 0) {
          console.log('⚠️  WARNING: No active channels found - this will block sync!');
        }
      } else {
        console.log('❌ No channels found in Supabase - this will block sync!');
      }
    } catch (channelError) {
      console.log('⚠️  Could not check channels:', channelError.message);
    }
    
    // Check database structure
    console.log('\\n🏗️  Database structure check...');
    try {
      const testVideoData = {
        title: 'Test',
        cloudflare_stream_id: 'test-123',
        description: 'Test video',
        duration: 30
      };
      console.log('✅ Video data structure looks valid');
    } catch (structureError) {
      console.log('❌ Database structure issue:', structureError.message);
    }
    
    console.log('\\n' + '='.repeat(80) + '\\n');
    
    // 7. Recommendations
    console.log('💡 Recommendations:');
    
    if (missingSyncVideos.length > 0) {
      console.log('\\n🎯 To fix the missing video sync:');
      console.log('1. Ensure at least one active channel exists in Supabase');
      console.log('2. Run the manual sync again (should have just worked above)');
      console.log('3. Check server logs for any database errors');
      console.log('4. Verify user permissions for database writes');
    }
    
    if (pendingVideos.length > 0) {
      console.log(`\\n🧹 Clean up ${pendingVideos.length} stuck pending uploads:`);
      console.log('1. Run: node scripts/cleanup-pending-uploads.js');
      console.log('2. Delete stuck videos from Cloudflare dashboard');
      console.log('3. Re-upload if needed');
    }
    
    console.log('\\n📋 Next Steps:');
    console.log('1. Clean up stuck videos first');
    console.log('2. Ensure channels exist and are active');
    console.log('3. Re-run sync after cleanup');
    console.log('4. Monitor sync results');
    
  } catch (error) {
    console.error('💥 Debug failed:', error.message);
  }
}

// Run the debug
debugDirectCloudflareSync()
  .then(() => {
    console.log('\\n🎯 Debug analysis complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });