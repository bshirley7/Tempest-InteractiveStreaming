-- Create interactions table for polls, quizzes, ratings, and reactions
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id),
  content_id uuid REFERENCES content(id),
  type text NOT NULL CHECK (type IN ('poll', 'quiz', 'rating', 'reaction')),
  title text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_answer text,
  time_limit integer,
  is_active boolean DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interactions_content_id ON interactions(content_id);
CREATE INDEX IF NOT EXISTS idx_interactions_channel_id ON interactions(channel_id);
CREATE INDEX IF NOT EXISTS idx_interactions_active ON interactions(is_active);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);

-- Create trigger for updated_at
CREATE TRIGGER update_interactions_updated_at 
  BEFORE UPDATE ON interactions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();