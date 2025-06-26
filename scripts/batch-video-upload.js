#!/usr/bin/env node

/**
 * Batch Video Upload Script for Cloudflare Stream
 * 
 * This script uploads video files to Cloudflare Stream, overwrites existing videos with the same name,
 * and automatically syncs them to the content library with metadata.
 * 
 * Usage:
 *   node scripts/batch-video-upload.js [directory] [options]
 *   
 * Options:
 *   --overwrite     Overwrite existing videos with the same name
 *   --channel=ID    Assign videos to specific channel ID
 *   --category=CAT  Set default category for videos
 *   --dry-run       Show what would be uploaded without actually uploading
 *   --help          Show this help message
 * 
 * Examples:
 *   node scripts/batch-video-upload.js ./videos --overwrite --category=Education
 *   node scripts/batch-video-upload.js ./content --channel=campus-news --dry-run
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load environment variables
require('dotenv').config();

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const SUPPORTED_FORMATS = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
const UPLOAD_CHUNK_SIZE = 64 * 1024 * 1024; // 64MB chunks

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Tempest-Batch-Upload-Script/1.0',
        ...options.headers
      },
      timeout: 300000, // 5 minutes timeout for uploads
      ...options
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null
          };
          resolve(result);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      if (typeof options.body === 'string') {
        req.write(options.body);
      } else {
        req.write(JSON.stringify(options.body));
      }
    }
    
    req.end();
  });
}

function uploadFileWithProgress(uploadUrl, filePath, onProgress) {
  return new Promise((resolve, reject) => {
    const fileStats = fs.statSync(filePath);
    const fileSize = fileStats.size;
    let uploadedBytes = 0;
    
    const fileStream = fs.createReadStream(filePath);
    
    const req = https.request(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': fileSize
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, response: data });
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} ${res.statusText}`));
        }
      });
    });
    
    req.on('error', reject);
    
    fileStream.on('data', (chunk) => {
      uploadedBytes += chunk.length;
      if (onProgress) {
        onProgress(uploadedBytes, fileSize);
      }
    });
    
    fileStream.pipe(req);
  });
}

async function getExistingVideos() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/cloudflare/sync`, {
      method: 'GET'
    });
    
    if (response.status === 200 && response.data) {
      return response.data.videos || [];
    }
    return [];
  } catch (error) {
    log(`⚠️  Could not fetch existing videos: ${error.message}`, colors.yellow);
    return [];
  }
}

async function deleteExistingVideo(videoId, videoName) {
  try {
    log(`🗑️  Deleting existing video: ${videoName}`, colors.yellow);
    
    const response = await makeRequest(`${BASE_URL}/api/cloudflare/video/${videoId}`, {
      method: 'DELETE'
    });
    
    if (response.status === 200) {
      log(`✅ Successfully deleted: ${videoName}`, colors.green);
      return true;
    } else {
      log(`❌ Failed to delete: ${videoName}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Error deleting ${videoName}: ${error.message}`, colors.red);
    return false;
  }
}

async function getUploadUrl(fileName, metadata = {}) {
  try {
    const response = await makeRequest(`${BASE_URL}/api/stream/upload-url`, {
      method: 'POST',
      body: {
        name: fileName,
        ...metadata
      }
    });
    
    if (response.status === 200 && response.data) {
      return response.data;
    }
    
    throw new Error(`Failed to get upload URL: ${response.status}`);
  } catch (error) {
    throw new Error(`Error getting upload URL: ${error.message}`);
  }
}

async function updateVideoMetadata(videoId, metadata) {
  try {
    const response = await makeRequest(`${BASE_URL}/api/stream/video/${videoId}`, {
      method: 'PATCH',
      body: metadata
    });
    
    if (response.status === 200) {
      return response.data;
    }
    
    throw new Error(`Failed to update metadata: ${response.status}`);
  } catch (error) {
    throw new Error(`Error updating metadata: ${error.message}`);
  }
}

async function syncToContentLibrary() {
  try {
    log('🔄 Syncing to content library...', colors.blue);
    
    const response = await makeRequest(`${BASE_URL}/api/content-library/sync`, {
      method: 'POST',
      body: { force: true, source: 'batch-upload-script' }
    });
    
    if (response.status === 200) {
      log('✅ Content library sync completed', colors.green);
      return response.data;
    } else {
      log(`⚠️  Content library sync failed: ${response.status}`, colors.yellow);
      return null;
    }
  } catch (error) {
    log(`⚠️  Content library sync error: ${error.message}`, colors.yellow);
    return null;
  }
}

function extractMetadataFromFilename(fileName) {
  // Remove extension
  const baseName = path.parse(fileName).name;
  
  // Try to extract metadata from filename patterns
  const metadata = {
    name: baseName,
    description: `Video: ${baseName}`,
  };
  
  // Pattern: [Category] Title
  const categoryMatch = baseName.match(/^\[([^\]]+)\]\s*(.+)$/);
  if (categoryMatch) {
    metadata.category = categoryMatch[1].trim();
    metadata.name = categoryMatch[2].trim();
    metadata.description = `${metadata.category}: ${metadata.name}`;
  }
  
  // Pattern: Title - Instructor
  const instructorMatch = baseName.match(/^(.+?)\s*-\s*(.+)$/);
  if (instructorMatch && !categoryMatch) {
    metadata.name = instructorMatch[1].trim();
    metadata.instructor = instructorMatch[2].trim();
    metadata.description = `${metadata.name} by ${metadata.instructor}`;
  }
  
  return metadata;
}

function findVideoFiles(directory) {
  const files = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (SUPPORTED_FORMATS.includes(ext)) {
          files.push({
            path: fullPath,
            name: item,
            size: stat.size,
            relativePath: path.relative(directory, fullPath)
          });
        }
      }
    }
  }
  
  scanDirectory(directory);
  return files;
}

async function uploadVideo(videoFile, options = {}) {
  const { overwrite = false, channel = null, category = null, dryRun = false } = options;
  
  log(`\n📹 Processing: ${videoFile.name}`, colors.cyan);
  log(`   Path: ${videoFile.relativePath}`, colors.gray);
  log(`   Size: ${formatBytes(videoFile.size)}`, colors.gray);
  
  if (videoFile.size > MAX_FILE_SIZE) {
    log(`❌ File too large (max ${formatBytes(MAX_FILE_SIZE)})`, colors.red);
    return { success: false, error: 'File too large' };
  }
  
  if (dryRun) {
    log(`🔍 [DRY RUN] Would upload: ${videoFile.name}`, colors.yellow);
    return { success: true, dryRun: true };
  }
  
  try {
    // Extract metadata from filename
    const fileMetadata = extractMetadataFromFilename(videoFile.name);
    
    // Merge with options
    const metadata = {
      ...fileMetadata,
      ...(category && { category }),
      ...(channel && { channel_id: channel })
    };
    
    // Check for existing video with same name
    if (overwrite) {
      const existingVideos = await getExistingVideos();
      const existingVideo = existingVideos.find(v => 
        v.meta?.name === metadata.name || v.meta?.name === videoFile.name
      );
      
      if (existingVideo) {
        const deleted = await deleteExistingVideo(existingVideo.uid, existingVideo.meta?.name);
        if (!deleted) {
          log(`⚠️  Could not delete existing video, continuing anyway...`, colors.yellow);
        }
      }
    }
    
    // Get upload URL
    log(`🔗 Getting upload URL...`, colors.blue);
    const uploadInfo = await getUploadUrl(metadata.name, {
      requireSignedURLs: false,
      allowedOrigins: ['*']
    });
    
    log(`📤 Uploading video...`, colors.blue);
    const startTime = Date.now();
    
    // Upload with progress
    let lastProgress = 0;
    await uploadFileWithProgress(uploadInfo.uploadURL, videoFile.path, (uploaded, total) => {
      const progress = Math.floor((uploaded / total) * 100);
      if (progress >= lastProgress + 5) { // Update every 5%
        const elapsed = Date.now() - startTime;
        const speed = uploaded / (elapsed / 1000);
        const eta = (total - uploaded) / speed;
        
        process.stdout.write(`\r   Progress: ${progress}% (${formatBytes(uploaded)}/${formatBytes(total)}) - ${formatBytes(speed)}/s - ETA: ${formatDuration(eta * 1000)}`);
        lastProgress = progress;
      }
    });
    
    console.log(); // New line after progress
    
    // Wait a moment for Stream to process
    log(`⏳ Waiting for Stream processing...`, colors.blue);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update metadata
    if (Object.keys(metadata).length > 1) { // More than just name
      log(`📝 Updating metadata...`, colors.blue);
      await updateVideoMetadata(uploadInfo.uid, metadata);
    }
    
    const duration = Date.now() - startTime;
    log(`✅ Upload completed in ${formatDuration(duration)}`, colors.green);
    log(`   Video ID: ${uploadInfo.uid}`, colors.gray);
    
    return {
      success: true,
      videoId: uploadInfo.uid,
      metadata,
      duration
    };
    
  } catch (error) {
    log(`❌ Upload failed: ${error.message}`, colors.red);
    return { success: false, error: error.message };
  }
}

function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    directory: null,
    overwrite: false,
    channel: null,
    category: null,
    dryRun: false,
    help: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--overwrite') {
      options.overwrite = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--channel=')) {
      options.channel = arg.split('=')[1];
    } else if (arg.startsWith('--category=')) {
      options.category = arg.split('=')[1];
    } else if (!arg.startsWith('--') && !options.directory) {
      options.directory = arg;
    }
  }
  
  return options;
}

function showHelp() {
  log('🎬 Tempest Batch Video Upload Script', colors.blue);
  log('===================================\n', colors.blue);
  log('Usage:', colors.yellow);
  log('  node scripts/batch-video-upload.js [directory] [options]\n', colors.gray);
  log('Options:', colors.yellow);
  log('  --overwrite     Overwrite existing videos with the same name', colors.gray);
  log('  --channel=ID    Assign videos to specific channel ID', colors.gray);
  log('  --category=CAT  Set default category for videos', colors.gray);
  log('  --dry-run       Show what would be uploaded without actually uploading', colors.gray);
  log('  --help          Show this help message\n', colors.gray);
  log('Examples:', colors.yellow);
  log('  node scripts/batch-video-upload.js ./videos --overwrite --category=Education', colors.gray);
  log('  node scripts/batch-video-upload.js ./content --channel=campus-news --dry-run', colors.gray);
  log('  node scripts/batch-video-upload.js ~/Downloads/lectures --overwrite\n', colors.gray);
  log('Supported formats:', colors.yellow);
  log(`  ${SUPPORTED_FORMATS.join(', ')}\n`, colors.gray);
  log('Filename patterns for auto-metadata:', colors.yellow);
  log('  [Category] Title.mp4           → category: Category, title: Title', colors.gray);
  log('  Title - Instructor.mp4         → title: Title, instructor: Instructor', colors.gray);
  log('  Any Other Title.mp4            → title: Any Other Title', colors.gray);
}

async function main() {
  const options = parseArguments();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  if (!options.directory) {
    log('❌ No directory specified. Use --help for usage information.', colors.red);
    process.exit(1);
  }
  
  if (!fs.existsSync(options.directory)) {
    log(`❌ Directory not found: ${options.directory}`, colors.red);
    process.exit(1);
  }
  
  log('🎬 Tempest Batch Video Upload', colors.blue);
  log('=============================\n', colors.blue);
  
  // Find video files
  log(`📁 Scanning directory: ${options.directory}`, colors.blue);
  const videoFiles = findVideoFiles(options.directory);
  
  if (videoFiles.length === 0) {
    log('❌ No video files found in the specified directory.', colors.red);
    log(`   Supported formats: ${SUPPORTED_FORMATS.join(', ')}`, colors.gray);
    process.exit(1);
  }
  
  log(`📊 Found ${videoFiles.length} video files`, colors.green);
  const totalSize = videoFiles.reduce((sum, file) => sum + file.size, 0);
  log(`   Total size: ${formatBytes(totalSize)}`, colors.gray);
  
  if (options.dryRun) {
    log('\n🔍 DRY RUN MODE - No files will be uploaded', colors.yellow);
  }
  
  if (options.overwrite) {
    log('\n⚠️  OVERWRITE MODE - Existing videos with same names will be deleted', colors.yellow);
  }
  
  if (options.category) {
    log(`📂 Default category: ${options.category}`, colors.gray);
  }
  
  if (options.channel) {
    log(`📺 Target channel: ${options.channel}`, colors.gray);
  }
  
  // Process each video
  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < videoFiles.length; i++) {
    const videoFile = videoFiles[i];
    log(`\n[${i + 1}/${videoFiles.length}]`, colors.magenta);
    
    const result = await uploadVideo(videoFile, options);
    results.push({ file: videoFile, ...result });
    
    // Brief pause between uploads
    if (i < videoFiles.length - 1 && !options.dryRun) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Summary
  const totalDuration = Date.now() - startTime;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log('\n📊 Upload Summary', colors.blue);
  log('================', colors.blue);
  log(`   Total files: ${videoFiles.length}`, colors.gray);
  log(`   Successful: ${successful}`, successful > 0 ? colors.green : colors.gray);
  log(`   Failed: ${failed}`, failed > 0 ? colors.red : colors.gray);
  log(`   Duration: ${formatDuration(totalDuration)}`, colors.gray);
  
  if (failed > 0) {
    log('\n❌ Failed uploads:', colors.red);
    results.filter(r => !r.success).forEach(result => {
      log(`   • ${result.file.name}: ${result.error}`, colors.red);
    });
  }
  
  // Sync to content library if we uploaded anything
  if (successful > 0 && !options.dryRun) {
    log('\n🔄 Syncing to content library...', colors.blue);
    const syncResult = await syncToContentLibrary();
    
    if (syncResult) {
      log(`✅ Sync completed: ${syncResult.total_synced} videos synced`, colors.green);
    }
  }
  
  log(`\n🎉 Batch upload ${options.dryRun ? 'simulation' : 'completed'}!`, colors.green);
  process.exit(failed > 0 ? 1 : 0);
}

// Handle script interruption
process.on('SIGINT', () => {
  log('\n\n🛑 Upload interrupted by user.', colors.yellow);
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\n\n🛑 Upload terminated.', colors.yellow);
  process.exit(143);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log(`\n💥 Uncaught error: ${error.message}`, colors.red);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`\n💥 Unhandled rejection: ${reason}`, colors.red);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { uploadVideo, findVideoFiles, extractMetadataFromFilename };