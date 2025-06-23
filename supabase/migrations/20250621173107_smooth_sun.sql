/*
  # Thumbnail Management Enhancement

  1. New Features
    - Added thumbnail_source field to content metadata to track thumbnail origin
    - Added thumbnail_metadata field to store information about uploaded thumbnails
    - Added thumbnail_upload_date to track when thumbnails were last updated

  2. Changes
    - Enhanced content table with additional thumbnail tracking fields
    - Added indexes for thumbnail-related queries
    - Added documentation comments for new fields
*/

-- Add thumbnail metadata fields to content table
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS thumbnail_source text,
ADD COLUMN IF NOT EXISTS thumbnail_metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS thumbnail_upload_date timestamptz;

-- Add index for thumbnail queries
CREATE INDEX IF NOT EXISTS idx_content_thumbnail ON content(thumbnail_url) WHERE thumbnail_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_thumbnail_source ON content(thumbnail_source) WHERE thumbnail_source IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN content.thumbnail_source IS 'Source of the thumbnail: url, upload, or stream';
COMMENT ON COLUMN content.thumbnail_metadata IS 'Metadata for the thumbnail including dimensions, file size, etc.';
COMMENT ON COLUMN content.thumbnail_upload_date IS 'Date when the thumbnail was last uploaded or updated';

-- Create function to extract thumbnail metadata from jsonb
CREATE OR REPLACE FUNCTION extract_thumbnail_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if metadata exists
  IF NEW.metadata IS NOT NULL THEN
    -- Extract thumbnail source if it exists in metadata
    IF (NEW.metadata->>'thumbnail_source') IS NOT NULL THEN
      NEW.thumbnail_source := NEW.metadata->>'thumbnail_source';
    END IF;
    
    -- Extract thumbnail metadata if it exists
    IF jsonb_typeof(NEW.metadata->'thumbnail_metadata') = 'object' THEN
      NEW.thumbnail_metadata := NEW.metadata->'thumbnail_metadata';
    END IF;
    
    -- Set thumbnail upload date if it exists
    IF (NEW.metadata->>'thumbnail_upload_date') IS NOT NULL THEN
      BEGIN
        NEW.thumbnail_upload_date := (NEW.metadata->>'thumbnail_upload_date')::timestamptz;
      EXCEPTION WHEN OTHERS THEN
        -- Invalid date format, ignore
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to extract thumbnail metadata on insert/update
DROP TRIGGER IF EXISTS extract_thumbnail_metadata_trigger ON content;
CREATE TRIGGER extract_thumbnail_metadata_trigger
BEFORE INSERT OR UPDATE ON content
FOR EACH ROW
EXECUTE FUNCTION extract_thumbnail_metadata();

-- Migrate existing metadata to new columns
DO $$
BEGIN
  -- Update existing rows to extract thumbnail metadata
  UPDATE content
  SET 
    thumbnail_source = metadata->>'thumbnail_source',
    thumbnail_upload_date = CASE 
      WHEN metadata->>'thumbnail_upload_date' IS NOT NULL THEN 
        (metadata->>'thumbnail_upload_date')::timestamptz
      ELSE 
        NULL
    END
  WHERE metadata IS NOT NULL;
  
  -- Handle thumbnail metadata separately
  UPDATE content
  SET thumbnail_metadata = metadata->'thumbnail_metadata'
  WHERE metadata IS NOT NULL AND jsonb_typeof(metadata->'thumbnail_metadata') = 'object';
  
  -- Set default thumbnail source based on URL pattern for existing content
  UPDATE content
  SET thumbnail_source = 
    CASE 
      WHEN thumbnail_url LIKE '%cloudflarestream.com%' THEN 'stream'
      WHEN thumbnail_url LIKE '%r2.cloudflarestorage.com%' THEN 'upload'
      ELSE 'url'
    END
  WHERE thumbnail_url IS NOT NULL AND thumbnail_source IS NULL;
END $$;