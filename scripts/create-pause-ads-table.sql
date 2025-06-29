-- Create simple pause_ads table for pause screen advertisements
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pause_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  cta_text text NOT NULL DEFAULT 'Learn More',
  cta_link text NOT NULL,
  image_url text NOT NULL, -- Cloudflare R2 URL
  company_logo_url text, -- Optional company logo URL
  is_active boolean DEFAULT false, -- Start disabled for testing
  priority integer DEFAULT 1, -- Higher numbers = higher priority
  click_count integer DEFAULT 0,
  impression_count integer DEFAULT 0,
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pause_ads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage pause ads"
  ON pause_ads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'faculty')
    )
  );

CREATE POLICY "All can view active pause ads"
  ON pause_ads
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pause_ads_active ON pause_ads(is_active);
CREATE INDEX IF NOT EXISTS idx_pause_ads_priority ON pause_ads(priority DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_pause_ads_updated_at 
  BEFORE UPDATE ON pause_ads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create functions for incrementing analytics counters
CREATE OR REPLACE FUNCTION increment_impression(ad_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE pause_ads 
  SET impression_count = impression_count + 1,
      updated_at = now()
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_click(ad_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE pause_ads 
  SET click_count = click_count + 1,
      updated_at = now()
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;