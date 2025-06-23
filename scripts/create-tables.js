#!/usr/bin/env node

/**
 * Create Tables Script
 * 
 * Creates the necessary tables in Supabase one by one.
 * This is a simpler approach that creates tables through the Supabase SDK.
 */

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
        'User-Agent': 'Tempest-Table-Creator/1.0',
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

async function testTable(tableName) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const url = `${supabaseUrl}/rest/v1/${tableName}?select=count&limit=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function createContentTable() {
  // For now, we'll just check if the table exists
  const exists = await testTable('content');
  
  if (exists) {
    log('   ✅ Content table already exists', colors.green);
    return true;
  } else {
    log('   ❌ Content table does not exist', colors.red);
    log('      Please create it using the SQL in scripts/schema.sql', colors.yellow);
    return false;
  }
}

async function main() {
  log('🗄️  Tempest Table Creation Helper', colors.blue);
  log('==================================\n', colors.blue);
  
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
    process.exit(1);
  }
  
  log('✅ Environment variables loaded', colors.green);
  
  // Test tables
  log('\n📊 Checking existing tables...', colors.blue);
  
  const tables = ['content', 'channels', 'user_profiles', 'programs', 'interactions'];
  const results = {};
  
  for (const table of tables) {
    const exists = await testTable(table);
    results[table] = exists;
    log(`   ${exists ? '✅' : '❌'} ${table}`, exists ? colors.green : colors.red);
  }
  
  const allExist = Object.values(results).every(v => v);
  
  if (allExist) {
    log('\n✅ All tables exist! You can run sync now:', colors.green);
    log('   npm run sync:simple', colors.gray);
  } else {
    log('\n⚠️  Some tables are missing.', colors.yellow);
    log('\n📋 To create the missing tables:', colors.blue);
    log('   1. Go to your Supabase dashboard', colors.gray);
    log('   2. Navigate to the SQL Editor', colors.gray);
    log('   3. Copy and paste the SQL from:', colors.gray);
    log('      scripts/schema.sql', colors.blue);
    log('   4. Run the SQL', colors.gray);
    log('\n   Or run specific sections for missing tables only.', colors.gray);
    
    log('\n💡 The schema file contains:', colors.blue);
    log('   - All table definitions', colors.gray);
    log('   - Proper indexes for performance', colors.gray);
    log('   - Triggers for updated_at timestamps', colors.gray);
    log('   - Default channels and admin users', colors.gray);
  }
  
  process.exit(allExist ? 0 : 1);
}

if (require.main === module) {
  main();
}