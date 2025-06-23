#!/usr/bin/env node

/**
 * Simple Bulk Sync Script
 * 
 * This script implements a simplified version of the bulk sync functionality
 * without requiring TypeScript compilation.
 * 
 * Usage:
 *   node scripts/simple-sync.js
 *   npm run sync:simple
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

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
        'User-Agent': 'Tempest-Simple-Sync/1.0',
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

async function getSupabaseVideos() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  const url = `${supabaseUrl}/rest/v1/content?select=cloudflare_video_id`;
  
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
      throw new Error(`Supabase API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    throw new Error(`Failed to fetch Supabase videos: ${error.message}`);
  }
}

async function createSupabaseVideo(videoData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const url = `${supabaseUrl}/rest/v1/content`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(videoData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase insert error: ${response.status} - ${error}`);
    }
    
    return true;
  } catch (error) {
    throw new Error(`Failed to create video in Supabase: ${error.message}`);
  }
}

function extractVideoTitle(streamVideo) {
  if (streamVideo.meta && streamVideo.meta.name) {
    return streamVideo.meta.name;
  }
  if (streamVideo.filename) {
    return streamVideo.filename.replace(/\.[^/.]+$/, ''); // Remove extension
  }
  return `Video ${streamVideo.uid.substring(0, 8)}`;
}

async function runSimpleSync() {
  try {
    log('🎬 Tempest Simple Content Library Sync', colors.blue);
    log('======================================\n', colors.blue);
    
    // Check environment variables
    const requiredEnvVars = [
      'CLOUDFLARE_ACCOUNT_ID',
      'CLOUDFLARE_API_TOKEN',
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
    
    log('✅ Environment variables loaded', colors.green);
    
    // Fetch videos from both services
    log('📥 Fetching videos from Cloudflare Stream...', colors.blue);
    const cloudflareVideos = await getCloudflareVideos();
    log(`   Found ${cloudflareVideos.length} videos in Cloudflare Stream`, colors.gray);
    
    log('📥 Fetching videos from Supabase...', colors.blue);
    let supabaseVideos = [];
    let existingVideoIds = new Set();
    
    try {
      supabaseVideos = await getSupabaseVideos();
      existingVideoIds = new Set(supabaseVideos.map(v => v.cloudflare_video_id));
      log(`   Found ${supabaseVideos.length} videos in Supabase`, colors.gray);
    } catch (error) {
      if (error.message.includes('does not exist')) {
        log(`   ⚠️  Content table doesn't exist - will create all videos`, colors.yellow);
        log(`   💡 Consider running: npm run db:setup`, colors.gray);
      } else {
        throw error;
      }
    }
    
    // Find orphaned videos
    const orphanedVideos = cloudflareVideos.filter(video => 
      !existingVideoIds.has(video.uid)
    );
    
    log(`\n📊 Sync Analysis:`, colors.blue);
    log(`   Total Cloudflare Videos: ${cloudflareVideos.length}`, colors.gray);
    log(`   Already in Library: ${cloudflareVideos.length - orphanedVideos.length}`, colors.gray);
    log(`   Missing from Library: ${orphanedVideos.length}`, colors.gray);
    
    if (orphanedVideos.length === 0) {
      log('\n✅ All videos are already synced!', colors.green);
      return true;
    }
    
    // Sync orphaned videos
    log(`\n🚀 Syncing ${orphanedVideos.length} missing videos...`, colors.blue);
    
    let created = 0;
    let errors = 0;
    const results = [];
    
    for (const video of orphanedVideos) {
      const title = extractVideoTitle(video);
      
      try {
        log(`   ⏳ Syncing: ${title}`, colors.gray);
        
        const videoData = {
          title: title,
          description: video.meta?.description || null,
          cloudflare_video_id: video.uid,
          duration: video.duration ? Math.floor(parseFloat(video.duration)) : null,
          thumbnail_url: video.thumbnail || null,
          thumbnail_source: 'stream',
          category: video.meta?.category || null,
          language: video.meta?.language || 'English',
          difficulty_level: video.meta?.difficulty_level || 'Beginner',
          keywords: video.meta?.keywords ? video.meta.keywords.split(',').map(k => k.trim()) : [],
          tags: [],
          is_published: false,
          is_featured: false,
          sync_status: 'synced',
          last_synced_at: new Date().toISOString(),
          stream_metadata: video,
          metadata: {
            syncedByScript: true,
            syncedAt: new Date().toISOString()
          }
        };
        
        await createSupabaseVideo(videoData);
        
        log(`   ✅ Created: ${title}`, colors.green);
        created++;
        results.push({ title, action: 'created' });
        
      } catch (error) {
        log(`   ❌ Error: ${title} - ${error.message}`, colors.red);
        errors++;
        results.push({ title, action: 'error', error: error.message });
      }
    }
    
    // Summary
    log(`\n✅ Sync completed!`, colors.green);
    log(`   📊 Summary:`, colors.blue);
    log(`      Created: ${created}`, colors.green);
    log(`      Errors: ${errors}`, errors > 0 ? colors.red : colors.gray);
    
    if (results.length > 0) {
      log(`\n   📋 Details:`, colors.blue);
      results.forEach((item) => {
        const statusIcon = item.action === 'created' ? '✅' : '❌';
        const statusColor = item.action === 'created' ? colors.green : colors.red;
        
        log(`      ${statusIcon} ${item.title}`, statusColor);
        if (item.error) {
          log(`         Error: ${item.error}`, colors.red);
        }
      });
    }
    
    log('\n🎉 Simple sync operation completed!', colors.green);
    return true;
    
  } catch (error) {
    log(`❌ Error during simple sync: ${error.message}`, colors.red);
    
    if (error.message.includes('Cloudflare')) {
      log(`   💡 Check your Cloudflare Account ID and API Token.`, colors.yellow);
    } else if (error.message.includes('Supabase')) {
      log(`   💡 Check your Supabase URL and Service Role Key.`, colors.yellow);
    }
    
    return false;
  }
}

async function main() {
  const success = await runSimpleSync();
  process.exit(success ? 0 : 1);
}

// Handle script interruption
process.on('SIGINT', () => {
  log('\n\n🛑 Simple sync interrupted by user.', colors.yellow);
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\n\n🛑 Simple sync terminated.', colors.yellow);
  process.exit(143);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { runSimpleSync };