#!/usr/bin/env node

/**
 * Update Channels Script
 * 
 * Updates the channels table with the new channel structure
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
        'User-Agent': 'Tempest-Channel-Update/1.0',
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

async function insertChannels() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const channels = [
    {
      name: 'Campus Pulse',
      slug: 'campus-pulse',
      description: 'Campus news and updates',
      category: 'news',
      is_active: true,
      sort_order: 1
    },
    {
      name: 'RetireWise',
      slug: 'retirewise',
      description: 'Travel and culture',
      category: 'travel',
      is_active: true,
      sort_order: 2
    },
    {
      name: 'MindFeed',
      slug: 'mindfeed',
      description: 'Documentaries and educational content',
      category: 'education',
      is_active: true,
      sort_order: 3
    },
    {
      name: 'Career Compass',
      slug: 'career-compass',
      description: 'Professional development and career guidance',
      category: 'professional',
      is_active: true,
      sort_order: 4
    },
    {
      name: 'QuizQuest',
      slug: 'quizquest',
      description: 'Interactive trivia and games',
      category: 'interactive',
      is_active: true,
      sort_order: 5
    },
    {
      name: 'StudyBreak',
      slug: 'studybreak',
      description: 'Entertainment and gaming',
      category: 'entertainment',
      is_active: true,
      sort_order: 6
    },
    {
      name: 'Wellness Wave',
      slug: 'wellness-wave',
      description: 'Health and lifestyle content',
      category: 'health',
      is_active: true,
      sort_order: 7
    },
    {
      name: 'How-To Hub',
      slug: 'how-to-hub',
      description: 'Tutorials and DIY content',
      category: 'tutorials',
      is_active: true,
      sort_order: 8
    }
  ];
  
  const url = `${supabaseUrl}/rest/v1/channels`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(channels)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase insert error: ${response.status} - ${error}`);
    }
    
    return true;
  } catch (error) {
    throw new Error(`Failed to insert channels: ${error.message}`);
  }
}

async function updateChannels() {
  log('📺 Tempest Channel Update Script', colors.blue);
  log('===============================\n', colors.blue);
  
  try {
    log('🔄 Inserting updated channels...', colors.blue);
    
    await insertChannels();
    
    log('✅ Channels updated successfully!', colors.green);
    log('\n📋 Updated Channels:', colors.blue);
    log('   1. 🏫 Campus Pulse - Campus news and updates', colors.gray);
    log('   2. ✈️  RetireWise - Travel and culture', colors.gray);
    log('   3. 🧠 MindFeed - Documentaries and educational', colors.gray);
    log('   4. 💼 Career Compass - Professional development', colors.gray);
    log('   5. 🎯 QuizQuest - Interactive trivia and games', colors.gray);
    log('   6. 🎮 StudyBreak - Entertainment and gaming', colors.gray);
    log('   7. 🏃 Wellness Wave - Health and lifestyle', colors.gray);
    log('   8. 🔧 How-To Hub - Tutorials and DIY', colors.gray);
    
    log('\n🎉 Channel update completed!', colors.green);
    
  } catch (error) {
    log(`❌ Channel update failed: ${error.message}`, colors.red);
    return false;
  }
}

if (require.main === module) {
  updateChannels().catch(console.error);
}

module.exports = { updateChannels };