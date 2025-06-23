/*
  # Add Sync Status and Stream Metadata Tracking

  1. New Columns
    - `sync_status` - Tracks synchronization status with Cloudflare Stream
    - `last_synced_at` - Timestamp of last successful sync with Cloudflare Stream
    - `stream_metadata` - Stores the last known metadata from Cloudflare Stream

  2. Features
    - Track sync status between local database and Cloudflare Stream
    - Enable bidirectional sync capabilities
    - Store Stream-specific metadata for comparison and sync operations
*/

-- Add sync status columns to content table
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS sync_status text,
ADD COLUMN IF NOT EXISTS last_synced_at timestamptz,
ADD COLUMN IF NOT EXISTS stream_metadata jsonb DEFAULT '{}';

-- Add index for sync status queries
CREATE INDEX IF NOT EXISTS idx_content_sync_status ON content(sync_status) WHERE sync_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_last_synced ON content(last_synced_at) WHERE last_synced_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN content.sync_status IS 'Synchronization status with Cloudflare Stream: synced, out_of_sync, error, pending';
COMMENT ON COLUMN content.last_synced_at IS 'Timestamp of last successful sync with Cloudflare Stream';
COMMENT ON COLUMN content.stream_metadata IS 'Last known metadata from Cloudflare Stream for comparison';

-- Create function to update sync status on content changes
CREATE OR REPLACE FUNCTION update_content_sync_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark as out of sync when content is updated
  IF TG_OP = 'UPDATE' THEN
    -- Only mark as out of sync if relevant fields changed
    IF (OLD.title != NEW.title OR 
        OLD.description IS DISTINCT FROM NEW.description OR
        OLD.category IS DISTINCT FROM NEW.category OR
        OLD.tags IS DISTINCT FROM NEW.tags OR
        OLD.genre IS DISTINCT FROM NEW.genre OR
        OLD.keywords IS DISTINCT FROM NEW.keywords OR
        OLD.language IS DISTINCT FROM NEW.language OR
        OLD.instructor IS DISTINCT FROM NEW.instructor OR
        OLD.difficulty_level IS DISTINCT FROM NEW.difficulty_level OR
        OLD.target_audience IS DISTINCT FROM NEW.target_audience OR
        OLD.learning_objectives IS DISTINCT FROM NEW.learning_objectives OR
        OLD.prerequisites IS DISTINCT FROM NEW.prerequisites) THEN
      
      NEW.sync_status := 'out_of_sync';
    END IF;
  END IF;
  
  -- For new content, set sync status to pending
  IF TG_OP = 'INSERT' THEN
    NEW.sync_status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update sync status on content changes
DROP TRIGGER IF EXISTS update_content_sync_status_trigger ON content;
CREATE TRIGGER update_content_sync_status_trigger
BEFORE INSERT OR UPDATE ON content
FOR EACH ROW
EXECUTE FUNCTION update_content_sync_status();