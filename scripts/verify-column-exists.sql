-- Verify the exact table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'interaction_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if there are any case sensitivity issues
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'interaction_responses' 
AND table_schema = 'public'
AND column_name ILIKE '%correct%';