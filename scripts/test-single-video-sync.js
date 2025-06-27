/**
 * Test syncing a single video to identify the exact issue
 * This will help debug why the 8 videos aren't syncing
 */

const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_TOKEN) {
  console.error('❌ Missing Cloudflare credentials');
  process.exit(1);
}

/**
 * Get first ready video that's not in Supabase
 */
async function getTestVideo() {
  // Get Cloudflare videos
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
  const videos = data.result || [];
  
  // Find ready videos
  const readyVideos = videos.filter(v => 
    v.status?.state === 'ready' && v.readyToStream
  );
  
  if (readyVideos.length === 0) {
    throw new Error('No ready videos found in Cloudflare');
  }
  
  return readyVideos[0]; // Return first ready video for testing
}

/**
 * Simulate the sync process step by step
 */
async function testVideoSyncProcess(video) {
  console.log(`🧪 Testing Sync Process for Video: ${video.uid}\n`);
  
  console.log('📋 Video Details:');
  console.log(`   ID: ${video.uid}`);
  console.log(`   Name: ${video.meta?.name || 'Unnamed'}`);
  console.log(`   Status: ${video.status?.state}`);
  console.log(`   Ready: ${video.readyToStream}`);
  console.log(`   Duration: ${video.duration || 'Unknown'}s`);
  console.log(`   Created: ${new Date(video.created).toLocaleString()}`);
  
  console.log('\n1️⃣ Testing metadata extraction...');
  
  // Simulate extractVideoMetadata function
  const title = video.meta?.name || `Video ${video.uid}`;
  const description = video.meta?.description || null;
  
  const tags = [];
  if (video.meta?.category) tags.push(video.meta.category);
  if (video.meta?.genre) tags.push(video.meta.genre);
  if (video.meta?.keywords) {
    tags.push(...video.meta.keywords.split(',').map(k => k.trim()));
  }

  const metadata = {};
  if (video.meta?.instructor) metadata.instructor = video.meta.instructor;
  if (video.meta?.difficulty_level) metadata.difficulty_level = video.meta.difficulty_level;
  if (video.meta?.target_audience) metadata.target_audience = video.meta.target_audience;
  if (video.meta?.learning_objectives) metadata.learning_objectives = video.meta.learning_objectives;
  if (video.meta?.prerequisites) metadata.prerequisites = video.meta.prerequisites;
  if (video.meta?.language) metadata.language = video.meta.language;

  const videoData = {
    title,
    description,
    tags: tags.length > 0 ? tags : null,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
    duration: video.duration || null,
    thumbnail_url: video.thumbnail || null,
    preview_url: video.preview || null,
    published_at: video.readyToStream ? video.created : null
  };
  
  console.log('   ✅ Metadata extracted:');
  console.log(`   Title: "${videoData.title}"`);
  console.log(`   Description: ${videoData.description || 'None'}`);
  console.log(`   Tags: ${videoData.tags ? videoData.tags.join(', ') : 'None'}`);
  console.log(`   Metadata fields: ${videoData.metadata ? Object.keys(videoData.metadata).length : 0}`);
  console.log(`   Duration: ${videoData.duration || 'Unknown'}`);
  console.log(`   Thumbnail: ${videoData.thumbnail_url ? 'Yes' : 'No'}`);
  console.log(`   Preview: ${videoData.preview_url ? 'Yes' : 'No'}`);
  
  console.log('\n2️⃣ Testing data structure for Supabase insert...');
  
  const insertData = {
    ...videoData,
    cloudflare_video_id: video.uid,
    channel_id: 1, // Assume default channel ID 1
    created_at: new Date().toISOString()
  };
  
  console.log('   ✅ Insert data structure:');
  console.log('   ```json');
  console.log(JSON.stringify(insertData, null, 2));
  console.log('   ```');
  
  console.log('\n3️⃣ Checking for potential issues...');
  
  const issues = [];
  
  // Check for empty/invalid fields
  if (!insertData.title || insertData.title.trim() === '') {
    issues.push('Empty or missing title');
  }
  
  if (insertData.title && insertData.title.length > 255) {
    issues.push('Title too long (>255 characters)');
  }
  
  if (insertData.description && insertData.description.length > 2000) {
    issues.push('Description too long (>2000 characters)');
  }
  
  if (!insertData.cloudflare_video_id) {
    issues.push('Missing cloudflare_video_id');
  }
  
  if (!insertData.channel_id) {
    issues.push('Missing channel_id');
  }
  
  // Check for JSON serialization issues
  try {
    JSON.stringify(insertData);
  } catch (error) {
    issues.push(`JSON serialization error: ${error.message}`);
  }
  
  if (issues.length === 0) {
    console.log('   ✅ No obvious data issues found');
  } else {
    console.log('   ❌ Potential issues found:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  console.log('\n4️⃣ Raw SQL equivalent...');
  console.log('   This is what would be executed:');
  console.log('   ```sql');
  console.log('   INSERT INTO content (');
  console.log('     title, description, tags, metadata, duration,');
  console.log('     thumbnail_url, preview_url, published_at,');
  console.log('     cloudflare_video_id, channel_id, created_at');
  console.log('   ) VALUES (');
  console.log(`     '${insertData.title}',`);
  console.log(`     ${insertData.description ? `'${insertData.description}'` : 'NULL'},`);
  console.log(`     ${insertData.tags ? `'${JSON.stringify(insertData.tags)}'` : 'NULL'},`);
  console.log(`     ${insertData.metadata ? `'${JSON.stringify(insertData.metadata)}'` : 'NULL'},`);
  console.log(`     ${insertData.duration || 'NULL'},`);
  console.log(`     ${insertData.thumbnail_url ? `'${insertData.thumbnail_url}'` : 'NULL'},`);
  console.log(`     ${insertData.preview_url ? `'${insertData.preview_url}'` : 'NULL'},`);
  console.log(`     ${insertData.published_at ? `'${insertData.published_at}'` : 'NULL'},`);
  console.log(`     '${insertData.cloudflare_video_id}',`);
  console.log(`     ${insertData.channel_id},`);
  console.log(`     '${insertData.created_at}'`);
  console.log('   );');
  console.log('   ```');
  
  return {
    video: video,
    extractedData: videoData,
    insertData: insertData,
    issues: issues
  };
}

async function runTest() {
  console.log('🔬 Single Video Sync Test\n');
  
  try {
    console.log('Getting first ready video from Cloudflare...');
    const testVideo = await getTestVideo();
    
    const result = await testVideoSyncProcess(testVideo);
    
    console.log('\n🎯 Test Summary:');
    console.log(`   Video ID: ${result.video.uid}`);
    console.log(`   Title: "${result.extractedData.title}"`);
    console.log(`   Issues found: ${result.issues.length}`);
    
    if (result.issues.length === 0) {
      console.log('\n✅ This video should sync successfully!');
      console.log('   The data structure looks correct for Supabase insertion.');
    } else {
      console.log('\n❌ This video has issues that could prevent syncing:');
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    console.log('\n💡 Next Steps:');
    console.log('1. Try syncing this specific video via admin dashboard');
    console.log('2. Check browser console for any error messages');
    console.log('3. Verify channel_id exists in channels table');
    console.log('4. Check database constraints and permissions');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

runTest()
  .then(() => {
    console.log('\n🧪 Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });