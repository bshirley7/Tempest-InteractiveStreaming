-- Add missing columns to interactions table
-- Run this in your Supabase SQL Editor

-- Add results column to store aggregated statistics
ALTER TABLE interactions 
ADD COLUMN IF NOT EXISTS results jsonb DEFAULT '{}';

-- Check the current structure of interactions table
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'interactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;