/**
 * Cleanup script for videos stuck in "Pending Upload" status
 * This script identifies and optionally removes videos that have been stuck for too long
 */

const fetch = require('node-fetch');
const readline = require('readline');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function cleanupPendingUploads() {
  console.log('🧹 Cleanup Tool for Stuck "Pending Upload" Videos\n');
  
  try {
    // 1. Get all videos from Cloudflare Stream
    console.log('📡 Fetching videos from Cloudflare Stream...');
    const response = await fetch(`${BASE_URL}/api/stream`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch videos');
    }
    
    console.log(`✅ Found ${data.videos.length} total videos\n`);
    
    // 2. Filter videos stuck in pending upload
    const pendingVideos = data.videos.filter(video => 
      video.status?.state === 'pendingupload' || 
      (video.status?.state === 'pending' && !video.readyToStream)
    );
    
    console.log(`🔍 Found ${pendingVideos.length} videos stuck in pending upload:\n`);
    
    if (pendingVideos.length === 0) {
      console.log('🎉 No stuck videos found! All uploads appear to be processing normally.');
      rl.close();
      return;
    }
    
    // 3. Show details of stuck videos
    console.log('📋 Stuck Videos:');
    console.log('='.repeat(80));
    
    pendingVideos.forEach((video, index) => {
      const created = new Date(video.created);
      const ageHours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
      
      console.log(`${index + 1}. ${video.uid}`);
      console.log(`   Name: ${video.meta?.name || 'Unnamed'}`);
      console.log(`   Status: ${video.status.state}`);
      console.log(`   Created: ${created.toISOString()} (${ageHours.toFixed(1)} hours ago)`);
      console.log(`   Size: ${video.size ? `${(video.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown'}`);
      console.log('');
    });
    
    // 4. Analyze age groups
    const veryOld = pendingVideos.filter(v => {
      const ageHours = (Date.now() - new Date(v.created).getTime()) / (1000 * 60 * 60);
      return ageHours > 24;
    });
    
    const old = pendingVideos.filter(v => {
      const ageHours = (Date.now() - new Date(v.created).getTime()) / (1000 * 60 * 60);
      return ageHours > 2 && ageHours <= 24;
    });
    
    const recent = pendingVideos.filter(v => {
      const ageHours = (Date.now() - new Date(v.created).getTime()) / (1000 * 60 * 60);
      return ageHours <= 2;
    });
    
    console.log('📊 Age Analysis:');
    console.log(`   Very old (>24h): ${veryOld.length} videos - 🔴 Definitely stuck`);
    console.log(`   Old (2-24h): ${old.length} videos - 🟡 Likely stuck`);
    console.log(`   Recent (<2h): ${recent.length} videos - 🟢 May still be processing`);
    console.log('');
    
    // 5. Recommendations
    console.log('💡 Recommendations:');
    if (veryOld.length > 0) {
      console.log(`   🔴 ${veryOld.length} videos older than 24h should be deleted`);
    }
    if (old.length > 0) {
      console.log(`   🟡 ${old.length} videos 2-24h old are likely stuck and should be reviewed`);
    }
    if (recent.length > 0) {
      console.log(`   🟢 ${recent.length} recent videos may still be processing - wait longer`);
    }
    console.log('');
    
    // 6. Offer cleanup options
    if (veryOld.length > 0 || old.length > 0) {
      console.log('🛠️  Cleanup Options:');
      console.log('1. View individual video details');
      console.log('2. Generate deletion commands for very old videos');
      console.log('3. Generate deletion commands for all stuck videos');
      console.log('4. Exit without changes');
      console.log('');
      
      const choice = await askQuestion('Select option (1-4): ');
      
      switch (choice) {
        case '1':
          await showVideoDetails(pendingVideos);
          break;
          
        case '2':
          generateDeletionCommands(veryOld, 'very old (>24h)');
          break;
          
        case '3':
          generateDeletionCommands([...veryOld, ...old], 'stuck (>2h)');
          break;
          
        case '4':
        default:
          console.log('👋 Exiting without changes');
          break;
      }
    }
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error.message);
  } finally {
    rl.close();
  }
}

async function showVideoDetails(videos) {
  console.log('\n📝 Detailed Video Information:');
  console.log('='.repeat(80));
  
  for (const video of videos) {
    const created = new Date(video.created);
    const ageHours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
    
    console.log(`\n🎬 Video: ${video.uid}`);
    console.log(`   Name: ${video.meta?.name || 'Unnamed'}`);
    console.log(`   Status: ${video.status.state}`);
    console.log(`   Created: ${created.toLocaleString()}`);
    console.log(`   Age: ${ageHours.toFixed(1)} hours`);
    console.log(`   Size: ${video.size ? `${(video.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown'}`);
    console.log(`   Upload expiry: ${video.uploadExpiry || 'None'}`);
    
    if (video.meta && Object.keys(video.meta).length > 1) {
      console.log(`   Metadata: ${JSON.stringify(video.meta, null, 2)}`);
    }
    
    // Check if this video can be verified
    console.log('   Verification status: Checking...');
    try {
      const verifyResponse = await fetch(`${BASE_URL}/api/stream/verify-upload?videoId=${video.uid}`);
      const verifyData = await verifyResponse.json();
      
      if (verifyData.success) {
        console.log(`   ✅ Video accessible: ${verifyData.video.state}`);
      } else {
        console.log(`   ❌ Video verification failed: ${verifyData.error}`);
      }
    } catch (err) {
      console.log(`   ⚠️  Could not verify: ${err.message}`);
    }
  }
}

function generateDeletionCommands(videos, description) {
  if (videos.length === 0) {
    console.log(`\n✅ No ${description} videos to delete.`);
    return;
  }
  
  console.log(`\n🗑️  Deletion Commands for ${videos.length} ${description} videos:`);
  console.log('='.repeat(80));
  console.log('Copy and paste these commands into the Cloudflare Stream dashboard:');
  console.log('');
  
  videos.forEach((video, index) => {
    console.log(`# ${index + 1}. ${video.meta?.name || 'Unnamed'} (${video.uid})`);
    console.log(`DELETE /accounts/{account_id}/stream/${video.uid}`);
    console.log('');
  });
  
  console.log('Or use these video IDs in the Cloudflare dashboard:');
  console.log(videos.map(v => v.uid).join(', '));
  console.log('');
  
  console.log('⚠️  WARNING: This will permanently delete these videos!');
  console.log('Make sure you have backups if needed.');
}

// Run the cleanup
cleanupPendingUploads()
  .then(() => {
    console.log('\\n🎯 Cleanup analysis complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });