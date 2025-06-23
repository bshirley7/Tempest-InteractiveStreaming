# Step 15: Setup Database Tables and Initial Data

## Context
You are building Tempest, an interactive streaming platform. This step creates the complete database schema in Supabase and seeds initial data including channels, sample content, and admin user configuration.

## Purpose
The database serves as the foundation for all platform data including users, videos, chat messages, analytics, and real-time interactions. Proper setup ensures data integrity and enables real-time features.

## Prerequisites
- Step 14 completed successfully
- Supabase project created and configured
- Environment variables set with Supabase credentials
- Supabase client configuration completed

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Database Schema ⏳
Execute the complete database schema in Supabase SQL Editor.

**Instructions:**
1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and execute the following SQL schema:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'moderator', 'admin')),
  preferences JSONB DEFAULT '{}',
  last_seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Channels table
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  color TEXT,
  category TEXT CHECK (category IN ('education', 'entertainment', 'lifestyle')),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  cloudflare_stream_id TEXT UNIQUE,
  cloudflare_r2_key TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,
  duration INTEGER,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_live BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_command BOOLEAN DEFAULT false,
  command_type TEXT,
  is_highlighted BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES chat_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Interactions table
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('poll', 'quiz', 'reaction', 'rating', 'share', 'bookmark')),
  data JSONB NOT NULL,
  timestamp_in_video INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  trigger_time INTEGER,
  duration INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT false,
  results_visible BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Ads table
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  advertiser TEXT,
  type TEXT NOT NULL CHECK (type IN ('pre-roll', 'mid-roll', 'overlay', 'banner')),
  media_url TEXT,
  click_url TEXT,
  duration INTEGER,
  target_criteria JSONB DEFAULT '{}',
  budget_cents INTEGER,
  cost_per_impression_cents INTEGER,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Schedules table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  time_bucket TEXT NOT NULL CHECK (time_bucket IN ('5min', 'hour', 'day')),
  viewer_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  chat_messages INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 0,
  ad_impressions INTEGER DEFAULT 0,
  ad_revenue_cents INTEGER DEFAULT 0,
  average_watch_time INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0.00
);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT unique_user_video UNIQUE(user_id, video_id),
  CONSTRAINT unique_user_channel UNIQUE(user_id, channel_id),
  CONSTRAINT check_favorite_type CHECK (
    (video_id IS NOT NULL AND channel_id IS NULL) OR
    (video_id IS NULL AND channel_id IS NOT NULL)
  )
);

-- Watch history table
CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  watch_time INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

**Verification:** 
- All tables created successfully without errors
- Check in Supabase dashboard that all 12 tables appear

### Task 2: Create Database Indexes ⏳
Add performance indexes for frequently queried columns.

**Execute in Supabase SQL Editor:**

```sql
-- Create indexes for performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_channels_slug ON channels(slug);
CREATE INDEX idx_channels_is_active ON channels(is_active);
CREATE INDEX idx_channels_category ON channels(category);

CREATE INDEX idx_videos_channel_id ON videos(channel_id);
CREATE INDEX idx_videos_cloudflare_stream_id ON videos(cloudflare_stream_id);
CREATE INDEX idx_videos_is_live ON videos(is_live);
CREATE INDEX idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX idx_videos_tags ON videos USING gin(tags);

CREATE INDEX idx_chat_messages_video_id ON chat_messages(video_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_is_command ON chat_messages(is_command) WHERE is_command = true;

CREATE INDEX idx_interactions_video_id ON interactions(video_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_type ON interactions(type);
CREATE INDEX idx_interactions_created_at ON interactions(created_at DESC);

CREATE INDEX idx_polls_video_id ON polls(video_id);
CREATE INDEX idx_polls_trigger_time ON polls(trigger_time);
CREATE INDEX idx_polls_is_active ON polls(is_active);

CREATE INDEX idx_ads_type ON ads(type);
CREATE INDEX idx_ads_is_active ON ads(is_active);
CREATE INDEX idx_ads_date_range ON ads(start_date, end_date);

CREATE INDEX idx_schedules_channel_id ON schedules(channel_id);
CREATE INDEX idx_schedules_video_id ON schedules(video_id);
CREATE INDEX idx_schedules_time_range ON schedules(start_time, end_time);

CREATE INDEX idx_analytics_video_id ON analytics(video_id);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp DESC);
CREATE INDEX idx_analytics_time_bucket ON analytics(time_bucket);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_video_id ON favorites(video_id);
CREATE INDEX idx_favorites_channel_id ON favorites(channel_id);

CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_video_id ON watch_history(video_id);
CREATE INDEX idx_watch_history_updated_at ON watch_history(updated_at DESC);
```

