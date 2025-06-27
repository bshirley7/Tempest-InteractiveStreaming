/*
  # Advertising System - Minimal Test Migration
  
  This is a diagnostic migration to test table creation without RLS policies
  to isolate the column reference issue.
*/

-- Test 1: Check if user_profiles table exists and what columns it has
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE 'user_profiles table EXISTS';
        
        -- Check if user_id column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_profiles' AND column_name = 'user_id') THEN
            RAISE NOTICE 'user_id column EXISTS in user_profiles';
        ELSE
            RAISE NOTICE 'user_id column DOES NOT EXIST in user_profiles';
        END IF;
        
    ELSE
        RAISE NOTICE 'user_profiles table DOES NOT EXIST';
    END IF;
END $$;

-- Test 2: Create just the ad_videos table without any policies
DROP TABLE IF EXISTS test_ad_videos CASCADE;
CREATE TABLE test_ad_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cloudflare_video_id text UNIQUE NOT NULL,
  duration integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_ad_videos ENABLE ROW LEVEL SECURITY;

-- Test 3: Try to create a simple policy that references user_profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        -- Try the exact same pattern that's failing
        BEGIN
            EXECUTE 'CREATE POLICY "Test policy" ON test_ad_videos FOR ALL TO authenticated USING (
                EXISTS (
                  SELECT 1 FROM user_profiles 
                  WHERE user_profiles.user_id = COALESCE(
                    auth.jwt() ->> ''sub'',
                    auth.uid()::text
                  )
                  AND user_profiles.role IN (''admin'', ''faculty'')
                )
              )';
            RAISE NOTICE 'Policy creation SUCCEEDED with explicit table prefix';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Policy creation FAILED: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Skipping policy test - user_profiles does not exist';
    END IF;
END $$;

-- Cleanup
DROP TABLE IF EXISTS test_ad_videos CASCADE;