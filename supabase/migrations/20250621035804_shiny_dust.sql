/*
  # Fix RLS Policies for Clerk Integration

  1. Updates
    - Fix RLS policies to work with Clerk JWT tokens
    - Use proper JWT claim extraction for Clerk user IDs
    - Add fallback policies for development/demo mode

  2. Security
    - Maintain security while fixing authentication issues
    - Ensure policies work with both Clerk and direct Supabase auth
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Create new policies that work with Clerk JWT
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = COALESCE(
      auth.jwt() ->> 'sub',           -- Standard JWT sub claim
      current_setting('request.jwt.claims', true)::json ->> 'sub',  -- Alternative JWT access
      auth.uid()::text                -- Fallback to Supabase auth
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = COALESCE(
      auth.jwt() ->> 'sub',
      current_setting('request.jwt.claims', true)::json ->> 'sub',
      auth.uid()::text
    )
  );

CREATE POLICY "Admins can manage all profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = COALESCE(
        auth.jwt() ->> 'sub',
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        auth.uid()::text
      )
      AND role IN ('admin', 'faculty')
    )
  );

-- Add a policy for inserting new profiles (needed for user registration)
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = COALESCE(
      auth.jwt() ->> 'sub',
      current_setting('request.jwt.claims', true)::json ->> 'sub',
      auth.uid()::text
    )
  );

-- Update other policies to use the same JWT claim extraction pattern
DROP POLICY IF EXISTS "Faculty can manage channels" ON channels;
CREATE POLICY "Faculty can manage channels"
  ON channels
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = COALESCE(
        auth.jwt() ->> 'sub',
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        auth.uid()::text
      )
      AND role IN ('admin', 'faculty')
    )
  );

DROP POLICY IF EXISTS "Faculty can manage content" ON content;
CREATE POLICY "Faculty can manage content"
  ON content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = COALESCE(
        auth.jwt() ->> 'sub',
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        auth.uid()::text
      )
      AND role IN ('admin', 'faculty')
    )
  );

DROP POLICY IF EXISTS "Faculty can manage schedules" ON channel_schedules;
CREATE POLICY "Faculty can manage schedules"
  ON channel_schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = COALESCE(
        auth.jwt() ->> 'sub',
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        auth.uid()::text
      )
      AND role IN ('admin', 'faculty')
    )
  );

DROP POLICY IF EXISTS "Faculty can manage interactions" ON interactions;
CREATE POLICY "Faculty can manage interactions"
  ON interactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = COALESCE(
        auth.jwt() ->> 'sub',
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        auth.uid()::text
      )
      AND role IN ('admin', 'faculty')
    )
  );

DROP POLICY IF EXISTS "Users can manage own responses" ON interaction_responses;
CREATE POLICY "Users can manage own responses"
  ON interaction_responses
  FOR ALL
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE user_id = COALESCE(
        auth.jwt() ->> 'sub',
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        auth.uid()::text
      )
    )
  );

DROP POLICY IF EXISTS "Faculty can read analytics" ON analytics;
CREATE POLICY "Faculty can read analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = COALESCE(
        auth.jwt() ->> 'sub',
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        auth.uid()::text
      )
      AND role IN ('admin', 'faculty')
    )
  );

-- Add some demo data for testing (only if tables are empty)
DO $$
BEGIN
  -- Insert a demo university if none exists
  IF NOT EXISTS (SELECT 1 FROM universities LIMIT 1) THEN
    INSERT INTO universities (name, domain, logo_url, primary_color, secondary_color)
    VALUES ('Demo University', 'demo.edu', '/logo.svg', '#6366f1', '#8b5cf6');
  END IF;
  
  -- Insert demo user profiles for the admin user IDs if they don't exist
  INSERT INTO user_profiles (user_id, email, full_name, role)
  VALUES 
    ('user_2y232PRIhXVR9omfFBhPQdG6DZU', 'admin1@demo.edu', 'Demo Admin 1', 'admin'),
    ('user_2ykxfPwP3yMZH0HbqadSs4FaDXT', 'admin2@demo.edu', 'Demo Admin 2', 'admin')
  ON CONFLICT (user_id) DO NOTHING;
END $$;