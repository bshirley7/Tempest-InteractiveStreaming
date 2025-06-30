-- Add missing columns to interaction_responses table
-- Run this in your Supabase SQL Editor

-- Add is_correct column if it doesn't exist
ALTER TABLE interaction_responses 
ADD COLUMN IF NOT EXISTS is_correct boolean;

-- Add response_data column if it doesn't exist
ALTER TABLE interaction_responses 
ADD COLUMN IF NOT EXISTS response_data jsonb DEFAULT '{}';

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'interaction_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;