**Verification:** 
- All indexes created successfully
- No duplicate index errors

### Task 3: Create Database Functions ⏳
Add utility functions for common operations.

**Execute in Supabase SQL Editor:**

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to increment view count safely
CREATE OR REPLACE FUNCTION increment_view_count(video_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE videos 
    SET view_count = view_count + 1 
    WHERE id = video_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get active schedule for a channel
CREATE OR REPLACE FUNCTION get_active_schedule(channel_uuid UUID)
RETURNS TABLE (
    video_id UUID,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.video_id, s.start_time, s.end_time
    FROM schedules s
    WHERE s.channel_id = channel_uuid
    AND NOW() BETWEEN s.start_time AND s.end_time
    ORDER BY s.start_time DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

**Verification:** 
- All functions created successfully
- No syntax errors in function definitions

### Task 4: Create Database Triggers ⏳
Add triggers for automatic timestamp updates.

**Execute in Supabase SQL Editor:**

```sql
-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at 
    BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at 
    BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at 
    BEFORE UPDATE ON ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at 
    BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watch_history_updated_at 
    BEFORE UPDATE ON watch_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Verification:** 
- All triggers created successfully
- Triggers appear in Supabase dashboard

### Task 5: Setup Row Level Security ⏳
Enable RLS and create security policies.

**Execute in Supabase SQL Editor:**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Public read policies for content
CREATE POLICY "Anyone can view active channels" ON channels
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view published videos" ON videos
    FOR SELECT USING (published_at IS NOT NULL AND published_at <= NOW());

CREATE POLICY "Anyone can view public analytics" ON analytics
    FOR SELECT USING (true);

-- Chat message policies
CREATE POLICY "Anyone can read chat messages" ON chat_messages
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Authenticated users can send messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- User-specific policies
CREATE POLICY "Users can view all user profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Interaction policies
CREATE POLICY "Anyone can view interactions" ON interactions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create interactions" ON interactions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admin policies (placeholder - will be enhanced)
CREATE POLICY "Service role can manage all data" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all channels" ON channels
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all videos" ON videos
    FOR ALL USING (auth.role() = 'service_role');
```

**Verification:** 
- RLS enabled on all tables
- Policies created without errors
- Check policies appear in Authentication > Policies

### Task 6: Enable Realtime Features ⏳
Enable realtime subscriptions for live features.

**Execute in Supabase SQL Editor:**

```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE polls;
```

**Verification:** 
- Realtime enabled successfully
- Tables appear in Supabase Realtime settings

### Task 7: Seed Initial Data ⏳
Insert default channels and sample data.

**Execute in Supabase SQL Editor:**

```sql
-- Insert default channels
INSERT INTO channels (name, slug, description, color, category, logo_url) VALUES
('Campus Life', 'campus-life', 'Student life, events, and campus culture', '#FF6B6B', 'lifestyle', 'https://via.placeholder.com/100x100/FF6B6B/FFFFFF?text=CL'),
('Explore', 'explore', 'Documentaries, science, and discovery', '#4ECDC4', 'education', 'https://via.placeholder.com/100x100/4ECDC4/FFFFFF?text=EX'),
('Create', 'create', 'Art, design, and creative tutorials', '#45B7D1', 'education', 'https://via.placeholder.com/100x100/45B7D1/FFFFFF?text=CR'),
('Chill', 'chill', 'Relaxation, music, and ambient content', '#96CEB4', 'entertainment', 'https://via.placeholder.com/100x100/96CEB4/FFFFFF?text=CH');

-- Insert sample videos (placeholders)
WITH channel_ids AS (
  SELECT id, slug FROM channels
)
INSERT INTO videos (title, description, channel_id, thumbnail_url, duration, is_featured, published_at, tags)
SELECT 
  CASE 
    WHEN c.slug = 'campus-life' THEN 'Student Life Highlights'
    WHEN c.slug = 'explore' THEN 'Nature Documentary Preview'
    WHEN c.slug = 'create' THEN 'Digital Art Tutorial'
    WHEN c.slug = 'chill' THEN 'Ambient Sounds for Focus'
  END,
  CASE 
    WHEN c.slug = 'campus-life' THEN 'A look at student activities and campus events'
    WHEN c.slug = 'explore' THEN 'Discover the wonders of nature in this preview'
    WHEN c.slug = 'create' THEN 'Learn digital art techniques from professionals'
    WHEN c.slug = 'chill' THEN 'Relaxing ambient sounds for work and study'
  END,
  c.id,
  'https://via.placeholder.com/640x360/333333/FFFFFF?text=' || UPPER(LEFT(c.slug, 2)),
  CASE 
    WHEN c.slug = 'campus-life' THEN 1800
    WHEN c.slug = 'explore' THEN 3600
    WHEN c.slug = 'create' THEN 2400
    WHEN c.slug = 'chill' THEN 7200
  END,
  true,
  NOW() - INTERVAL '1 day',
  CASE 
    WHEN c.slug = 'campus-life' THEN ARRAY['student-life', 'campus', 'events']
    WHEN c.slug = 'explore' THEN ARRAY['nature', 'documentary', 'science']
    WHEN c.slug = 'create' THEN ARRAY['art', 'tutorial', 'creative']
    WHEN c.slug = 'chill' THEN ARRAY['ambient', 'relaxation', 'focus']
  END
FROM channel_ids c;

-- Insert sample ads
INSERT INTO ads (title, advertiser, type, duration, target_criteria, is_active, start_date, end_date) VALUES
('Study App Promotion', 'EduTech Co', 'pre-roll', 15, '{"interests": ["education", "productivity"]}', true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
('Creative Software Demo', 'DesignSoft', 'mid-roll', 30, '{"interests": ["art", "design"]}', true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
('Wellness Brand', 'ZenLife', 'overlay', 10, '{"interests": ["wellness", "lifestyle"]}', true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days');
```

**Verification:** 
- 4 default channels created
- Sample videos inserted for each channel
- Sample ads inserted
- Data appears in Supabase table editor

### Task 8: Test Database Connection ⏳
Create and test an API route to verify database connectivity.

**File to Create:** `app/api/test-db/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test channels query
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (channelsError) {
      throw channelsError;
    }
    
    // Test videos query
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select(`
        id,
        title,
        duration,
        view_count,
        channel:channels(name, slug, color)
      `)
      .not('published_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (videosError) {
      throw videosError;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        channels_count: channels?.length || 0,
        channels,
        videos_count: videos?.length || 0,
        videos,
      }
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }, { status: 500 });
  }
}
```

**Test the API:**
1. Start development server: `npm run dev`
2. Visit: http://localhost:3000/api/test-db
3. Verify response shows channels and videos data

**Verification:** 
- API route created successfully
- Database connection works
- Sample data is returned
- No errors in response

## Task Completion Checklist
Mark each task as complete when finished:

- [ ] Task 1: Database schema created ✅
- [ ] Task 2: Performance indexes added ✅  
- [ ] Task 3: Utility functions created ✅
- [ ] Task 4: Database triggers configured ✅
- [ ] Task 5: Row Level Security enabled ✅
- [ ] Task 6: Realtime features enabled ✅
- [ ] Task 7: Initial data seeded ✅
- [ ] Task 8: Database connection tested ✅

## Success Criteria
- All 12 database tables created successfully
- Indexes and functions operational
- RLS policies protecting data appropriately
- Realtime subscriptions enabled
- Sample data visible in Supabase dashboard
- API test route returns valid data
- No SQL errors or warnings

## Important Notes
- Database schema supports real-time features
- RLS provides security while allowing public content access
- Sample data includes all four default channels
- Functions optimize common operations
- Triggers maintain data consistency

## Troubleshooting
If you encounter issues:
1. Check Supabase project URL and keys in environment variables
2. Verify network connectivity to Supabase
3. Check SQL syntax if queries fail
4. Review RLS policies if data access is blocked

## Next Step
After completing this step and marking all tasks ✅, proceed to Step 16: Create Core React Hooks.