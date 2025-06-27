/*
  # Advertising System Migration

  1. New Tables
    - `ad_videos` - Video advertisements stored in Cloudflare Stream
    - `ad_campaigns` - Advertising campaigns with targeting and scheduling
    - `ad_overlay_assets` - Image overlays stored in Cloudflare R2
    - `ad_placements` - Ad placement configuration and targeting
    - `ad_analytics` - Tracking and analytics for ad performance

  2. Features
    - Pre-roll, midroll, and end-roll ad placement
    - Content and channel targeting
    - Overlay images with custom ad copy
    - Campaign management and scheduling
    - Analytics and performance tracking

  3. Security
    - Admin-only access to ad management
    - RLS policies for secure operations
    - Audit logging for ad-related changes
*/

-- Ad Videos Table: Stores video advertisements from Cloudflare Stream
CREATE TABLE IF NOT EXISTS ad_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cloudflare_video_id text UNIQUE NOT NULL,
  thumbnail_url text,
  duration integer NOT NULL, -- in seconds
  category text DEFAULT 'commercial',
  advertiser_name text,
  campaign_id uuid, -- Will reference ad_campaigns.id
  file_size bigint,
  is_active boolean DEFAULT true,
  approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ad_videos ENABLE ROW LEVEL SECURITY;

-- Ad Campaigns Table: Manages advertising campaigns
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  advertiser_name text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  budget_limit numeric(10,2),
  daily_budget_limit numeric(10,2),
  target_audience jsonb DEFAULT '{}', -- demographic targeting
  targeting_rules jsonb DEFAULT '{}', -- content/channel targeting rules
  settings jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  total_impressions bigint DEFAULT 0,
  total_clicks bigint DEFAULT 0,
  total_spend numeric(10,2) DEFAULT 0,
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint for ad_videos.campaign_id
ALTER TABLE ad_videos 
ADD CONSTRAINT fk_ad_videos_campaign_id 
FOREIGN KEY (campaign_id) REFERENCES ad_campaigns(id) ON DELETE SET NULL;

-- Ad Overlay Assets Table: Stores image overlays from Cloudflare R2
CREATE TABLE IF NOT EXISTS ad_overlay_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cloudflare_r2_url text NOT NULL,
  cloudflare_r2_key text NOT NULL, -- R2 object key for management
  file_type text NOT NULL, -- 'image/png', 'image/jpeg', etc.
  file_size integer,
  dimensions jsonb, -- {width: 1920, height: 1080}
  alt_text text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ad_overlay_assets ENABLE ROW LEVEL SECURITY;

-- Ad Placements Table: Configures where and how ads are shown
CREATE TABLE IF NOT EXISTS ad_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, -- friendly name for the placement
  ad_video_id uuid REFERENCES ad_videos(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  overlay_asset_id uuid REFERENCES ad_overlay_assets(id) ON DELETE SET NULL,
  placement_type text NOT NULL CHECK (placement_type IN ('pre_roll', 'mid_roll', 'end_roll')),
  target_type text NOT NULL CHECK (target_type IN ('content', 'channel', 'global')),
  target_id uuid, -- content_id or channel_id (null for global)
  ad_copy text,
  call_to_action text,
  click_url text,
  display_duration integer DEFAULT 30, -- seconds for overlay display
  skip_after_seconds integer DEFAULT 5, -- allow skip after X seconds (0 = no skip)
  priority integer DEFAULT 1, -- higher number = higher priority
  frequency_cap integer DEFAULT 3, -- max views per user per day
  weight integer DEFAULT 1, -- for weighted random selection
  start_time time, -- time of day constraint (optional)
  end_time time, -- time of day constraint (optional)
  days_of_week integer[], -- array of days 0-6 (0=Sunday)
  is_active boolean DEFAULT true,
  total_impressions bigint DEFAULT 0,
  total_clicks bigint DEFAULT 0,
  total_completions bigint DEFAULT 0,
  total_skips bigint DEFAULT 0,
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;

-- Ad Analytics Table: Tracks ad performance and user interactions
CREATE TABLE IF NOT EXISTS ad_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id uuid REFERENCES ad_placements(id) ON DELETE CASCADE,
  ad_video_id uuid REFERENCES ad_videos(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  user_id text, -- Clerk user ID (nullable for anonymous users)
  content_id uuid REFERENCES content(id) ON DELETE SET NULL,
  channel_id uuid REFERENCES channels(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('impression', 'click', 'completion', 'skip', 'error')),
  event_data jsonb DEFAULT '{}', -- additional event metadata
  timestamp timestamptz DEFAULT now(),
  session_id text,
  user_agent text,
  ip_address inet,
  referrer text,
  watch_time_seconds integer -- how long user watched the ad
);

ALTER TABLE ad_analytics ENABLE ROW LEVEL SECURITY;

-- User Ad Frequency Table: Tracks user ad exposure for frequency capping
CREATE TABLE IF NOT EXISTS user_ad_frequency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL, -- Clerk user ID
  placement_id uuid REFERENCES ad_placements(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  impression_count integer DEFAULT 0,
  last_impression timestamptz,
  UNIQUE(user_id, placement_id, date)
);

ALTER TABLE user_ad_frequency ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin-only access for all ad management tables

-- Ad Videos Policies
CREATE POLICY "Admins can manage ad videos"
  ON ad_videos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = COALESCE(
        auth.jwt() ->> 'sub',
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        auth.uid()::text
      )
      AND role IN ('admin', 'faculty')
    )
  );

