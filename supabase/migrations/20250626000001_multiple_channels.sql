/*
  # Multiple Channel Support for Content

  1. New Junction Table
    - `content_channels` - Many-to-many relationship between content and channels
    - Allows videos to be attributed to multiple channels

  2. Features
    - Backward compatibility with existing single channel_id
    - Support for multiple channel associations
    - Proper indexing for performance

  3. Security
    - Add RLS policies for content_channels table
    - Maintain existing access controls
*/

-- Create junction table for content-channel relationships
CREATE TABLE IF NOT EXISTS content_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content(id) ON DELETE CASCADE,
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_id, channel_id)
);

ALTER TABLE content_channels ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for content_channels
CREATE POLICY "Faculty can manage content channels"
  ON content_channels
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'faculty')
    )
  );

CREATE POLICY "Students can read content channels"
  ON content_channels
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM content c
      WHERE c.id = content_id
      AND c.is_published = true
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_channels_content_id ON content_channels(content_id);
CREATE INDEX IF NOT EXISTS idx_content_channels_channel_id ON content_channels(channel_id);

-- Function to sync existing channel_id to content_channels
CREATE OR REPLACE FUNCTION sync_content_channels()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert existing channel relationships into junction table
  INSERT INTO content_channels (content_id, channel_id)
  SELECT id, channel_id
  FROM content
  WHERE channel_id IS NOT NULL
  ON CONFLICT (content_id, channel_id) DO NOTHING;
END;
$$;

-- Run the sync function to migrate existing data
SELECT sync_content_channels();

-- Add comment for documentation
COMMENT ON TABLE content_channels IS 'Many-to-many relationship between content and channels';
COMMENT ON COLUMN content_channels.content_id IS 'Reference to content item';
COMMENT ON COLUMN content_channels.channel_id IS 'Reference to channel';