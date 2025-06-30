-- Add missing question column to interactions table
-- Run this in your Supabase SQL Editor

-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'interactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add the question column if it doesn't exist
ALTER TABLE interactions 
ADD COLUMN IF NOT EXISTS question text;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'interactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;