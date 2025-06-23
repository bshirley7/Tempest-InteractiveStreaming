# Complete Database Schema

Copy and paste this entire SQL script into your Supabase SQL Editor to create all tables at once.

## 🎯 Instructions

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Click "New query"**
3. **Copy ALL the SQL below** (Ctrl+A, Ctrl+C)
4. **Paste into the editor** (Ctrl+V)
5. **Click "Run"** (or press Ctrl+Enter)
6. **Wait for success message**

---

## 📋 Complete SQL Schema

```sql
-- =============================================================================
-- TEMPEST DATABASE SCHEMA
-- Complete setup for streaming platform metadata (NO VIDEO FILES STORED)
-- =============================================================================

-- User Profiles Table (syncs with Clerk authentication)
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

-- Channels Table (Campus Life, Academic, Sports, etc.)
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

-- Content Table (Video metadata ONLY - actual videos stay in Cloudflare)
CREATE TABLE IF NOT EXISTS public.content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  cloudflare_video_id TEXT UNIQUE NOT NULL,  -- Reference to Cloudflare Stream
  thumbnail_url TEXT,
  thumbnail_source TEXT DEFAULT 'stream',
  thumbnail_metadata JSONB DEFAULT '{}',
  duration INTEGER,  -- Duration in seconds
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
  stream_metadata JSONB DEFAULT '{}',  -- Cloudflare Stream metadata
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

-- Videos View (for backward compatibility)
CREATE OR REPLACE VIEW public.videos AS
SELECT * FROM public.content;

-- Programs Table (Scheduled content/live programming)
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

-- Interactions Table (Polls, quizzes, ratings, reactions)
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

-- User Interactions Table (User responses to polls/quizzes)
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

-- Chat Messages Table (Live chat during streams)
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

-- Analytics Events Table (User activity tracking)
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

-- Campus Updates Table (Announcements, news)
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

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
        AND table_name IN ('user_profiles', 'channels', 'content', 'programs', 'interactions', 'chat_messages', 'campus_updates')
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
            CREATE TRIGGER update_%I_updated_at 
            BEFORE UPDATE ON public.%I 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END $$;

-- =============================================================================
-- DEFAULT DATA (SAMPLE CHANNELS AND ADMIN USERS)
-- =============================================================================

-- Insert default channels
INSERT INTO public.channels (name, slug, description, category, is_active, sort_order) VALUES
('Campus Pulse', 'campus-pulse', 'Campus news and updates', 'news', true, 1),
('RetireWise', 'retirewise', 'Travel and culture', 'travel', true, 2),
('MindFeed', 'mindfeed', 'Documentaries and educational content', 'education', true, 3),
('Career Compass', 'career-compass', 'Professional development and career guidance', 'professional', true, 4),
('QuizQuest', 'quizquest', 'Interactive trivia and games', 'interactive', true, 5),
('StudyBreak', 'studybreak', 'Entertainment and gaming', 'entertainment', true, 6),
('Wellness Wave', 'wellness-wave', 'Health and lifestyle content', 'health', true, 7),
('How-To Hub', 'how-to-hub', 'Tutorials and DIY content', 'tutorials', true, 8)
ON CONFLICT (slug) DO NOTHING;

-- Insert admin users (update with your actual Clerk user IDs)
INSERT INTO public.user_profiles (clerk_user_id, role) VALUES
('user_2y232PRIhXVR9omfFBhPQdG6DZU', 'admin'),
('user_2ykxfPwP3yMZH0HbqadSs4FaDXT', 'admin')
ON CONFLICT (clerk_user_id) DO UPDATE SET role = 'admin';

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

-- Verify tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'user_profiles', 'channels', 'content', 'programs', 
        'interactions', 'user_interactions', 'chat_messages', 
        'analytics_events', 'campus_updates'
    )
ORDER BY tablename;
```

---

## ✅ Expected Result

After running this SQL, you should see:
- **Success message** in Supabase
- **9 tables created** (plus 1 view)
- **8 default channels** added
- **Admin users** configured

## 🚀 Next Steps

1. **Verify setup**: `npm run db:check`
2. **Run sync**: `npm run sync:simple`
3. **Check results**: Should import 38 videos from Cloudflare

## 🎯 What This Creates

- ✅ **Metadata tables only** (no video files)
- ✅ **Default channels** for organization
- ✅ **Admin access** for your Clerk user
- ✅ **Performance indexes** for fast queries
- ✅ **Automatic timestamps** with triggers
- ✅ **Foreign key relationships** for data integrity