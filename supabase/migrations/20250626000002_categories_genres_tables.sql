/*
  # Categories and Genres Persistence Tables

  1. New Tables
    - `categories` - Store custom content categories
    - `genres` - Store custom content genres
    - Both support custom user-created entries

  2. Features
    - Persistent storage of custom categories and genres
    - Proper referential integrity
    - Default data population

  3. Security
    - RLS policies for proper access control
    - Faculty and admins can manage, students can read
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create genres table
CREATE TABLE IF NOT EXISTS genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for categories
CREATE POLICY "Faculty can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'faculty')
    )
  );

CREATE POLICY "All can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Add RLS policies for genres
CREATE POLICY "Faculty can manage genres"
  ON genres
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND role IN ('admin', 'faculty')
    )
  );

CREATE POLICY "All can read genres"
  ON genres
  FOR SELECT
  TO authenticated
  USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_genres_name ON genres(name);

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genres_updated_at 
  BEFORE UPDATE ON genres 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, description, is_default) VALUES
  ('Lecture', 'Traditional classroom lectures and presentations', true),
  ('Tutorial', 'Step-by-step instructional content', true),
  ('Seminar', 'Interactive discussion-based sessions', true),
  ('Workshop', 'Hands-on practical sessions', true),
  ('Conference', 'Academic conferences and symposiums', true),
  ('Documentary', 'Educational documentaries and films', true),
  ('Interview', 'Expert interviews and conversations', true),
  ('Presentation', 'Student and faculty presentations', true),
  ('Discussion', 'Panel discussions and debates', true),
  ('Event', 'Special events and ceremonies', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default genres
INSERT INTO genres (name, description, is_default) VALUES
  ('Academic', 'Formal academic content', true),
  ('Research', 'Research-focused content', true),
  ('Educational', 'General educational material', true),
  ('Training', 'Skills and professional training', true),
  ('Demonstration', 'Practical demonstrations', true),
  ('Case Study', 'Real-world case studies', true),
  ('Review', 'Content reviews and analyses', true),
  ('Analysis', 'Analytical and critical content', true)
ON CONFLICT (name) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE categories IS 'Content categories - both default and custom user-created';
COMMENT ON TABLE genres IS 'Content genres - both default and custom user-created';
COMMENT ON COLUMN categories.is_default IS 'Whether this is a system default category';
COMMENT ON COLUMN genres.is_default IS 'Whether this is a system default genre';