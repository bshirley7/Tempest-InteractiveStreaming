# TEMPTEST - Complete Database Schema

## Overview

Temptest uses Supabase (PostgreSQL) for all persistent data storage. This document provides the complete database schema with detailed explanations for each table, column, and relationship.

## Database Tables

### 1. Users Table
Stores user profile information synced with Clerk authentication.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'viewer', -- 'viewer', 'moderator', 'admin'
  preferences JSONB DEFAULT '{}',
  last_seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

### 2. Channels Table
Defines streaming channels (e.g., Campus Life, Explore, Create, Chill).

```sql
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  color TEXT, -- Hex color for branding
  category TEXT, -- 'education', 'entertainment', 'lifestyle'
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_channels_slug ON channels(slug);
CREATE INDEX idx_channels_is_active ON channels(is_active);
CREATE INDEX idx_channels_category ON channels(category);
```

### 3. Videos Table
Stores all video content metadata.

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  cloudflare_stream_id TEXT UNIQUE,
  cloudflare_r2_key TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,
  duration INTEGER, -- in seconds
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}', -- custom metadata
  is_live BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_videos_channel_id ON videos(channel_id);
CREATE INDEX idx_videos_cloudflare_stream_id ON videos(cloudflare_stream_id);
CREATE INDEX idx_videos_is_live ON videos(is_live);
CREATE INDEX idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX idx_videos_tags ON videos USING gin(tags);
```

### 4. Chat Messages Table
Stores all chat messages for videos.

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_command BOOLEAN DEFAULT false,
  command_type TEXT, -- 'poll', 'quiz', 'react', 'rate'
  is_highlighted BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES chat_messages(id), -- for replies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_chat_messages_video_id ON chat_messages(video_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_is_command ON chat_messages(is_command) WHERE is_command = true;
```

### 5. Interactions Table
Records all user interactions (polls, quizzes, reactions, ratings).

```sql
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'poll', 'quiz', 'reaction', 'rating', 'share', 'bookmark'
  data JSONB NOT NULL, -- interaction-specific data
  timestamp_in_video INTEGER, -- seconds into video when interaction occurred
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_interactions_video_id ON interactions(video_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_type ON interactions(type);
CREATE INDEX idx_interactions_created_at ON interactions(created_at DESC);
```

### 6. Polls Table
Defines polls that can be triggered during videos.

```sql
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- [{id: uuid, text: string, votes: number}]
  trigger_time INTEGER, -- seconds into video
  duration INTEGER DEFAULT 30, -- seconds poll is active
  is_active BOOLEAN DEFAULT false,
  results_visible BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_polls_video_id ON polls(video_id);
CREATE INDEX idx_polls_trigger_time ON polls(trigger_time);
CREATE INDEX idx_polls_is_active ON polls(is_active);
```

### 7. Ads Table
Stores advertisement configurations.

```sql
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  advertiser TEXT,
  type TEXT NOT NULL, -- 'pre-roll', 'mid-roll', 'overlay', 'banner'
  media_url TEXT,
  click_url TEXT,
  duration INTEGER, -- for video ads
  target_criteria JSONB DEFAULT '{}', -- targeting rules
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

-- Indexes
CREATE INDEX idx_ads_type ON ads(type);
CREATE INDEX idx_ads_is_active ON ads(is_active);
CREATE INDEX idx_ads_date_range ON ads(start_date, end_date);
```

### 8. Ad Impressions Table
Tracks individual ad views and interactions.

```sql
CREATE TABLE ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  impression_type TEXT NOT NULL, -- 'view', 'click', 'skip', 'complete'
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_ad_impressions_ad_id ON ad_impressions(ad_id);
CREATE INDEX idx_ad_impressions_user_id ON ad_impressions(user_id);
CREATE INDEX idx_ad_impressions_created_at ON ad_impressions(created_at DESC);
```

### 9. Schedules Table
Manages video scheduling for channels.

```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- RRULE format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_schedules_channel_id ON schedules(channel_id);
CREATE INDEX idx_schedules_video_id ON schedules(video_id);
CREATE INDEX idx_schedules_time_range ON schedules(start_time, end_time);
```

### 10. Analytics Table
Aggregated analytics data for performance monitoring.

