-- Fix Channels Schema and Add Missing Columns
-- Run this script in Supabase SQL Editor to fix the schema cache issue

-- Step 1: Check current columns in channels table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'channels'
ORDER BY ordinal_position;

-- Step 2: Add missing columns if they don't exist
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS logo_svg text,
ADD COLUMN IF NOT EXISTS logo_metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_live boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stream_key text,
ADD COLUMN IF NOT EXISTS cloudflare_stream_id text;

-- Step 3: Add any missing indexes
CREATE INDEX IF NOT EXISTS idx_channels_logo ON public.channels(logo_url) WHERE logo_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_channels_is_live ON public.channels(is_live);
CREATE INDEX IF NOT EXISTS idx_channels_stream_key ON public.channels(stream_key);

-- Step 4: Update column comments
COMMENT ON COLUMN public.channels.logo_url IS 'URL to channel logo image (for external hosting)';
COMMENT ON COLUMN public.channels.logo_svg IS 'Direct SVG content for channel logo';
COMMENT ON COLUMN public.channels.logo_metadata IS 'Logo metadata including dimensions, colors, etc.';
COMMENT ON COLUMN public.channels.is_live IS 'Whether the channel is currently live streaming';
COMMENT ON COLUMN public.channels.stream_key IS 'Unique key for streaming to this channel';
COMMENT ON COLUMN public.channels.cloudflare_stream_id IS 'Cloudflare Stream ID for live streaming';

-- Step 5: Force schema cache refresh
-- Update the table comment to trigger a schema refresh
COMMENT ON TABLE public.channels IS 'Streaming channels with logo and live streaming support - Updated ' || now();

-- Step 6: Verify all columns exist
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'channels'
AND column_name IN ('logo_url', 'logo_svg', 'logo_metadata', 'is_live', 'stream_key', 'cloudflare_stream_id')
ORDER BY ordinal_position;

-- Step 7: Test with a simple select to ensure columns are accessible
SELECT 
    id, 
    name, 
    logo_url, 
    logo_svg, 
    logo_metadata,
    is_live,
    stream_key,
    cloudflare_stream_id
FROM public.channels 
LIMIT 1;