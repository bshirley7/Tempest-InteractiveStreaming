#!/usr/bin/env node

/**
 * Direct Bulk Sync Script
 * 
 * This script directly calls the sync functions without going through the API,
 * bypassing authentication requirements.
 * 
 * Usage:
 *   node scripts/direct-sync.js
 *   npm run sync:direct
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

async function runDirectSync() {
  try {
    log('🎬 Tempest Direct Content Library Sync', colors.blue);
    log('=======================================\n', colors.blue);
    
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
      process.exit(1);
    }
    
    log('✅ Environment variables loaded', colors.green);
    log('🚀 Starting direct sync operation...', colors.blue);
    
    // Dynamically import the sync function
    const { syncContentLibrary } = await import('../lib/content-library-sync.ts');
    
    const result = await syncContentLibrary();
    
    log('✅ Direct sync completed successfully!', colors.green);
    log(`   📊 Summary:`, colors.blue);
    log(`      Total Cloudflare Videos: ${result.total_cloudflare_videos}`, colors.gray);
    log(`      Videos Synced: ${result.total_synced}`, colors.gray);
    log(`      Created: ${result.created}`, colors.green);
    log(`      Updated: ${result.updated}`, colors.blue);
    log(`      Skipped: ${result.skipped}`, colors.yellow);
    log(`      Errors: ${result.errors}`, result.errors > 0 ? colors.red : colors.gray);
    
    if (result.results && result.results.length > 0) {
      log(`\n   📋 Details:`, colors.blue);
      result.results.forEach((item) => {
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
    
    log('\n🎉 Direct sync operation completed successfully!', colors.green);
    return true;
    
  } catch (error) {
    log(`❌ Error during direct sync: ${error.message}`, colors.red);
    
    if (error.message.includes('Cannot resolve module')) {
      log(`   💡 Make sure you're running this from the project root directory.`, colors.yellow);
    } else if (error.message.includes('fetch')) {
      log(`   💡 Check your Cloudflare and Supabase credentials.`, colors.yellow);
    }
    
    console.error('Full error:', error);
    return false;
  }
}

async function main() {
  const success = await runDirectSync();
  process.exit(success ? 0 : 1);
}

// Handle script interruption
process.on('SIGINT', () => {
  log('\n\n🛑 Direct sync interrupted by user.', colors.yellow);
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\n\n🛑 Direct sync terminated.', colors.yellow);
  process.exit(143);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { runDirectSync };