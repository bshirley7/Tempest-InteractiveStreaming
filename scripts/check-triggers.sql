-- Check for any triggers or functions that might be causing the issue
-- Run this in your Supabase SQL Editor

-- Check for triggers on interaction_responses table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'interaction_responses';

-- Check if the update_interaction_results function exists and what it does
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'update_interaction_results';

-- Drop the problematic trigger if it exists
DROP TRIGGER IF EXISTS update_interaction_results_trigger ON interaction_responses;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS update_interaction_results();