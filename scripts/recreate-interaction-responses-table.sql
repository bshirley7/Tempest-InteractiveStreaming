-- Drop and recreate interaction_responses table with correct schema
-- Run this in your Supabase SQL Editor

-- First, drop the existing table
DROP TABLE IF EXISTS interaction_responses CASCADE;

-- Recreate the table with the correct schema
CREATE TABLE interaction_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id uuid NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  response text NOT NULL,
  response_data jsonb DEFAULT '{}',
  is_correct boolean,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure one response per user per interaction
  UNIQUE(interaction_id, user_id)
);

-- Enable RLS
ALTER TABLE interaction_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own responses"
  ON interaction_responses
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own responses"
  ON interaction_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Faculty and admins can view all responses
CREATE POLICY "Faculty can view all responses"
  ON interaction_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'faculty')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interaction_responses_interaction_id ON interaction_responses(interaction_id);
CREATE INDEX IF NOT EXISTS idx_interaction_responses_user_id ON interaction_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_interaction_responses_created_at ON interaction_responses(created_at);

-- Create trigger for auto-updating interaction results
CREATE OR REPLACE FUNCTION update_interaction_results()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the interaction's results field with aggregated data
  UPDATE interactions
  SET results = (
    SELECT jsonb_build_object(
      'total_responses', COUNT(*),
      'response_counts', jsonb_object_agg(response, count),
      'accuracy_rate', 
        CASE 
          WHEN interactions.type = 'quiz' AND interactions.correct_answer IS NOT NULL 
          THEN (COUNT(*) FILTER (WHERE is_correct = true)::float / COUNT(*)::float) * 100
          ELSE NULL
        END
    )
    FROM (
      SELECT response, COUNT(*) as count
      FROM interaction_responses
      WHERE interaction_id = NEW.interaction_id
      GROUP BY response
    ) as grouped
  ),
  updated_at = now()
  WHERE id = NEW.interaction_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_interaction_results_trigger
AFTER INSERT OR UPDATE OR DELETE ON interaction_responses
FOR EACH ROW
EXECUTE FUNCTION update_interaction_results();

-- Also add results column to interactions table if it doesn't exist
ALTER TABLE interactions 
ADD COLUMN IF NOT EXISTS results jsonb DEFAULT '{}';