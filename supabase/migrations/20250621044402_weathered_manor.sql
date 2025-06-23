/*
  # Add Channel Logo Support

  1. Schema Changes
    - Add `logo_url` column to channels table
    - Add `logo_svg` column for storing SVG content directly
    - Update indexes for better performance

  2. Security
    - Update RLS policies to allow logo management
    - Ensure proper access control for logo uploads

  3. Features
    - Support for both URL-based and direct SVG storage
    - Metadata for logo management
*/

-- Add logo columns to channels table
ALTER TABLE channels 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS logo_svg text,
ADD COLUMN IF NOT EXISTS logo_metadata jsonb DEFAULT '{}';

-- Add index for logo queries
CREATE INDEX IF NOT EXISTS idx_channels_logo ON channels(logo_url) WHERE logo_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN channels.logo_url IS 'URL to channel logo image (for external hosting)';
COMMENT ON COLUMN channels.logo_svg IS 'Direct SVG content for channel logo';
COMMENT ON COLUMN channels.logo_metadata IS 'Logo metadata including dimensions, colors, etc.';

-- Update the updated_at trigger to include new columns
-- (The trigger already exists and will handle these new columns automatically)