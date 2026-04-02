-- =============================================
-- Help Image Gallery - Supabase Setup
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Create tables
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE image_tags (
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (image_id, tag_id)
);

-- 2. Create indexes
CREATE INDEX idx_images_created_at ON images(created_at DESC);
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_image_tags_image_id ON image_tags(image_id);
CREATE INDEX idx_image_tags_tag_id ON image_tags(tag_id);

-- 3. Enable RLS (public access for now)
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access to images" ON images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to tags" ON tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to image_tags" ON image_tags FOR ALL USING (true) WITH CHECK (true);

-- 4. Create storage bucket (run this separately or via Supabase dashboard)
-- Go to Storage > New Bucket > Name: "help-images" > Public: ON
