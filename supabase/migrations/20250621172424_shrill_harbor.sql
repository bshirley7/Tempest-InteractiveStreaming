/*
  # Content Metadata Expansion

  1. New Columns
    - Add new metadata columns to the content table for better organization and searchability
    - Includes genre, keywords, language, release_date, location, instructor, difficulty_level, etc.
    - Adds proper indexing for search performance

  2. Changes
    - Expands the content table schema to support comprehensive metadata
    - Adds indexes for common search fields
    - Adds comments for documentation

  3. Security
    - Maintains existing RLS policies
*/

-- Add new metadata columns to content table
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS genre text,
ADD COLUMN IF NOT EXISTS keywords text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS language text DEFAULT 'English',
ADD COLUMN IF NOT EXISTS release_date date,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS instructor text,
ADD COLUMN IF NOT EXISTS difficulty_level text DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS target_audience text,
ADD COLUMN IF NOT EXISTS learning_objectives text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS prerequisites text[] DEFAULT '{}';

-- Add indexes for search performance
CREATE INDEX IF NOT EXISTS idx_content_genre ON content(genre) WHERE genre IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_language ON content(language);
CREATE INDEX IF NOT EXISTS idx_content_difficulty ON content(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_content_instructor ON content(instructor) WHERE instructor IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_release_date ON content(release_date) WHERE release_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_keywords ON content USING gin(keywords) WHERE array_length(keywords, 1) > 0;
CREATE INDEX IF NOT EXISTS idx_content_learning_objectives ON content USING gin(learning_objectives) WHERE array_length(learning_objectives, 1) > 0;

-- Add comments for documentation
COMMENT ON COLUMN content.genre IS 'Content genre classification (Academic, Research, Educational, etc.)';
COMMENT ON COLUMN content.keywords IS 'Array of keywords for search optimization';
COMMENT ON COLUMN content.language IS 'Primary language of the content';
COMMENT ON COLUMN content.release_date IS 'Official release date of the content';
COMMENT ON COLUMN content.location IS 'Physical location where content was recorded';
COMMENT ON COLUMN content.instructor IS 'Primary instructor or presenter';
COMMENT ON COLUMN content.difficulty_level IS 'Content difficulty (Beginner, Intermediate, Advanced, etc.)';
COMMENT ON COLUMN content.target_audience IS 'Intended audience for the content';
COMMENT ON COLUMN content.learning_objectives IS 'Array of learning objectives for educational content';
COMMENT ON COLUMN content.prerequisites IS 'Array of prerequisites for the content';

-- Create function to extract metadata from jsonb
CREATE OR REPLACE FUNCTION extract_content_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if metadata exists and columns are null
  IF NEW.metadata IS NOT NULL THEN
    -- Extract metadata fields if the target columns are null
    IF NEW.genre IS NULL AND (NEW.metadata->>'genre') IS NOT NULL THEN
      NEW.genre := NEW.metadata->>'genre';
    END IF;
    
    IF array_length(NEW.keywords, 1) IS NULL AND jsonb_typeof(NEW.metadata->'keywords') = 'array' THEN
      NEW.keywords := array(SELECT jsonb_array_elements_text(NEW.metadata->'keywords'));
    END IF;
    
    IF NEW.language IS NULL AND (NEW.metadata->>'language') IS NOT NULL THEN
      NEW.language := NEW.metadata->>'language';
    END IF;
    
    IF NEW.release_date IS NULL AND (NEW.metadata->>'release_date') IS NOT NULL THEN
      BEGIN
        NEW.release_date := (NEW.metadata->>'release_date')::date;
      EXCEPTION WHEN OTHERS THEN
        -- Invalid date format, ignore
      END;
    END IF;
    
    IF NEW.location IS NULL AND (NEW.metadata->>'location') IS NOT NULL THEN
      NEW.location := NEW.metadata->>'location';
    END IF;
    
    IF NEW.instructor IS NULL AND (NEW.metadata->>'instructor') IS NOT NULL THEN
      NEW.instructor := NEW.metadata->>'instructor';
    END IF;
    
    IF NEW.difficulty_level IS NULL AND (NEW.metadata->>'difficulty_level') IS NOT NULL THEN
      NEW.difficulty_level := NEW.metadata->>'difficulty_level';
    END IF;
    
    IF NEW.target_audience IS NULL AND (NEW.metadata->>'target_audience') IS NOT NULL THEN
      NEW.target_audience := NEW.metadata->>'target_audience';
    END IF;
    
    IF array_length(NEW.learning_objectives, 1) IS NULL AND jsonb_typeof(NEW.metadata->'learning_objectives') = 'array' THEN
      NEW.learning_objectives := array(SELECT jsonb_array_elements_text(NEW.metadata->'learning_objectives'));
    END IF;
    
    IF array_length(NEW.prerequisites, 1) IS NULL AND jsonb_typeof(NEW.metadata->'prerequisites') = 'array' THEN
      NEW.prerequisites := array(SELECT jsonb_array_elements_text(NEW.metadata->'prerequisites'));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to extract metadata on insert/update
DROP TRIGGER IF EXISTS extract_content_metadata_trigger ON content;
CREATE TRIGGER extract_content_metadata_trigger
BEFORE INSERT OR UPDATE ON content
FOR EACH ROW
EXECUTE FUNCTION extract_content_metadata();

-- Migrate existing metadata to new columns
DO $$
BEGIN
  -- Update existing rows to extract metadata
  UPDATE content
  SET 
    genre = metadata->>'genre',
    language = COALESCE(metadata->>'language', 'English'),
    difficulty_level = COALESCE(metadata->>'difficulty_level', 'Beginner'),
    instructor = metadata->>'instructor',
    location = metadata->>'location',
    target_audience = metadata->>'target_audience'
  WHERE metadata IS NOT NULL;
  
  -- Handle array fields separately
  UPDATE content
  SET keywords = array(SELECT jsonb_array_elements_text(metadata->'keywords'))
  WHERE metadata IS NOT NULL AND jsonb_typeof(metadata->'keywords') = 'array';
  
  UPDATE content
  SET learning_objectives = array(SELECT jsonb_array_elements_text(metadata->'learning_objectives'))
  WHERE metadata IS NOT NULL AND jsonb_typeof(metadata->'learning_objectives') = 'array';
  
  UPDATE content
  SET prerequisites = array(SELECT jsonb_array_elements_text(metadata->'prerequisites'))
  WHERE metadata IS NOT NULL AND jsonb_typeof(metadata->'prerequisites') = 'array';
  
  -- Handle date fields with error handling
  BEGIN
    UPDATE content
    SET release_date = (metadata->>'release_date')::date
    WHERE metadata IS NOT NULL AND metadata->>'release_date' IS NOT NULL;
  EXCEPTION WHEN OTHERS THEN
    -- Invalid date format, ignore
  END;
END $$;