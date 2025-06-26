#!/usr/bin/env node

/**
 * Cloudflare Video ID Verification Script
 * 
 * This script queries the database to show all Cloudflare video IDs
 * and verifies them against the Cloudflare Stream API.
 * 
 * Usage:
 *   node scripts/verify-video-ids.js
 *   npm run verify:videos
 */

require('dotenv').config({ path: '.env.local' });

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

// Simple fetch wrapper for Node.js
function fetch(url, options = {}) {
  const https = require('https');
  const http = require('http');
  
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Tempest-Video-Verify/1.0',
        ...options.headers
      },
      timeout: 30000,
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            json: () => Promise.resolve(data ? JSON.parse(data) : null),
            text: () => Promise.resolve(data)
          };
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function querySupabase(query, params = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  const url = `${supabaseUrl}/rest/v1/${query}${queryString ? '?' + queryString : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase query error: ${response.status} - ${error}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to query Supabase: ${error.message}`);
  }
}

async function getCloudflareVideos() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!accountId || !apiToken) {
    throw new Error('Missing Cloudflare credentials');
  }
  
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    throw new Error(`Failed to fetch Cloudflare videos: ${error.message}`);
  }
}

async function getDatabaseVideos() {
  try {
    const videos = await querySupabase('content', {
      select: 'id,title,cloudflare_video_id,duration,sync_status,is_published,created_at,channel_id,channels(name,slug)'
    });
    return videos || [];
  } catch (error) {
    throw new Error(`Failed to fetch database videos: ${error.message}`);
  }
}

