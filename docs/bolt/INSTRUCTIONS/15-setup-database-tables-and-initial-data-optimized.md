# Step 15: Setup Database Tables and Initial Data

## Context
You are building Tempest, an interactive streaming platform. This step creates all database tables, relationships, functions, and initial data in Supabase.

## Purpose
Database schema is the foundation of the application. Tables must be created in the EXACT order specified to handle foreign key relationships. Missing or incorrect schema will cause application failures.

## Prerequisites
- Step 14 completed successfully
- Supabase project created and accessible
- Supabase environment variables configured
- You have access to Supabase dashboard

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Users Table ⏳

**Run in Supabase SQL Editor:**
```sql
-- CRITICAL: Users table synced with Clerk authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  username TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- CRITICAL: Indexes for performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);

-- CRITICAL: RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all users
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.jwt() ->> 'clerk_id' = clerk_id);

-- CRITICAL: Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Task 2: Create Channels Table ⏳

**Run in Supabase SQL Editor:**
```sql
-- CRITICAL: Channels for content organization
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: Indexes
CREATE INDEX idx_channels_slug ON channels(slug);
CREATE INDEX idx_channels_is_active ON channels(is_active);

-- CRITICAL: RLS policies
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active channels
CREATE POLICY "Anyone can view active channels" ON channels
  FOR SELECT USING (is_active = true);

-- Policy: Only admins can modify channels
CREATE POLICY "Admins can modify channels" ON channels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.clerk_id = auth.jwt() ->> 'clerk_id' 
      AND users.role = 'admin'
    )
  );

-- CRITICAL: Insert default channels
INSERT INTO channels (name, slug, description, color) VALUES
  ('Campus Life', 'campus-life', 'Student life and campus events', '#3b82f6'),
  ('Explore', 'explore', 'Discover new content and creators', '#10b981'),
  ('Create', 'create', 'Creative content and tutorials', '#f59e0b'),
  ('Chill', 'chill', 'Relaxing content and entertainment', '#8b5cf6');

-- Trigger for updated_at
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Task 3: Create Videos Table ⏳

**Run in Supabase SQL Editor:**
```sql
-- CRITICAL: Videos table for all content
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  cloudflare_stream_id TEXT,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  view_count INTEGER DEFAULT 0,
  is_live BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: Indexes for performance
CREATE INDEX idx_videos_channel_id ON videos(channel_id);
CREATE INDEX idx_videos_published_at ON videos(published_at);
CREATE INDEX idx_videos_is_live ON videos(is_live);
CREATE INDEX idx_videos_is_featured ON videos(is_featured);

-- CRITICAL: RLS policies
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published videos
CREATE POLICY "Anyone can view published videos" ON videos
  FOR SELECT USING (published_at IS NOT NULL AND published_at <= NOW());

-- Policy: Admins can manage videos
CREATE POLICY "Admins can manage videos" ON videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.clerk_id = auth.jwt() ->> 'clerk_id' 
      AND users.role = 'admin'
    )
  );

-- CRITICAL: Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(video_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos 
  SET view_count = view_count + 1 
  WHERE id = video_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Task 4: Create Chat and Interaction Tables ⏳

**Run in Supabase SQL Editor:**
```sql
-- CRITICAL: Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_command BOOLEAN DEFAULT false,
  command_type TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: Indexes
CREATE INDEX idx_chat_messages_video_id ON chat_messages(video_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- CRITICAL: RLS policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view non-deleted messages
CREATE POLICY "Anyone can view messages" ON chat_messages
  FOR SELECT USING (is_deleted = false);

-- Policy: Authenticated users can send messages
CREATE POLICY "Authenticated users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_id 
      AND users.clerk_id = auth.jwt() ->> 'clerk_id'
    )
  );

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete own messages" ON chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_id 
      AND users.clerk_id = auth.jwt() ->> 'clerk_id'
    )
  );

-- CRITICAL: Interactions table
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reaction', 'poll', 'quiz', 'rating', 'bookmark')),
  data JSONB NOT NULL DEFAULT '{}',
  timestamp_in_video INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: Indexes
CREATE INDEX idx_interactions_video_id ON interactions(video_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_type ON interactions(type);

-- CRITICAL: RLS policies
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view interactions
CREATE POLICY "Anyone can view interactions" ON interactions
  FOR SELECT USING (true);

-- Policy: Authenticated users can create interactions
CREATE POLICY "Authenticated users can create interactions" ON interactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_id 
      AND users.clerk_id = auth.jwt() ->> 'clerk_id'
    )
  );