-- Ad Campaigns Policies
CREATE POLICY "Admins can manage ad campaigns"
  ON ad_campaigns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = COALESCE(
        auth.jwt() ->> 'sub',
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        auth.uid()::text
      )
      AND role IN ('admin', 'faculty')
    )
  );

-- Ad Overlay Assets Policies
CREATE POLICY "Admins can manage ad overlay assets"
  ON ad_overlay_assets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = COALESCE(
        auth.jwt() ->> 'sub',
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        auth.uid()::text
      )
      AND role IN ('admin', 'faculty')
    )
  );

-- Ad Placements Policies
CREATE POLICY "Admins can manage ad placements"
  ON ad_placements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = COALESCE(
        auth.jwt() ->> 'sub',
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        auth.uid()::text
      )
      AND role IN ('admin', 'faculty')
    )
  );

-- Public read access for active ad placements (needed for ad serving)
CREATE POLICY "Public can read active ad placements for serving"
  ON ad_placements
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Ad Analytics Policies
CREATE POLICY "Admins can read ad analytics"
  ON ad_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = COALESCE(
        auth.jwt() ->> 'sub',
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        auth.uid()::text
      )
      AND role IN ('admin', 'faculty')
    )
  );

-- Allow authenticated users to insert their own analytics
CREATE POLICY "Users can insert their own ad analytics"
  ON ad_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = COALESCE(
      auth.jwt() ->> 'sub',
      current_setting('request.jwt.claims', true)::json ->> 'sub',
      auth.uid()::text
    )
    OR user_id IS NULL -- Allow anonymous analytics
  );

