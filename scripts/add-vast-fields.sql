-- Optional VAST-specific fields for enhanced ad functionality
-- These are NOT required but could be useful for advanced ad campaigns

-- Add VAST-specific columns to content table (optional)
ALTER TABLE content ADD COLUMN IF NOT EXISTS vast_ad_system VARCHAR(100);
ALTER TABLE content ADD COLUMN IF NOT EXISTS vast_pricing_model VARCHAR(20); -- CPM, CPC, etc.
ALTER TABLE content ADD COLUMN IF NOT EXISTS vast_pricing_value DECIMAL(10,2);
ALTER TABLE content ADD COLUMN IF NOT EXISTS vast_click_through_url TEXT;
ALTER TABLE content ADD COLUMN IF NOT EXISTS vast_survey_url TEXT;
ALTER TABLE content ADD COLUMN IF NOT EXISTS vast_creative_type VARCHAR(50); -- Linear, NonLinear, Companion
ALTER TABLE content ADD COLUMN IF NOT EXISTS vast_skip_offset INTEGER; -- seconds before skip available
ALTER TABLE content ADD COLUMN IF NOT EXISTS vast_min_duration INTEGER; -- minimum play time
ALTER TABLE content ADD COLUMN IF NOT EXISTS vast_target_keywords TEXT[]; -- targeting keywords
ALTER TABLE content ADD COLUMN IF NOT EXISTS vast_advertiser_name VARCHAR(100);
ALTER TABLE content ADD COLUMN IF NOT EXISTS vast_campaign_id VARCHAR(100);

-- Add comments
COMMENT ON COLUMN content.vast_ad_system IS 'Name of the ad system serving the ad';
COMMENT ON COLUMN content.vast_pricing_model IS 'Pricing model: CPM, CPC, CPV, etc.';
COMMENT ON COLUMN content.vast_pricing_value IS 'Price value for the pricing model';
COMMENT ON COLUMN content.vast_click_through_url IS 'URL to redirect when ad is clicked';
COMMENT ON COLUMN content.vast_survey_url IS 'URL for post-ad survey';
COMMENT ON COLUMN content.vast_creative_type IS 'Type of VAST creative';
COMMENT ON COLUMN content.vast_skip_offset IS 'Seconds before skip button appears';
COMMENT ON COLUMN content.vast_min_duration IS 'Minimum required viewing time';
COMMENT ON COLUMN content.vast_target_keywords IS 'Keywords for ad targeting';
COMMENT ON COLUMN content.vast_advertiser_name IS 'Name of the advertiser';
COMMENT ON COLUMN content.vast_campaign_id IS 'Campaign identifier for tracking';

-- Example: Update existing ads with VAST metadata
-- UPDATE content 
-- SET 
--   vast_ad_system = 'Tempest Streaming Platform',
--   vast_pricing_model = 'CPM',
--   vast_pricing_value = 2.50,
--   vast_skip_offset = 5,
--   vast_min_duration = 10,
--   vast_advertiser_name = 'HungryHawk',
--   vast_campaign_id = 'spring-2024'
-- WHERE content_type = 'advertisement' AND title LIKE '%HUNGRYHAWK%';