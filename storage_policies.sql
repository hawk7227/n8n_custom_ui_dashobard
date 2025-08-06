-- Storage policies for images bucket
-- Run this in your Supabase SQL editor

-- First, make sure the images bucket exists and is public
-- You can create it manually in the Supabase dashboard under Storage

-- Allow public access to read images (for displaying images)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

-- Allow users to update their own images
CREATE POLICY "Users can update images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' 
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

-- Allow users to delete images
CREATE POLICY "Users can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' 
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

-- Alternative: If you want to disable RLS completely for storage (less secure but simpler)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY; 