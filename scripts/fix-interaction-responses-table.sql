-- Check if the is_correct column exists and add it if missing

-- First, let's check the current table structure
-- Run this query to see what columns exist:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interaction_responses' 
AND table_schema = 'public';

-- If is_correct column is missing, add it:
ALTER TABLE interaction_responses 
ADD COLUMN IF NOT EXISTS is_correct boolean;

-- Also ensure response_data column exists with correct type
ALTER TABLE interaction_responses 
ADD COLUMN IF NOT EXISTS response_data jsonb DEFAULT '{}';

-- Verify the table structure is correct
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'interaction_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;