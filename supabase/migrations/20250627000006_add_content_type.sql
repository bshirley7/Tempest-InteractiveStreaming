/*
  # Add Content Type Support

  1. New Field
    - Add `content_type` ENUM field to content table
    - Default to 'content' for existing videos
    - Support 'content' and 'advertisement' types

  2. Features
    - Allows filtering content vs ads in single table
    - Maintains backward compatibility
    - Simplifies ad system architecture

  3. Indexes
    - Add index for efficient content_type filtering
*/

-- Create content type enum
CREATE TYPE content_type_enum AS ENUM ('content', 'advertisement');

-- Add content_type column to content table
ALTER TABLE content 
ADD COLUMN content_type content_type_enum DEFAULT 'content';

-- Set all existing content to 'content' type
UPDATE content 
SET content_type = 'content' 
WHERE content_type IS NULL;

-- Make content_type NOT NULL after setting defaults
ALTER TABLE content 
ALTER COLUMN content_type SET NOT NULL;

-- Add index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_content_content_type 
ON content(content_type);

-- Add index for content type + published status (common query pattern)
CREATE INDEX IF NOT EXISTS idx_content_type_published 
ON content(content_type, is_published);

-- Update table comment
COMMENT ON COLUMN content.content_type IS 'Type of content: content (educational) or advertisement';
COMMENT ON TABLE content IS 'Unified table for all video content including educational content and advertisements';