-- Simple fix: just add the missing column
-- Run this in your Supabase SQL Editor

-- Check current columns first
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interaction_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add the missing column
ALTER TABLE interaction_responses ADD COLUMN is_correct boolean;

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interaction_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;