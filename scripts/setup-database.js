#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * Creates the necessary tables for the content library if they don't exist.
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
        'User-Agent': 'Tempest-DB-Setup/1.0',
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

async function executeSql(sql) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const url = `${supabaseUrl}/rest/v1/rpc/exec_sql`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: { sql }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SQL execution error: ${response.status} - ${error}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to execute SQL: ${error.message}`);
  }
}

async function createTables() {
  try {
    log('🔧 Setting up database tables...', colors.blue);
    
    // Create content table
    const createContentTable = `
      CREATE TABLE IF NOT EXISTS public.content (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        cloudflare_video_id TEXT UNIQUE NOT NULL,
        thumbnail_url TEXT,
        thumbnail_source TEXT DEFAULT 'stream',
        thumbnail_metadata JSONB,
        duration INTEGER,
        category TEXT,
        genre TEXT,
        keywords TEXT[] DEFAULT '{}',
        language TEXT DEFAULT 'English',
        instructor TEXT,
        difficulty_level TEXT DEFAULT 'Beginner',
        target_audience TEXT,
        learning_objectives TEXT[] DEFAULT '{}',
        prerequisites TEXT[] DEFAULT '{}',
        tags TEXT[] DEFAULT '{}',
        is_featured BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT false,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TIMESTAMPTZ,
        stream_metadata JSONB,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      CREATE INDEX IF NOT EXISTS idx_content_cloudflare_video_id ON public.content(cloudflare_video_id);
      CREATE INDEX IF NOT EXISTS idx_content_is_published ON public.content(is_published);
      CREATE INDEX IF NOT EXISTS idx_content_category ON public.content(category);
      CREATE INDEX IF NOT EXISTS idx_content_sync_status ON public.content(sync_status);
    `;
    
    log('   Creating content table...', colors.gray);
    await executeSql(createContentTable);
    log('   ✅ Content table created', colors.green);
    
    // Create channels table
    const createChannelsTable = `
      CREATE TABLE IF NOT EXISTS public.channels (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        category TEXT,
        thumbnail_url TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      CREATE INDEX IF NOT EXISTS idx_channels_slug ON public.channels(slug);
      CREATE INDEX IF NOT EXISTS idx_channels_is_active ON public.channels(is_active);
      
      -- Insert default channel if none exist
      INSERT INTO public.channels (name, slug, description, category)
      SELECT 'Campus Life', 'campus-life', 'General campus content and activities', 'general'
      WHERE NOT EXISTS (SELECT 1 FROM public.channels);
    `;
    
    log('   Creating channels table...', colors.gray);
    await executeSql(createChannelsTable);
    log('   ✅ Channels table created', colors.green);
    
    // Add channel relationship to content
    const addChannelRelation = `
      ALTER TABLE public.content 
      ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES public.channels(id);
      
      CREATE INDEX IF NOT EXISTS idx_content_channel_id ON public.content(channel_id);
    `;
    
    log('   Adding channel relationship...', colors.gray);
    await executeSql(addChannelRelation);
    log('   ✅ Channel relationship added', colors.green);
    
    log('\n✅ Database setup completed successfully!', colors.green);
    return true;
    
  } catch (error) {
    log(`❌ Database setup failed: ${error.message}`, colors.red);
    
    // Try alternative approach - direct table creation
    if (error.message.includes('exec_sql')) {
      log('\n   💡 Trying alternative table creation method...', colors.yellow);
      return await createTablesAlternative();
    }
    
    return false;
  }
}

async function createTablesAlternative() {
  try {
    log('   Creating tables via REST API...', colors.gray);
    
    // First check if tables exist by trying to query them
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Test content table
    const testUrl = `${supabaseUrl}/rest/v1/content?select=id&limit=1`;
    const testResponse = await fetch(testUrl, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (testResponse.ok) {
      log('   ✅ Content table already exists', colors.green);
      return true;
    }
    
    log('   ℹ️  Tables need to be created manually in Supabase dashboard', colors.yellow);
    log('   Or run the SQL directly in the Supabase SQL editor:', colors.yellow);
    log('\n   CREATE TABLE content (...);', colors.gray);
    
    return false;
    
  } catch (error) {
    log(`   ❌ Alternative setup failed: ${error.message}`, colors.red);
    return false;
  }
}

async function main() {
  log('🗄️  Tempest Database Setup', colors.blue);
  log('==========================\n', colors.blue);
  
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
  
  const success = await createTables();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}