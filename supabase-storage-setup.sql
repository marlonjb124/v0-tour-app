-- =============================================
-- Supabase Storage Setup for Tour Images
-- Execute these commands in your Supabase Storage section or SQL Editor
-- =============================================

-- 1. Create storage bucket for tour images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tour-images', 'tour-images', true);

-- 2. Set up storage policies for tour images

-- Allow public viewing of tour images
CREATE POLICY "Public can view tour images" ON storage.objects
  FOR SELECT USING (bucket_id = 'tour-images');

-- Allow authenticated users to upload tour images
CREATE POLICY "Authenticated users can upload tour images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tour-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow admins to upload/update tour images
CREATE POLICY "Admins can manage tour images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'tour-images' 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to delete tour images
CREATE POLICY "Admins can delete tour images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'tour-images' 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Optional: Create bucket for user avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Allow users to upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public viewing of avatars
CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

COMMIT;