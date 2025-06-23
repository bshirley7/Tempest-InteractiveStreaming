#!/usr/bin/env node

/**
 * Bulk Sync Script
 * 
 * This script automatically syncs all Cloudflare Stream videos with the Supabase content library.
 * It can be run standalone or as part of automated workflows.
 * 
 * Usage:
 *   node scripts/bulk-sync.js
 *   npm run sync
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const API_ENDPOINT = `${BASE_URL}/api/content-library/sync`;

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

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Tempest-Bulk-Sync-Script/1.0',
        ...options.headers
      },
      timeout: 120000, // 2 minutes timeout
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
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function checkSyncStatus() {
  try {
    log('📊 Checking current sync status...', colors.blue);
    
    const response = await makeRequest(`${BASE_URL}/api/content-library/sync`, {
      method: 'GET'
    });
    
    if (response.status === 200 && response.data) {
      const status = response.data.sync_status;
      log(`   Cloudflare Videos: ${status.cloudflare_videos}`, colors.gray);
      log(`   Library Videos: ${status.supabase_videos}`, colors.gray);
      log(`   Missing Videos: ${status.missing_videos}`, colors.gray);
      log(`   Status: ${status.is_synced ? 'Synced' : 'Out of Sync'}`, 
          status.is_synced ? colors.green : colors.yellow);
      return status;
    } else {
      log(`❌ Failed to check status: ${response.status}`, colors.red);
      if (response.data && response.data.error) {
        log(`   Error: ${response.data.error}`, colors.red);
      }
      return null;
    }
  } catch (error) {
    log(`❌ Error checking status: ${error.message}`, colors.red);
    return null;
  }
}

async function runBulkSync() {
  try {
    log('🚀 Starting bulk sync operation...', colors.blue);
    
    const response = await makeRequest(API_ENDPOINT, {
      body: { 
        force: false,
        source: 'bulk-sync-script'
      }
    });
    
    if (response.status === 200 && response.data) {
      const result = response.data;
      
      log('✅ Bulk sync completed successfully!', colors.green);
      log(`   📊 Summary:`, colors.blue);
      log(`      Total Cloudflare Videos: ${result.total_cloudflare_videos}`, colors.gray);
      log(`      Videos Synced: ${result.total_synced}`, colors.gray);
      log(`      Created: ${result.created}`, colors.green);
      log(`      Updated: ${result.updated}`, colors.blue);
      log(`      Skipped: ${result.skipped}`, colors.yellow);
      log(`      Errors: ${result.errors}`, result.errors > 0 ? colors.red : colors.gray);
      
      if (result.results && result.results.length > 0) {
        log(`\n   📋 Details:`, colors.blue);
        result.results.forEach((item, index) => {
          const statusIcon = {
            created: '✅',
            updated: '🔄',
            skipped: '⏭️',
            error: '❌'
          }[item.action] || '❓';
          
          const statusColor = {
            created: colors.green,
            updated: colors.blue,
            skipped: colors.yellow,
            error: colors.red
          }[item.action] || colors.gray;
          
          log(`      ${statusIcon} ${item.title}`, statusColor);
          if (item.error) {
            log(`         Error: ${item.error}`, colors.red);
          }
        });
      }
      
      return true;
    } else {
      log(`❌ Bulk sync failed: HTTP ${response.status}`, colors.red);
      if (response.data && response.data.error) {
        log(`   Error: ${response.data.error}`, colors.red);
      } else if (response.parseError) {
        log(`   Parse Error: ${response.parseError}`, colors.red);
        log(`   Raw Response: ${response.data}`, colors.gray);
      }
      return false;
    }
  } catch (error) {
    log(`❌ Error during bulk sync: ${error.message}`, colors.red);
    
    if (error.code === 'ECONNREFUSED') {
      log(`   💡 Make sure the development server is running:`, colors.yellow);
      log(`      npm run dev`, colors.gray);
    } else if (error.message.includes('timeout')) {
      log(`   💡 The sync operation timed out. This may happen with large video libraries.`, colors.yellow);
      log(`      Try running the script again or check the server logs.`, colors.gray);
    }
    
    return false;
  }
}

async function main() {
  log('🎬 Tempest Content Library Bulk Sync', colors.blue);
  log('=====================================\n', colors.blue);
  
  // Check if server is running
  try {
    await makeRequest(`${BASE_URL}/api/health`, { method: 'GET' });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('❌ Cannot connect to the development server.', colors.red);
      log('   Please start the server first:', colors.yellow);
      log('   npm run dev\n', colors.gray);
      process.exit(1);
    }
  }
  
  // Check current status
  const initialStatus = await checkSyncStatus();
  
  if (initialStatus && initialStatus.is_synced && initialStatus.missing_videos === 0) {
    log('\n✅ Content library is already in sync!', colors.green);
    log('   No sync operation needed.', colors.gray);
    process.exit(0);
  }
  
  log(''); // Empty line for spacing
  
  // Run bulk sync
  const success = await runBulkSync();
  
  if (success) {
    log('\n🎉 Bulk sync operation completed successfully!', colors.green);
    
    // Check final status
    log(''); // Empty line for spacing
    await checkSyncStatus();
    
    process.exit(0);
  } else {
    log('\n💥 Bulk sync operation failed.', colors.red);
    log('   Check the error messages above for more details.', colors.gray);
    process.exit(1);
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  log('\n\n🛑 Bulk sync interrupted by user.', colors.yellow);
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\n\n🛑 Bulk sync terminated.', colors.yellow);
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

module.exports = { runBulkSync, checkSyncStatus };