function formatDuration(seconds) {
  if (!seconds) return 'N/A';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function verifyVideoIDs() {
  log('🎬 Cloudflare Video ID Verification', colors.blue);
  log('===================================\n', colors.blue);
  
  try {
    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      log('❌ Missing required environment variables:', colors.red);
      missingVars.forEach(varName => {
        log(`   - ${varName}`, colors.red);
      });
      log('\n   Please check your .env.local file.', colors.yellow);
      return false;
    }
    
    // Fetch database videos
    log('📥 Fetching videos from database...', colors.cyan);
    const dbVideos = await getDatabaseVideos();
    log(`   Found ${dbVideos.length} videos in database`, colors.gray);
    
    if (dbVideos.length === 0) {
      log('❌ No videos found in database', colors.red);
      log('   💡 Consider running the sync script first: npm run sync:simple', colors.yellow);
      return false;
    }
    
    // Display database video IDs
    log('\n🎯 Cloudflare Video IDs in Database:', colors.blue);
    log('=====================================', colors.blue);
    
    dbVideos.forEach((video, index) => {
      const channelName = video.channels?.name || 'No Channel';
      const publishedIcon = video.is_published ? '🟢' : '🔴';
      const syncIcon = video.sync_status === 'synced' ? '✅' : '⚠️';
      
      log(`\n${index + 1}. ${video.title}`, colors.cyan);
      log(`   📺 Video ID: ${video.cloudflare_video_id}`, colors.magenta);
      log(`   📋 Database ID: ${video.id}`, colors.gray);
      log(`   📺 Channel: ${channelName}`, colors.gray);
      log(`   ⏱️  Duration: ${formatDuration(video.duration)}`, colors.gray);
      log(`   ${publishedIcon} Published: ${video.is_published}`, colors.gray);
      log(`   ${syncIcon} Sync Status: ${video.sync_status}`, colors.gray);
      log(`   📅 Created: ${formatDate(video.created_at)}`, colors.gray);
    });
    
    // Try to verify against Cloudflare Stream (if credentials are available)
    const hasCloudflareCredentials = process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN;
    
    if (hasCloudflareCredentials) {
      log('\n🔍 Verifying against Cloudflare Stream...', colors.cyan);
      
      try {
        const cloudflareVideos = await getCloudflareVideos();
        const cloudflareVideoIds = new Set(cloudflareVideos.map(v => v.uid));
        
        log(`   Found ${cloudflareVideos.length} videos in Cloudflare Stream`, colors.gray);
        
        // Check which database videos exist in Cloudflare
        const verificationResults = dbVideos.map(video => ({
          ...video,
          existsInCloudflare: cloudflareVideoIds.has(video.cloudflare_video_id)
        }));
        
        const existingCount = verificationResults.filter(v => v.existsInCloudflare).length;
        const missingCount = verificationResults.filter(v => !v.existsInCloudflare).length;
        
        log('\n📊 Verification Results:', colors.blue);
        log('=======================', colors.blue);
        log(`   ✅ Videos found in Cloudflare: ${existingCount}`, colors.green);
        log(`   ❌ Videos missing from Cloudflare: ${missingCount}`, missingCount > 0 ? colors.red : colors.gray);
        
        if (missingCount > 0) {
          log('\n⚠️  Videos missing from Cloudflare Stream:', colors.yellow);
          verificationResults
            .filter(v => !v.existsInCloudflare)
            .forEach((video, index) => {
              log(`   ${index + 1}. ${video.title}`, colors.red);
              log(`      Video ID: ${video.cloudflare_video_id}`, colors.gray);
            });
        }
        
        // Check for orphaned videos in Cloudflare
        const dbVideoIds = new Set(dbVideos.map(v => v.cloudflare_video_id));
        const orphanedVideos = cloudflareVideos.filter(v => !dbVideoIds.has(v.uid));
        
        if (orphanedVideos.length > 0) {
          log(`\n🔍 Orphaned videos in Cloudflare Stream (not in database): ${orphanedVideos.length}`, colors.yellow);
          orphanedVideos.slice(0, 5).forEach((video, index) => {
            const title = video.meta?.name || video.filename || `Video ${video.uid.substring(0, 8)}`;
            log(`   ${index + 1}. ${title}`, colors.yellow);
            log(`      Video ID: ${video.uid}`, colors.gray);
          });
          
          if (orphanedVideos.length > 5) {
            log(`   ... and ${orphanedVideos.length - 5} more`, colors.gray);
          }
          
          log(`   💡 Consider running sync to add these videos: npm run sync:simple`, colors.cyan);
        }
        
      } catch (error) {
        log(`   ⚠️  Could not verify against Cloudflare: ${error.message}`, colors.yellow);
        log(`   💡 Video IDs are still displayed above from database`, colors.cyan);
      }
    } else {
      log('\n⚠️  Cloudflare credentials not found - skipping verification', colors.yellow);
      log('   💡 Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to verify against Stream', colors.cyan);
    }
    
    // Summary
    log('\n📈 Summary:', colors.blue);
    log('===========', colors.blue);
    log(`   Total videos in database: ${dbVideos.length}`, colors.gray);
    log(`   Published videos: ${dbVideos.filter(v => v.is_published).length}`, colors.green);
    log(`   Unpublished videos: ${dbVideos.filter(v => !v.is_published).length}`, colors.yellow);
    log(`   Synced videos: ${dbVideos.filter(v => v.sync_status === 'synced').length}`, colors.green);
    
    // Export video IDs for easy access
    log('\n📋 Video IDs (for easy copying):', colors.blue);
    log('=================================', colors.blue);
    dbVideos.forEach((video, index) => {
      log(`${index + 1}. ${video.cloudflare_video_id}`, colors.magenta);
    });
    
    log('\n✅ Video ID verification completed!', colors.green);
    return true;
    
  } catch (error) {
    log(`❌ Error during verification: ${error.message}`, colors.red);
    
    if (error.message.includes('Supabase')) {
      log(`   💡 Check your Supabase URL and Service Role Key.`, colors.yellow);
    } else if (error.message.includes('table') && error.message.includes('does not exist')) {
      log(`   💡 Content table doesn't exist. Run: npm run db:setup`, colors.yellow);
    }
    
    return false;
  }
}

async function main() {
  const success = await verifyVideoIDs();
  process.exit(success ? 0 : 1);
}

// Handle script interruption
process.on('SIGINT', () => {
  log('\n\n🛑 Video ID verification interrupted by user.', colors.yellow);
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\n\n🛑 Video ID verification terminated.', colors.yellow);
  process.exit(143);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { verifyVideoIDs };