```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  time_bucket TEXT NOT NULL, -- '5min', 'hour', 'day'
  viewer_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  chat_messages INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 0,
  ad_impressions INTEGER DEFAULT 0,
  ad_revenue_cents INTEGER DEFAULT 0,
  average_watch_time INTEGER DEFAULT 0, -- seconds
  engagement_rate DECIMAL(5,2) DEFAULT 0.00 -- percentage
);

-- Indexes
CREATE INDEX idx_analytics_video_id ON analytics(video_id);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp DESC);
CREATE INDEX idx_analytics_time_bucket ON analytics(time_bucket);
```

### 11. Favorites Table
User's favorited videos and channels.

```sql
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

-- Indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_video_id ON favorites(video_id);
CREATE INDEX idx_favorites_channel_id ON favorites(channel_id);
```

### 12. Watch History Table
Tracks user viewing history.

```sql
CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  watch_time INTEGER DEFAULT 0, -- total seconds watched
  last_position INTEGER DEFAULT 0, -- last position in seconds
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_video_id ON watch_history(video_id);
CREATE INDEX idx_watch_history_updated_at ON watch_history(updated_at DESC);
```

## Database Functions

### 1. Update Timestamp Function
Automatically updates the updated_at timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 2. Apply Update Triggers
Apply the update trigger to relevant tables.

```sql
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watch_history_updated_at BEFORE UPDATE ON watch_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Increment View Count Function
Safely increments video view counts.

```sql
CREATE OR REPLACE FUNCTION increment_view_count(video_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE videos 
    SET view_count = view_count + 1 
    WHERE id = video_uuid;
END;
$$ LANGUAGE plpgsql;
```

### 4. Get Active Schedule Function
Returns the currently active video for a channel.

```sql
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

## Row Level Security (RLS) Policies

### Enable RLS on all tables
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
```

### User Policies
```sql
-- Users can view all users
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_id);
```

### Chat Message Policies
```sql
-- Anyone can read chat messages
CREATE POLICY "Anyone can read chat messages" ON chat_messages
    FOR SELECT USING (true);

-- Authenticated users can insert messages
CREATE POLICY "Authenticated users can send messages" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = chat_messages.user_id 
            AND users.clerk_id = auth.uid()::text
        )
    );

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages" ON chat_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = chat_messages.user_id 
            AND users.clerk_id = auth.uid()::text
        )
    );
```

### Video Policies
```sql
-- Anyone can view published videos
CREATE POLICY "Anyone can view published videos" ON videos
    FOR SELECT USING (published_at IS NOT NULL AND published_at <= NOW());

-- Admins can manage videos
CREATE POLICY "Admins can manage videos" ON videos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.clerk_id = auth.uid()::text 
            AND users.role = 'admin'
        )
    );
```

### Interaction Policies
```sql
-- Anyone can view interactions
CREATE POLICY "Anyone can view interactions" ON interactions
    FOR SELECT USING (true);

-- Authenticated users can create interactions
CREATE POLICY "Authenticated users can create interactions" ON interactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = interactions.user_id 
            AND users.clerk_id = auth.uid()::text
        )
    );
```

## Realtime Subscriptions

Enable realtime for specific tables:

```sql
-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE polls;
```

## Initial Data Seeding

### Create Default Channels
```sql
INSERT INTO channels (name, slug, description, color, category) VALUES
('Campus Life', 'campus-life', 'Student life, events, and campus culture', '#FF6B6B', 'lifestyle'),
('Explore', 'explore', 'Documentaries, science, and discovery', '#4ECDC4', 'education'),
('Create', 'create', 'Art, design, and creative tutorials', '#45B7D1', 'education'),
('Chill', 'chill', 'Relaxation, music, and ambient content', '#96CEB4', 'entertainment');
```

### Create Admin User
```sql
-- This should be done after Clerk webhook creates the user
UPDATE users 
SET role = 'admin' 
WHERE clerk_id = 'user_2y232PRIhXVR9omfFBhPQdG6DZU';
```

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried columns have indexes
2. **JSONB**: Used for flexible data storage with GIN indexes where needed
3. **Partitioning**: Consider partitioning large tables (analytics, chat_messages) by date
4. **Vacuum**: Set up regular VACUUM operations for high-write tables
5. **Connection Pooling**: Use Supabase's built-in connection pooler for high traffic

## Backup Strategy

1. **Automatic Backups**: Supabase provides daily backups
2. **Point-in-Time Recovery**: Available on Pro plan
3. **Export Scripts**: Create regular exports of critical data
4. **Test Restores**: Regularly test backup restoration process