```

### Task 5: Create Analytics and Additional Tables ⏳

**Run in Supabase SQL Editor:**
```sql
-- CRITICAL: Analytics aggregation table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  time_bucket TEXT NOT NULL CHECK (time_bucket IN ('5min', 'hour', 'day')),
  timestamp TIMESTAMPTZ NOT NULL,
  viewer_count INTEGER DEFAULT 0,
  chat_message_count INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: Indexes
CREATE INDEX idx_analytics_video_id ON analytics(video_id);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp);
CREATE INDEX idx_analytics_time_bucket ON analytics(time_bucket);

-- CRITICAL: Polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  duration_seconds INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- CRITICAL: Ads table
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  advertiser TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pre-roll', 'mid-roll', 'overlay', 'banner')),
  media_url TEXT NOT NULL,
  click_url TEXT,
  targeting JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Basic read policies
CREATE POLICY "Anyone can view analytics" ON analytics FOR SELECT USING (true);
CREATE POLICY "Anyone can view active polls" ON polls FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active ads" ON ads FOR SELECT USING (is_active = true);
```

### Task 6: Create Real-time Functions ⏳

**Run in Supabase SQL Editor:**
```sql
-- CRITICAL: Function to get current viewer count
CREATE OR REPLACE FUNCTION get_current_viewers(video_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  viewer_count INTEGER;
BEGIN
  SELECT COALESCE(MAX(viewer_count), 0) INTO viewer_count
  FROM analytics
  WHERE video_id = video_uuid
  AND time_bucket = '5min'
  AND timestamp > NOW() - INTERVAL '5 minutes';
  
  RETURN viewer_count;
END;
$$ LANGUAGE plpgsql;

-- CRITICAL: Function to track user activity
CREATE OR REPLACE FUNCTION track_user_activity(
  p_video_id UUID,
  p_user_id UUID,
  p_activity_type TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Log activity (extend as needed)
  INSERT INTO interactions (video_id, user_id, type, data)
  VALUES (p_video_id, p_user_id, p_activity_type, '{"timestamp": "now"}');
END;
$$ LANGUAGE plpgsql;

-- CRITICAL: Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics;
```

### Task 7: Insert Sample Data ⏳

**Run in Supabase SQL Editor:**
```sql
-- CRITICAL: Insert sample videos for testing
INSERT INTO videos (title, description, channel_id, thumbnail_url, duration, published_at, is_featured)
SELECT 
  'Welcome to Tempest Streaming',
  'Introduction to our interactive streaming platform',
  id,
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
  300,
  NOW(),
  true
FROM channels WHERE slug = 'campus-life';

INSERT INTO videos (title, description, channel_id, thumbnail_url, duration, published_at)
SELECT 
  'Getting Started with Live Streaming',
  'Learn how to start your first live stream',
  id,
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
  600,
  NOW() - INTERVAL '1 hour'
FROM channels WHERE slug = 'create';

INSERT INTO videos (title, description, channel_id, thumbnail_url, duration, published_at, is_live)
SELECT 
  'Live Campus Tour',
  'Join us for a live tour of the campus',
  id,
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400',
  0,
  NOW(),
  true
FROM channels WHERE slug = 'explore';
```

## Task Completion Checklist
Mark each task as complete:

- [ ] Task 1: Users table created ✅
- [ ] Task 2: Channels table created with data ✅
- [ ] Task 3: Videos table created ✅
- [ ] Task 4: Chat and interaction tables created ✅
- [ ] Task 5: Analytics and additional tables created ✅
- [ ] Task 6: Real-time functions created ✅
- [ ] Task 7: Sample data inserted ✅

## Verification Steps

**Run these queries to verify:**
```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check row counts
SELECT 'channels' as table_name, COUNT(*) as count FROM channels
UNION ALL
SELECT 'videos', COUNT(*) FROM videos
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- Test RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## Critical Schema Notes

**FOREIGN KEYS**: Tables must be created in order due to relationships
**RLS**: Row Level Security is enabled on all tables
**INDEXES**: Created for all foreign keys and frequently queried columns
**REAL-TIME**: Enabled for chat_messages, interactions, and analytics

## Common Issues & Solutions

**Issue**: Foreign key constraint errors
**Solution**: Ensure tables are created in the exact order specified

**Issue**: RLS blocking queries
**Solution**: Check auth.jwt() is available or temporarily disable RLS for testing

**Issue**: Real-time not working
**Solution**: Verify tables are added to supabase_realtime publication

## Success Criteria
- All tables created successfully
- RLS policies applied
- Sample data inserted
- Real-time enabled for specified tables
- No errors in SQL execution

## Next Step
After all tasks show ✅, proceed to Step 16: Create Core React Hooks