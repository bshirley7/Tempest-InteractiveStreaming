#!/usr/bin/env node

/**
 * Direct Database Setup using PostgreSQL Connection String
 * 
 * This script creates all necessary tables directly in your Supabase database
 * using the PostgreSQL connection string.
 * 
 * Usage:
 *   DATABASE_URL="postgresql://..." npm run db:create
 *   or add DATABASE_URL to your .env.local file
 */

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

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

  // Videos view for compatibility
  videosView: `
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

  // Updated timestamp function
  updateFunction: `
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `,

  // Default data
  defaultChannels: `
    INSERT INTO public.channels (name, slug, description, category, is_active, sort_order) VALUES
    ('Campus Life', 'campus-life', 'General campus content, events, and activities', 'general', true, 1),
    ('Academic', 'academic', 'Lectures, seminars, and educational content', 'education', true, 2),
    ('Sports', 'sports', 'Campus sports events and athletics', 'sports', true, 3),
    ('Student Organizations', 'student-orgs', 'Content from student clubs and organizations', 'community', true, 4),
    ('Arts & Culture', 'arts-culture', 'Cultural events, performances, and exhibitions', 'entertainment', true, 5),
    ('Research', 'research', 'Research presentations and academic discussions', 'education', true, 6)
    ON CONFLICT (slug) DO NOTHING;
  `,

  // Default admin users
  defaultAdmins: `
    INSERT INTO public.user_profiles (clerk_user_id, role) VALUES
    ('user_2y232PRIhXVR9omfFBhPQdG6DZU', 'admin'),
    ('user_2ykxfPwP3yMZH0HbqadSs4FaDXT', 'admin')
    ON CONFLICT (clerk_user_id) DO UPDATE SET role = 'admin';
  `
};

// Function to create triggers for all tables with updated_at
const createTriggers = async (client) => {
  const tables = [
    'user_profiles', 'channels', 'content', 'programs', 
    'interactions', 'chat_messages', 'campus_updates'
  ];
  
  for (const table of tables) {
    try {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON public.${table};
        CREATE TRIGGER update_${table}_updated_at 
        BEFORE UPDATE ON public.${table} 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
      `);
    } catch (error) {
      log(`   ⚠️  Trigger for ${table}: ${error.message}`, colors.yellow);
    }
  }
};

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
  
  if (!connectionString) {
    log('❌ No database connection string found!', colors.red);
    log('\n📋 Please add one of these to your .env.local:', colors.yellow);
    log('   DATABASE_URL="postgresql://..."', colors.gray);
    log('   or', colors.gray);
    log('   SUPABASE_DATABASE_URL="postgresql://..."', colors.gray);
    log('\n💡 You can find this in your Supabase dashboard:', colors.blue);
    log('   Settings → Database → Connection string', colors.gray);
    return false;
  }
  
  // Validate connection string format
  if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
    log('❌ Invalid connection string format!', colors.red);
    log('   Expected: postgresql://... or postgres://...', colors.yellow);
    log(`   Got: ${connectionString.substring(0, 20)}...`, colors.gray);
    return false;
  }
  
  // Parse connection string and ensure it's valid
  let clientConfig;
  try {
    clientConfig = {
      connectionString: connectionString.trim(),
      ssl: connectionString.includes('supabase.co') ? {
        rejectUnauthorized: false
      } : false
    };
  } catch (error) {
    log(`❌ Invalid connection string format: ${error.message}`, colors.red);
    return false;
  }
  
  const client = new Client(clientConfig);
  
  try {
    log('🔌 Connecting to database...', colors.blue);
    await client.connect();
    log('✅ Connected successfully!\n', colors.green);
    
    // Create schemas in order
    const steps = [
      { name: 'User Profiles', sql: schemas.userProfiles },
      { name: 'Channels', sql: schemas.channels },
      { name: 'Content', sql: schemas.content },
      { name: 'Videos View', sql: schemas.videosView },
      { name: 'Programs', sql: schemas.programs },
      { name: 'Interactions', sql: schemas.interactions },
      { name: 'User Interactions', sql: schemas.userInteractions },
      { name: 'Chat Messages', sql: schemas.chatMessages },
      { name: 'Analytics Events', sql: schemas.analyticsEvents },
      { name: 'Campus Updates', sql: schemas.campusUpdates },
      { name: 'Update Function', sql: schemas.updateFunction },
      { name: 'Default Channels', sql: schemas.defaultChannels },
      { name: 'Default Admins', sql: schemas.defaultAdmins }
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const step of steps) {
      try {
        log(`📝 Creating ${step.name}...`, colors.gray);
        await client.query(step.sql);
        log(`   ✅ ${step.name} created`, colors.green);
        successCount++;
      } catch (error) {
        log(`   ❌ ${step.name} failed: ${error.message}`, colors.red);
        errorCount++;
      }
    }
    
    // Create triggers
    log('📝 Creating update triggers...', colors.gray);
    await createTriggers(client);
    log('   ✅ Triggers created', colors.green);
    
    // Summary
    log(`\n📊 Database Setup Summary:`, colors.blue);
    log(`   ✅ Successful: ${successCount}`, colors.green);
    log(`   ❌ Failed: ${errorCount}`, errorCount > 0 ? colors.red : colors.gray);
    
    if (errorCount === 0) {
      log('\n🎉 Database setup completed successfully!', colors.green);
      log('   You can now run: npm run sync:simple', colors.gray);
      return true;
    } else {
      log('\n⚠️  Some operations failed, but this might be okay if tables already exist.', colors.yellow);
      return false;
    }
    
  } catch (error) {
    log(`\n❌ Database connection failed: ${error.message}`, colors.red);
    
    if (error.message.includes('password')) {
      log('   💡 Check your connection string format', colors.yellow);
    } else if (error.message.includes('ENOTFOUND')) {
      log('   💡 Check your database host URL', colors.yellow);
    } else if (error.message.includes('SSL')) {
      log('   💡 SSL connection issue - the script handles this automatically', colors.yellow);
    }
    
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  log('🗄️  Tempest Direct Database Setup', colors.blue);
  log('=================================\n', colors.blue);
  
  const success = await setupDatabase();
  process.exit(success ? 0 : 1);
}

// Handle script interruption
process.on('SIGINT', async () => {
  log('\n\n🛑 Database setup interrupted.', colors.yellow);
  process.exit(130);
});

if (require.main === module) {
  main();
}

module.exports = { setupDatabase };