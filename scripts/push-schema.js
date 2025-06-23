#!/usr/bin/env node

/**
 * Push Schema to Supabase
 * 
 * This script creates all necessary tables and relationships in Supabase
 * for the Tempest streaming platform.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

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

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// SQL Schema definitions
const schemas = {
  // User profiles table (syncs with Clerk)
  userProfiles: `
    CREATE TABLE IF NOT EXISTS public.user_profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      clerk_user_id TEXT UNIQUE NOT NULL,
      email TEXT,
      username TEXT,
      full_name TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'user',
      preferences JSONB DEFAULT '{}',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON public.user_profiles(clerk_user_id);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
  `,

  // Channels table
  channels: `
    CREATE TABLE IF NOT EXISTS public.channels (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category TEXT,
      thumbnail_url TEXT,
      logo_url TEXT,
      is_active BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false,
      sort_order INTEGER DEFAULT 0,
      settings JSONB DEFAULT '{}',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    CREATE INDEX IF NOT EXISTS idx_channels_slug ON public.channels(slug);
    CREATE INDEX IF NOT EXISTS idx_channels_is_active ON public.channels(is_active);
    CREATE INDEX IF NOT EXISTS idx_channels_category ON public.channels(category);
  `,

  // Content/Videos table
  content: `
    CREATE TABLE IF NOT EXISTS public.content (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
      cloudflare_video_id TEXT UNIQUE NOT NULL,
      thumbnail_url TEXT,
      thumbnail_source TEXT DEFAULT 'stream',
      thumbnail_metadata JSONB DEFAULT '{}',
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
      is_live BOOLEAN DEFAULT false,
      view_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      sync_status TEXT DEFAULT 'pending',
      last_synced_at TIMESTAMPTZ,
      stream_metadata JSONB DEFAULT '{}',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    CREATE INDEX IF NOT EXISTS idx_content_cloudflare_video_id ON public.content(cloudflare_video_id);
    CREATE INDEX IF NOT EXISTS idx_content_channel_id ON public.content(channel_id);
    CREATE INDEX IF NOT EXISTS idx_content_is_published ON public.content(is_published);
    CREATE INDEX IF NOT EXISTS idx_content_category ON public.content(category);
    CREATE INDEX IF NOT EXISTS idx_content_sync_status ON public.content(sync_status);
    CREATE INDEX IF NOT EXISTS idx_content_created_at ON public.content(created_at DESC);
  `,

  // Alternative videos table (for compatibility)
  videos: `
    CREATE OR REPLACE VIEW public.videos AS
    SELECT * FROM public.content;
  `,

  // Programs/Schedule table
  programs: `
    CREATE TABLE IF NOT EXISTS public.programs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
      content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      is_live BOOLEAN DEFAULT false,
      is_repeat BOOLEAN DEFAULT false,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    CREATE INDEX IF NOT EXISTS idx_programs_channel_id ON public.programs(channel_id);
    CREATE INDEX IF NOT EXISTS idx_programs_content_id ON public.programs(content_id);
    CREATE INDEX IF NOT EXISTS idx_programs_start_time ON public.programs(start_time);
    CREATE INDEX IF NOT EXISTS idx_programs_end_time ON public.programs(end_time);
  `,

  // Interactions table
  interactions: `
    CREATE TABLE IF NOT EXISTS public.interactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
      content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
      created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
      type TEXT NOT NULL CHECK (type IN ('poll', 'quiz', 'rating', 'reaction')),
      title TEXT NOT NULL,
      description TEXT,
      options JSONB DEFAULT '[]',
      correct_answer TEXT,
      is_active BOOLEAN DEFAULT true,
      starts_at TIMESTAMPTZ,
      ends_at TIMESTAMPTZ,
      results JSONB DEFAULT '{}',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    CREATE INDEX IF NOT EXISTS idx_interactions_channel_id ON public.interactions(channel_id);
    CREATE INDEX IF NOT EXISTS idx_interactions_content_id ON public.interactions(content_id);
    CREATE INDEX IF NOT EXISTS idx_interactions_type ON public.interactions(type);
    CREATE INDEX IF NOT EXISTS idx_interactions_is_active ON public.interactions(is_active);
  `,

  // User interactions/responses
  userInteractions: `
    CREATE TABLE IF NOT EXISTS public.user_interactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      interaction_id UUID REFERENCES public.interactions(id) ON DELETE CASCADE,
      user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
      response TEXT,
      response_data JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(interaction_id, user_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_interactions_interaction_id ON public.user_interactions(interaction_id);
    CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
  `,

  // Chat messages
  chatMessages: `
    CREATE TABLE IF NOT EXISTS public.chat_messages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
      content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
      user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      is_pinned BOOLEAN DEFAULT false,
      is_deleted BOOLEAN DEFAULT false,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON public.chat_messages(channel_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_content_id ON public.chat_messages(content_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
  `,

  // Analytics events
  analyticsEvents: `
    CREATE TABLE IF NOT EXISTS public.analytics_events (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
      channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
      content_id UUID REFERENCES public.content(id) ON DELETE SET NULL,
      event_type TEXT NOT NULL,
      event_data JSONB DEFAULT '{}',
      session_id TEXT,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    
    CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_channel_id ON public.analytics_events(channel_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_content_id ON public.analytics_events(content_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
  `,

  // Campus updates/announcements
  campusUpdates: `
    CREATE TABLE IF NOT EXISTS public.campus_updates (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      type TEXT DEFAULT 'general',
      priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
      author_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
      channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
      is_active BOOLEAN DEFAULT true,
      starts_at TIMESTAMPTZ,
      ends_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    CREATE INDEX IF NOT EXISTS idx_campus_updates_type ON public.campus_updates(type);
    CREATE INDEX IF NOT EXISTS idx_campus_updates_priority ON public.campus_updates(priority);
    CREATE INDEX IF NOT EXISTS idx_campus_updates_is_active ON public.campus_updates(is_active);
    CREATE INDEX IF NOT EXISTS idx_campus_updates_starts_at ON public.campus_updates(starts_at);
  `,

  // Updated timestamp triggers
  triggers: `
    -- Function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    
    -- Apply triggers to all tables with updated_at
    DO $$
    DECLARE
        t text;
    BEGIN
        FOR t IN 
            SELECT table_name 
            FROM information_schema.columns 
            WHERE column_name = 'updated_at' 
            AND table_schema = 'public'
        LOOP
            EXECUTE format('
                CREATE TRIGGER update_%I_updated_at 
                BEFORE UPDATE ON %I 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column();
            ', t, t);
        END LOOP;
    END $$;
  `,

  // Default data
  defaultData: `
    -- Insert default channels
    INSERT INTO public.channels (name, slug, description, category, is_active, sort_order) VALUES
    ('Campus Life', 'campus-life', 'General campus content, events, and activities', 'general', true, 1),
    ('Academic', 'academic', 'Lectures, seminars, and educational content', 'education', true, 2),
    ('Sports', 'sports', 'Campus sports events and athletics', 'sports', true, 3),
    ('Student Organizations', 'student-orgs', 'Content from student clubs and organizations', 'community', true, 4),
    ('Arts & Culture', 'arts-culture', 'Cultural events, performances, and exhibitions', 'entertainment', true, 5),
    ('Research', 'research', 'Research presentations and academic discussions', 'education', true, 6)
    ON CONFLICT (slug) DO NOTHING;
    
    -- Insert admin role for specific users (update clerk_user_id as needed)
    INSERT INTO public.user_profiles (clerk_user_id, role) VALUES
    ('user_2y232PRIhXVR9omfFBhPQdG6DZU', 'admin'),
    ('user_2ykxfPwP3yMZH0HbqadSs4FaDXT', 'admin')
    ON CONFLICT (clerk_user_id) DO UPDATE SET role = 'admin';
  `
};

async function executeSchema(supabase, name, sql) {
  try {
    log(`   📝 Executing ${name}...`, colors.gray);
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s + ';');
    
    for (const statement of statements) {
      // Skip empty statements
      if (statement.trim() === ';') continue;
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement 
      }).catch(err => ({ error: err }));
      
      if (error) {
        // Try direct execution as fallback
        const { error: directError } = await supabase
          .from('_sql')
          .insert({ query: statement })
          .catch(err => ({ error: err }));
        
        if (directError) {
          throw new Error(error.message || directError.message || 'Unknown error');
        }
      }
    }
    
    log(`   ✅ ${name} completed`, colors.green);
    return true;
  } catch (error) {
    log(`   ❌ ${name} failed: ${error.message}`, colors.red);
    return false;
  }
}

async function testConnection(supabase) {
  try {
    // Try to query any table to test connection
    const { data, error } = await supabase
      .from('channels')
      .select('count')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist - this is expected
      return true;
    }
    
    return !error;
  } catch (error) {
    return false;
  }
}

async function pushSchema() {
  try {
    log('🚀 Pushing schema to Supabase...', colors.blue);
    log('================================\n', colors.blue);
    
    const supabase = getSupabaseClient();
    
    // Test connection
    log('🔌 Testing Supabase connection...', colors.blue);
    const connected = await testConnection(supabase);
    
    if (!connected) {
      throw new Error('Failed to connect to Supabase. Check your credentials.');
    }
    
    log('✅ Connected to Supabase successfully\n', colors.green);
    
    // Execute schemas in order
    const schemaOrder = [
      { name: 'User Profiles', sql: schemas.userProfiles },
      { name: 'Channels', sql: schemas.channels },
      { name: 'Content', sql: schemas.content },
      { name: 'Videos View', sql: schemas.videos },
      { name: 'Programs', sql: schemas.programs },
      { name: 'Interactions', sql: schemas.interactions },
      { name: 'User Interactions', sql: schemas.userInteractions },
      { name: 'Chat Messages', sql: schemas.chatMessages },
      { name: 'Analytics Events', sql: schemas.analyticsEvents },
      { name: 'Campus Updates', sql: schemas.campusUpdates },
      { name: 'Triggers', sql: schemas.triggers },
      { name: 'Default Data', sql: schemas.defaultData }
    ];
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const schema of schemaOrder) {
      const success = await executeSchema(supabase, schema.name, schema.sql);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }
    
    log(`\n📊 Schema Push Summary:`, colors.blue);
    log(`   ✅ Successful: ${successCount}`, colors.green);
    log(`   ❌ Failed: ${failureCount}`, failureCount > 0 ? colors.red : colors.gray);
    
    if (failureCount > 0) {
      log(`\n⚠️  Some schemas failed to push.`, colors.yellow);
      log(`   This might be because:`, colors.yellow);
      log(`   1. Tables already exist (this is fine)`, colors.gray);
      log(`   2. Supabase doesn't allow direct SQL execution`, colors.gray);
      log(`   3. Missing permissions`, colors.gray);
      
      log(`\n💡 Alternative: Copy the SQL from scripts/schema.sql and run it in Supabase SQL Editor`, colors.yellow);
      return false;
    }
    
    log(`\n🎉 Schema pushed successfully!`, colors.green);
    log(`   You can now run: npm run sync:simple`, colors.gray);
    return true;
    
  } catch (error) {
    log(`\n❌ Schema push failed: ${error.message}`, colors.red);
    
    if (error.message.includes('credentials')) {
      log(`   💡 Check your .env.local file for:`, colors.yellow);
      log(`      - NEXT_PUBLIC_SUPABASE_URL`, colors.gray);
      log(`      - SUPABASE_SERVICE_ROLE_KEY`, colors.gray);
    }
    
    return false;
  }
}

// Also export the schema as a SQL file
async function exportSchema() {
  const fs = require('fs');
  const path = require('path');
  
  const sqlContent = `-- Tempest Database Schema
-- Generated on ${new Date().toISOString()}
-- 
-- This file contains all the SQL needed to set up the Tempest database in Supabase.
-- You can run this entire file in the Supabase SQL Editor.

-- ============================================
-- User Profiles Table
-- ============================================
${schemas.userProfiles}

-- ============================================
-- Channels Table
-- ============================================
${schemas.channels}

-- ============================================
-- Content/Videos Table
-- ============================================
${schemas.content}

-- ============================================
-- Videos View (for compatibility)
-- ============================================
${schemas.videos}

-- ============================================
-- Programs/Schedule Table
-- ============================================
${schemas.programs}

-- ============================================
-- Interactions Table
-- ============================================
${schemas.interactions}

-- ============================================
-- User Interactions Table
-- ============================================
${schemas.userInteractions}

-- ============================================
-- Chat Messages Table
-- ============================================
${schemas.chatMessages}

-- ============================================
-- Analytics Events Table
-- ============================================
${schemas.analyticsEvents}

-- ============================================
-- Campus Updates Table
-- ============================================
${schemas.campusUpdates}

-- ============================================
-- Triggers for Updated Timestamps
-- ============================================
${schemas.triggers}

-- ============================================
-- Default Data
-- ============================================
${schemas.defaultData}
`;

  const filePath = path.join(__dirname, 'schema.sql');
  fs.writeFileSync(filePath, sqlContent);
  log(`\n📄 Schema exported to: ${filePath}`, colors.blue);
}

async function main() {
  log('🗄️  Tempest Database Schema Push', colors.blue);
  log('================================\n', colors.blue);
  
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
  
  // Export schema file
  await exportSchema();
  
  // Push schema
  const success = await pushSchema();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { pushSchema };