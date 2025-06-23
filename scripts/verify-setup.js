#!/usr/bin/env node

/**
 * Database Setup Verification Script
 * 
 * Verifies that the database tables are created correctly
 * and displays the current state of channels and content.
 */

require('dotenv').config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m'
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
        'User-Agent': 'Tempest-Verify/1.0',
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

async function querySupabase(table, select = '*', params = '') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const url = `${supabaseUrl}/rest/v1/${table}?select=${select}${params}`;
  
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

async function verifySetup() {
  log('🔍 Tempest Database Setup Verification', colors.blue);
  log('=====================================\n', colors.blue);
  
  try {
    // Test connection
    log('🔗 Testing database connection...', colors.cyan);
    
    // Check channels
    log('📺 Verifying channels...', colors.cyan);
    const channels = await querySupabase('channels', 'name,slug,category,is_active', '&order=sort_order');
    
    if (channels.length > 0) {
      log(`✅ Found ${channels.length} channels:`, colors.green);
      channels.forEach((channel, index) => {
        const status = channel.is_active ? '🟢' : '🔴';
        log(`   ${index + 1}. ${status} ${channel.name} (${channel.slug}) - ${channel.category}`, colors.gray);
      });
    } else {
      log('❌ No channels found', colors.red);
    }
    
    // Check content
    log('\n🎬 Verifying content...', colors.cyan);
    const content = await querySupabase('content', 'count', '');
    const contentCount = content[0]?.count || 0;
    
    if (contentCount > 0) {
      log(`✅ Found ${contentCount} videos in content library`, colors.green);
      
      // Get some sample videos
      const sampleVideos = await querySupabase('content', 'title,duration,sync_status', '&limit=5');
      log('   📋 Sample videos:', colors.gray);
      sampleVideos.forEach((video, index) => {
        const duration = video.duration ? `${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, '0')}` : 'N/A';
        log(`      ${index + 1}. ${video.title.substring(0, 60)}... (${duration}) - ${video.sync_status}`, colors.gray);
      });
    } else {
      log('❌ No content found', colors.red);
    }
    
    // Check user profiles
    log('\n👥 Verifying user profiles...', colors.cyan);
    const users = await querySupabase('user_profiles', 'count', '');
    const userCount = users.length > 0 ? users[0].count || users.length : 0;
    
    if (userCount > 0) {
      log(`✅ Found ${userCount} user profiles`, colors.green);
      
      // Check for admin users
      const admins = await querySupabase('user_profiles', 'clerk_user_id,role', "&role=eq.admin");
      if (admins.length > 0) {
        log(`   🔐 Admin users: ${admins.length}`, colors.green);
        admins.forEach((admin, index) => {
          log(`      ${index + 1}. ${admin.clerk_user_id} (${admin.role})`, colors.gray);
        });
      } else {
        log('   ⚠️  No admin users found', colors.yellow);
      }
    } else {
      log('❌ No user profiles found', colors.red);
    }
    
    // Check other tables
    log('\n🗄️  Verifying other tables...', colors.cyan);
    const tables = [
      'interactions',
      'user_interactions', 
      'chat_messages',
      'analytics_events',
      'programs',
      'campus_updates'
    ];
    
    for (const table of tables) {
      try {
        const result = await querySupabase(table, 'count', '');
        const count = result[0]?.count || 0;
        log(`   ✅ ${table}: ${count} records`, colors.green);
      } catch (error) {
        log(`   ❌ ${table}: Error - ${error.message}`, colors.red);
      }
    }
    
    // Summary
    log('\n🎉 Database Setup Verification Complete!', colors.green);
    log('========================================', colors.green);
    
    if (channels.length >= 8 && contentCount >= 30) {
      log('✅ Setup appears to be working correctly', colors.green);
      log('✅ Ready for production use', colors.green);
    } else {
      log('⚠️  Setup incomplete - check the issues above', colors.yellow);
    }
    
    log('\n📋 Next Steps:', colors.blue);
    log('   1. Start dev server: npm run dev', colors.gray);
    log('   2. Access admin panel: http://localhost:3000/admin', colors.gray);
    log('   3. Verify content appears correctly', colors.gray);
    
  } catch (error) {
    log(`❌ Verification failed: ${error.message}`, colors.red);
    log('\n🔧 Troubleshooting:', colors.yellow);
    log('   1. Check your .env.local file', colors.gray);
    log('   2. Verify Supabase project is running', colors.gray);
    log('   3. Ensure database tables were created', colors.gray);
    return false;
  }
}

if (require.main === module) {
  verifySetup().catch(console.error);
}

module.exports = { verifySetup };