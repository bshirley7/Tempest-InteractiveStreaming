/*
  # Tempest Admin Panel Database Schema

  1. New Tables
    - `universities` - Institution information and branding
    - `channels` - Streaming channels and metadata
    - `content` - Content library linked to Cloudflare Stream
    - `interactions` - Polls, quizzes, and user responses
    - `analytics` - Aggregated metrics and engagement data
    - `user_profiles` - Extended user information
    - `channel_schedules` - Programming schedule for channels
    - `interaction_responses` - User responses to polls/quizzes

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access (admin, faculty, student)
    - Secure admin operations with proper authentication

  3. Features
    - Real-time subscriptions for live interactions
    - Content management with Cloudflare Stream integration
    - Analytics tracking and reporting
    - University-specific branding and configuration
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Universities table for multi-tenant support
CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#6366f1',
  secondary_color text DEFAULT '#8b5cf6',
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

-- User profiles with extended information
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL, -- Clerk user ID
  university_id uuid REFERENCES universities(id),
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin', 'moderator')),
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Channels for streaming content
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES universities(id),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  thumbnail_url text,
  is_live boolean DEFAULT false,
  stream_key text,
  cloudflare_stream_id text,
  settings jsonb DEFAULT '{}',
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Content library linked to Cloudflare Stream
CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES universities(id),
  channel_id uuid REFERENCES channels(id),
  title text NOT NULL,
  description text,
  cloudflare_video_id text UNIQUE NOT NULL,
  thumbnail_url text,
  duration integer, -- in seconds
  category text,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Channel schedules for programming
CREATE TABLE IF NOT EXISTS channel_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id),
  content_id uuid REFERENCES content(id),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_live boolean DEFAULT false,
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE channel_schedules ENABLE ROW LEVEL SECURITY;

-- Interactions (polls, quizzes, etc.)
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id),
  content_id uuid REFERENCES content(id),
  type text NOT NULL CHECK (type IN ('poll', 'quiz', 'rating', 'reaction')),
  title text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL, -- Array of options with metadata
  correct_answer text, -- For quizzes
  time_limit integer, -- in seconds
  is_active boolean DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- User responses to interactions
CREATE TABLE IF NOT EXISTS interaction_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id uuid REFERENCES interactions(id),
  user_id uuid REFERENCES user_profiles(id),
  response text NOT NULL,
  is_correct boolean, -- For quizzes
  response_time integer, -- Time taken to respond in seconds
  created_at timestamptz DEFAULT now(),
  UNIQUE(interaction_id, user_id)
);

ALTER TABLE interaction_responses ENABLE ROW LEVEL SECURITY;

-- Analytics for tracking engagement
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES universities(id),
  channel_id uuid REFERENCES channels(id),
  content_id uuid REFERENCES content(id),
  interaction_id uuid REFERENCES interactions(id),
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  dimensions jsonb DEFAULT '{}',
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Universities: Only admins can manage
CREATE POLICY "Admins can manage universities"
  ON universities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND role = 'admin'
    )
  );

-- User profiles: Users can read their own, admins can manage all
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Admins can manage all profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'faculty')
    )
  );

-- Channels: Faculty and admins can manage, students can read
CREATE POLICY "Faculty can manage channels"
  ON channels
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'faculty')
    )
  );

CREATE POLICY "Students can read channels"
  ON channels
  FOR SELECT
  TO authenticated
  USING (true);

-- Content: Faculty and admins can manage, students can read published
CREATE POLICY "Faculty can manage content"
  ON content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'faculty')
    )
  );

CREATE POLICY "Students can read published content"
  ON content
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Channel schedules: Faculty can manage, all can read
CREATE POLICY "Faculty can manage schedules"
  ON channel_schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'faculty')
    )
  );

CREATE POLICY "All can read schedules"
  ON channel_schedules
  FOR SELECT
  TO authenticated
  USING (true);

-- Interactions: Faculty can manage, all can read active
CREATE POLICY "Faculty can manage interactions"
  ON interactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'faculty')
    )
  );

CREATE POLICY "All can read active interactions"
  ON interactions
  FOR SELECT
  TO authenticated
  USING (is_active = true OR created_by IN (
    SELECT id FROM user_profiles WHERE user_id = auth.jwt() ->> 'sub'
  ));

-- Interaction responses: Users can manage their own
CREATE POLICY "Users can manage own responses"
  ON interaction_responses
  FOR ALL
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

-- Analytics: Faculty and admins can read
CREATE POLICY "Faculty can read analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'faculty')
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_university_id ON user_profiles(university_id);
CREATE INDEX IF NOT EXISTS idx_channels_university_id ON channels(university_id);
CREATE INDEX IF NOT EXISTS idx_content_channel_id ON content(channel_id);
CREATE INDEX IF NOT EXISTS idx_content_cloudflare_id ON content(cloudflare_video_id);
CREATE INDEX IF NOT EXISTS idx_interactions_channel_id ON interactions(channel_id);
CREATE INDEX IF NOT EXISTS idx_interactions_active ON interactions(is_active);
CREATE INDEX IF NOT EXISTS idx_analytics_recorded_at ON analytics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_channel_schedules_time ON channel_schedules(start_time, end_time);

-- Functions for real-time features
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interactions_updated_at BEFORE UPDATE ON interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();