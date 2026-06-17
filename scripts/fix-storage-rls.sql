-- Option 1: Add RLS policies for storage
CREATE POLICY "authenticated_upload_product_images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "authenticated_upload_banners" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');

CREATE POLICY "public_read_objects" ON storage.objects
  FOR SELECT USING (true);

-- Option 2 (fallback): Disable storage RLS entirely
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
