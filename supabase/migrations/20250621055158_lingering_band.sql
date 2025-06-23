/*
  # Campus Updates Table for Tempest Platform

  1. New Table
    - `campus_updates` - Store campus announcements, news, and updates
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `content` (text, required)
      - `category` (enum: news, event, alert, announcement, academic)
      - `priority` (enum: low, medium, high, urgent)
      - `location` (text, optional)
      - `date` (date, optional)
      - `time` (time, optional)
      - `link` (text, optional)
      - `background_image` (text, required)
      - `is_active` (boolean, default true)
      - `expires_at` (timestamptz, optional)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on campus_updates table
    - Add policies for faculty/admin management
    - Allow public read access for active updates

  3. Indexes
    - Index on is_active for filtering
    - Index on category for grouping
    - Index on priority for sorting
    - Index on expires_at for cleanup
*/

-- Create enum types for campus updates
CREATE TYPE campus_update_category AS ENUM ('news', 'event', 'alert', 'announcement', 'academic');
CREATE TYPE campus_update_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create campus_updates table
CREATE TABLE IF NOT EXISTS campus_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category campus_update_category NOT NULL DEFAULT 'announcement',
  priority campus_update_priority NOT NULL DEFAULT 'medium',
  location text,
  date date,
  time time,
  link text,
  background_image text NOT NULL,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE campus_updates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read active updates"
  ON campus_updates
  FOR SELECT
  TO public
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Faculty can manage updates"
  ON campus_updates
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campus_updates_active ON campus_updates(is_active);
CREATE INDEX IF NOT EXISTS idx_campus_updates_category ON campus_updates(category);
CREATE INDEX IF NOT EXISTS idx_campus_updates_priority ON campus_updates(priority);
CREATE INDEX IF NOT EXISTS idx_campus_updates_expires ON campus_updates(expires_at);
CREATE INDEX IF NOT EXISTS idx_campus_updates_created ON campus_updates(created_at);

-- Add updated_at trigger
CREATE TRIGGER update_campus_updates_updated_at 
  BEFORE UPDATE ON campus_updates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for demo
INSERT INTO campus_updates (title, content, category, priority, location, date, time, link, background_image) VALUES
(
  'Library Extended Hours During Finals',
  'The main library will be open 24/7 starting December 15th through December 22nd to support students during finals week. Additional study spaces and computer labs will also be available.',
  'announcement',
  'medium',
  'Main Library',
  '2024-12-15',
  '00:00',
  'https://library.university.edu/hours',
  'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Campus Safety Alert: Construction Zone',
  'Please use alternate routes around the Science Building due to ongoing construction. The main entrance will be closed until further notice.',
  'alert',
  'high',
  'Science Building',
  '2024-01-27',
  '08:00',
  null,
  'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Spring Registration Opens',
  'Spring semester registration is now open for all students. Priority registration for seniors begins today, followed by juniors tomorrow.',
  'academic',
  'medium',
  'Online Portal',
  '2024-11-01',
  '09:00',
  'https://registration.university.edu',
  'https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Career Fair Next Week',
  'Join us for the annual Career Fair featuring over 100 employers from various industries. Bring your resume and dress professionally!',
  'event',
  'medium',
  'Student Center Ballroom',
  '2024-02-05',
  '10:00',
  'https://careers.university.edu/fair',
  'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=800'
);

-- Add comment for documentation
COMMENT ON TABLE campus_updates IS 'Campus announcements, news, and updates for the Tempest platform';