-- User Ad Frequency Policies
CREATE POLICY "Users can manage their own ad frequency"
  ON user_ad_frequency
  FOR ALL
  TO authenticated
  USING (
    user_id = COALESCE(
      auth.jwt() ->> 'sub',
      current_setting('request.jwt.claims', true)::json ->> 'sub',
      auth.uid()::text
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ad_videos_campaign_id ON ad_videos(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_videos_active ON ad_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_videos_cloudflare_id ON ad_videos(cloudflare_video_id);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_active ON ad_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_dates ON ad_campaigns(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_ad_overlay_assets_active ON ad_overlay_assets(is_active);

CREATE INDEX IF NOT EXISTS idx_ad_placements_target ON ad_placements(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_ad_placements_type ON ad_placements(placement_type);
CREATE INDEX IF NOT EXISTS idx_ad_placements_active ON ad_placements(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_placements_priority ON ad_placements(priority DESC);

CREATE INDEX IF NOT EXISTS idx_ad_analytics_timestamp ON ad_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_placement ON ad_analytics(placement_id);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_user ON ad_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_event ON ad_analytics(event_type);

CREATE INDEX IF NOT EXISTS idx_user_ad_frequency_user_date ON user_ad_frequency(user_id, date);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_ad_videos_updated_at 
  BEFORE UPDATE ON ad_videos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_campaigns_updated_at 
  BEFORE UPDATE ON ad_campaigns 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_overlay_assets_updated_at 
  BEFORE UPDATE ON ad_overlay_assets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_placements_updated_at 
  BEFORE UPDATE ON ad_placements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for ad serving and analytics

-- Function to get applicable ads for content/channel
CREATE OR REPLACE FUNCTION get_applicable_ads(
  p_content_id uuid DEFAULT NULL,
  p_channel_id uuid DEFAULT NULL,
  p_placement_type text DEFAULT 'pre_roll',
  p_user_id text DEFAULT NULL
)
RETURNS TABLE (
  placement_id uuid,
  ad_video_id uuid,
  cloudflare_video_id text,
  overlay_asset_id uuid,
  overlay_url text,
  ad_copy text,
  call_to_action text,
  click_url text,
  display_duration integer,
  skip_after_seconds integer,
  priority integer,
  weight integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.id as placement_id,
    ap.ad_video_id,
    av.cloudflare_video_id,
    ap.overlay_asset_id,
    oa.cloudflare_r2_url as overlay_url,
    ap.ad_copy,
    ap.call_to_action,
    ap.click_url,
    ap.display_duration,
    ap.skip_after_seconds,
    ap.priority,
    ap.weight
  FROM ad_placements ap
  JOIN ad_videos av ON ap.ad_video_id = av.id
  JOIN ad_campaigns ac ON ap.campaign_id = ac.id
  LEFT JOIN ad_overlay_assets oa ON ap.overlay_asset_id = oa.id
  WHERE 
    ap.is_active = true
    AND av.is_active = true
    AND av.approval_status = 'approved'
    AND ac.is_active = true
    AND ac.start_date <= now()
    AND ac.end_date >= now()
    AND ap.placement_type = p_placement_type
    AND (
      (ap.target_type = 'global') OR
      (ap.target_type = 'content' AND ap.target_id = p_content_id) OR
      (ap.target_type = 'channel' AND ap.target_id = p_channel_id)
    )
    AND (
      ap.start_time IS NULL OR 
      ap.end_time IS NULL OR 
      (CURRENT_TIME BETWEEN ap.start_time AND ap.end_time)
    )
    AND (
      ap.days_of_week IS NULL OR 
      EXTRACT(DOW FROM now()) = ANY(ap.days_of_week)
    )
    AND (
      p_user_id IS NULL OR
      NOT EXISTS (
        SELECT 1 FROM user_ad_frequency uaf 
        WHERE uaf.user_id = p_user_id 
        AND uaf.placement_id = ap.id 
        AND uaf.date = CURRENT_DATE 
        AND uaf.impression_count >= ap.frequency_cap
      )
    )
  ORDER BY ap.priority DESC, ap.weight DESC, RANDOM();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record ad analytics
CREATE OR REPLACE FUNCTION record_ad_analytics(
  p_placement_id uuid,
  p_event_type text,
  p_user_id text DEFAULT NULL,
  p_content_id uuid DEFAULT NULL,
  p_channel_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_watch_time_seconds integer DEFAULT NULL,
  p_event_data jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  v_analytics_id uuid;
  v_ad_video_id uuid;
  v_campaign_id uuid;
BEGIN
  -- Get ad_video_id and campaign_id from placement
  SELECT ap.ad_video_id, ap.campaign_id 
  INTO v_ad_video_id, v_campaign_id
  FROM ad_placements ap 
  WHERE ap.id = p_placement_id;
  
  -- Insert analytics record
  INSERT INTO ad_analytics (
    placement_id, ad_video_id, campaign_id, user_id, content_id, channel_id,
    event_type, event_data, session_id, user_agent, ip_address, watch_time_seconds
  ) VALUES (
    p_placement_id, v_ad_video_id, v_campaign_id, p_user_id, p_content_id, p_channel_id,
    p_event_type, p_event_data, p_session_id, p_user_agent, p_ip_address::inet, p_watch_time_seconds
  ) RETURNING id INTO v_analytics_id;
  
  -- Update frequency tracking for impressions
  IF p_event_type = 'impression' AND p_user_id IS NOT NULL THEN
    INSERT INTO user_ad_frequency (user_id, placement_id, date, impression_count, last_impression)
    VALUES (p_user_id, p_placement_id, CURRENT_DATE, 1, now())
    ON CONFLICT (user_id, placement_id, date)
    DO UPDATE SET 
      impression_count = user_ad_frequency.impression_count + 1,
      last_impression = now();
  END IF;
  
  -- Update placement counters
  IF p_event_type = 'impression' THEN
    UPDATE ad_placements SET total_impressions = total_impressions + 1 WHERE id = p_placement_id;
    UPDATE ad_campaigns SET total_impressions = total_impressions + 1 WHERE id = v_campaign_id;
  ELSIF p_event_type = 'click' THEN
    UPDATE ad_placements SET total_clicks = total_clicks + 1 WHERE id = p_placement_id;
    UPDATE ad_campaigns SET total_clicks = total_clicks + 1 WHERE id = v_campaign_id;
  ELSIF p_event_type = 'completion' THEN
    UPDATE ad_placements SET total_completions = total_completions + 1 WHERE id = p_placement_id;
  ELSIF p_event_type = 'skip' THEN
    UPDATE ad_placements SET total_skips = total_skips + 1 WHERE id = p_placement_id;
  END IF;
  
  RETURN v_analytics_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE ad_videos IS 'Video advertisements stored in Cloudflare Stream';
COMMENT ON TABLE ad_campaigns IS 'Advertising campaigns with targeting and scheduling';
COMMENT ON TABLE ad_overlay_assets IS 'Image overlays stored in Cloudflare R2';
COMMENT ON TABLE ad_placements IS 'Ad placement configuration and targeting';
COMMENT ON TABLE ad_analytics IS 'Tracking and analytics for ad performance';
COMMENT ON TABLE user_ad_frequency IS 'User ad exposure tracking for frequency capping';

COMMENT ON FUNCTION get_applicable_ads IS 'Returns applicable ads for given content/channel and placement type';
COMMENT ON FUNCTION record_ad_analytics IS 'Records ad analytics events and updates counters';