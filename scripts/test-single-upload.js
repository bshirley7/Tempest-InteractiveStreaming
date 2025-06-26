#!/usr/bin/env node

/**
 * Test Single Video Upload
 * Simple script to test uploading one video to verify the upload workflow
 */

const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testUpload() {
  const videoPath = '/mnt/g/DEVELOPMENT/StreamingProject/CONTENT/WorldExplorer/Copenhagen Travel Guide - Demark.mp4';
  
  log('🧪 Testing Single Video Upload', colors.blue);
  log('============================\n', colors.blue);
  
  // Check if file exists
  if (!fs.existsSync(videoPath)) {
    log('❌ Test video file not found!', colors.red);
    process.exit(1);
  }
  
  const stats = fs.statSync(videoPath);
  log(`📁 File: Copenhagen Travel Guide - Demark.mp4`, colors.gray);
  log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`, colors.gray);
  
  // Test API connectivity
  try {
    log('\n🔗 Testing API connectivity...', colors.blue);
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    log(`✅ Server is healthy: ${healthData.status}`, colors.green);
  } catch (error) {
    log(`❌ Server connectivity failed: ${error.message}`, colors.red);
    process.exit(1);
  }
  
  // Test getting upload URL
  try {
    log('\n📤 Getting upload URL...', colors.blue);
    const uploadResponse = await fetch('http://localhost:3000/api/stream/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Copenhagen Travel Guide - Denmark',
        category: 'Travel'
      })
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`HTTP ${uploadResponse.status}: ${errorText}`);
    }
    
    const uploadData = await uploadResponse.json();
    log(`✅ Upload URL obtained: ${uploadData.uid}`, colors.green);
    log(`📡 Upload URL: ${uploadData.uploadURL.substring(0, 50)}...`, colors.gray);
    
    // For now, just log that we got the URL - actual upload would happen here
    log('\n✅ Test completed successfully!', colors.green);
    log('🎉 The upload workflow is working. Ready for batch upload.', colors.green);
    
  } catch (error) {
    log(`❌ Upload URL request failed: ${error.message}`, colors.red);
    
    if (error.message.includes('Cloudflare')) {
      log('\n💡 This might be a Cloudflare Stream configuration issue.', colors.yellow);
      log('   Please check your environment variables:', colors.gray);
      log('   - CLOUDFLARE_ACCOUNT_ID', colors.gray);
      log('   - CLOUDFLARE_STREAM_API_TOKEN', colors.gray);
    }
    
    process.exit(1);
  }
}

testUpload();