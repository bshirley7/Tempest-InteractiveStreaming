-- Create content shelves table
CREATE TABLE content_shelves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  layout_style TEXT DEFAULT 'row' CHECK (layout_style IN ('row', 'grid', 'hero')),
  aspect_ratio TEXT DEFAULT '16:9' CHECK (aspect_ratio IN ('16:9', 'poster', 'square')),
  max_items INTEGER DEFAULT 12,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content shelf assignments table
CREATE TABLE content_shelf_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelf_id UUID REFERENCES content_shelves(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shelf_id, content_id)
);

-- Add RLS policies
ALTER TABLE content_shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_shelf_assignments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read shelves
CREATE POLICY "Allow authenticated users to read content shelves" ON content_shelves
  FOR SELECT TO authenticated USING (true);

-- Allow service role to manage shelves
CREATE POLICY "Allow service role to manage content shelves" ON content_shelves
  FOR ALL TO service_role USING (true);

-- Allow authenticated users to read shelf assignments
CREATE POLICY "Allow authenticated users to read shelf assignments" ON content_shelf_assignments
  FOR SELECT TO authenticated USING (true);

-- Allow service role to manage shelf assignments
CREATE POLICY "Allow service role to manage shelf assignments" ON content_shelf_assignments
  FOR ALL TO service_role USING (true);

-- Create indexes for better performance
CREATE INDEX idx_content_shelves_active ON content_shelves(is_active, display_order);
CREATE INDEX idx_shelf_assignments_shelf ON content_shelf_assignments(shelf_id, display_order);
CREATE INDEX idx_shelf_assignments_content ON content_shelf_assignments(content_id);

-- Insert default shelves based on current categories
INSERT INTO content_shelves (name, description, display_order, layout_style, aspect_ratio, max_items) VALUES
  ('Just Added', 'Latest content uploads', 1, 'row', '16:9', 12),
  ('Trending Now', 'Most viewed content', 2, 'row', '16:9', 10),
  ('Travel & Guides', 'Explore destinations and travel tips', 3, 'row', '16:9', 12),
  ('Relaxation & Wellness', 'Health, mindfulness, and well-being content', 4, 'grid', '16:9', 12),
  ('Documentaries', 'In-depth research and investigations', 5, 'row', 'poster', 12),
  ('Career Development', 'Professional growth and business insights', 6, 'row', '16:9', 12),
  ('How-To & Tutorials', 'Step-by-step guides and instructional content', 7, 'grid', '16:9', 12),
  ('Academic Content', 'Educational lectures and scholarly material', 8, 'row', '16:9', 12),
  ('News & Updates', 'Latest campus news and announcements', 9, 'row', '16:9', 8),
  ('Entertainment', 'Fun content, games, and interactive experiences', 10, 'row', '16:9', 10);