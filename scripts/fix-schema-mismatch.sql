-- Check the actual table structure and fix any mismatches
-- Run this in your Supabase SQL Editor

-- Show current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'interaction_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing response_data column if it doesn't exist
ALTER TABLE interaction_responses 
ADD COLUMN IF NOT EXISTS response_data jsonb DEFAULT '{}';

-- Remove response_time column if it exists (not used in our API)
-- ALTER TABLE interaction_responses DROP COLUMN IF EXISTS response_time;

-- Show updated table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'interaction_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;