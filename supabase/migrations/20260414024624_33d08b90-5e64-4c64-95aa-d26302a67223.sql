-- Drop the overly broad SELECT policies and replace with more specific ones
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Partner images are publicly accessible" ON storage.objects;

-- Allow public access to individual files (via direct URL) but restrict listing
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Partner images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'partner-images' AND auth.role() = 'authenticated');
