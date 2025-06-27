/**
 * Test API endpoints for video playback
 */

async function testAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing API Endpoints\n');

  try {
    // 1. Test content listing API
    console.log('1️⃣ Testing /api/content endpoint...');
    const listResponse = await fetch(`${baseUrl}/api/content?status=published&limit=5`);
    const listData = await listResponse.json();
    
    console.log(`Status: ${listResponse.status}`);
    console.log(`Success: ${listData.success}`);
    console.log(`Content count: ${listData.data?.length || 0}`);
    
    if (listData.data && listData.data.length > 0) {
      console.log('\nFirst content item:');
      const firstItem = listData.data[0];
      console.log(`  ID: ${firstItem.id}`);
      console.log(`  Title: ${firstItem.title}`);
      console.log(`  Channels: ${JSON.stringify(firstItem.content_channels)}`);
      
      // 2. Test individual content API
      console.log(`\n2️⃣ Testing /api/content/${firstItem.id} endpoint...`);
      const itemResponse = await fetch(`${baseUrl}/api/content/${firstItem.id}`);
      const itemData = await itemResponse.json();
      
      console.log(`Status: ${itemResponse.status}`);
      console.log(`Success: ${itemData.success}`);
      
      if (itemData.data) {
        console.log('Content details:');
        console.log(`  Cloudflare ID: ${itemData.data.cloudflare_video_id}`);
        console.log(`  Channels: ${JSON.stringify(itemData.data.content_channels)}`);
      }
      
      // 3. Test debug endpoint
      console.log(`\n3️⃣ Testing /api/debug/video/${firstItem.id} endpoint...`);
      const debugResponse = await fetch(`${baseUrl}/api/debug/video/${firstItem.id}`);
      const debugData = await debugResponse.json();
      
      console.log(`Status: ${debugResponse.status}`);
      if (debugData.debug) {
        console.log('Debug info:');
        console.log(`  Has Cloudflare ID: ${debugData.debug.hasCloudflareVideoId}`);
        console.log(`  Has Channel ID: ${debugData.debug.hasChannelId}`);
        console.log(`  Channel Join Error: ${JSON.stringify(debugData.debug.channelJoinError)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test
testAPIs()
  .then(() => {
    console.log('\n✅ API tests complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });