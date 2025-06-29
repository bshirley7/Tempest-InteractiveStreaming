-- Create campus_updates table for announcements and communications
CREATE TABLE IF NOT EXISTS campus_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('news', 'event', 'alert', 'announcement', 'academic')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  location text,
  date date,
  time time,
  link text,
  background_image text NOT NULL DEFAULT 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800',
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  show_on_videos boolean DEFAULT false, -- New field for video overlay announcements
  target_content_ids uuid[], -- Array of specific content IDs to show on
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE campus_updates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Faculty can manage campus updates"
  ON campus_updates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'faculty')
    )
  );

CREATE POLICY "All can read active campus updates"
  ON campus_updates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campus_updates_active ON campus_updates(is_active);
CREATE INDEX IF NOT EXISTS idx_campus_updates_category ON campus_updates(category);
CREATE INDEX IF NOT EXISTS idx_campus_updates_priority ON campus_updates(priority);
CREATE INDEX IF NOT EXISTS idx_campus_updates_expires_at ON campus_updates(expires_at);
CREATE INDEX IF NOT EXISTS idx_campus_updates_show_on_videos ON campus_updates(show_on_videos);

-- Create trigger for updated_at
CREATE TRIGGER update_campus_updates_updated_at 
  BEFORE UPDATE ON campus_updates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();