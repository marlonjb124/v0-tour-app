-- =============================================
-- Row Level Security (RLS) Policies
-- Execute this AFTER running the main schema
-- =============================================

-- =============================================
-- 1. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. USERS TABLE POLICIES
-- =============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow users to be created (for registration)
CREATE POLICY "Allow user creation" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- 3. TOURS TABLE POLICIES
-- =============================================

-- Anyone can read active tours (public access)
CREATE POLICY "Anyone can read active tours" ON public.tours
  FOR SELECT USING (is_active = true);

-- Admins can create tours
CREATE POLICY "Admins can create tours" ON public.tours
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all tours
CREATE POLICY "Admins can update tours" ON public.tours
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete tours
CREATE POLICY "Admins can delete tours" ON public.tours
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tour creators can read their own tours (even if inactive)
CREATE POLICY "Creators can read own tours" ON public.tours
  FOR SELECT USING (created_by = auth.uid());

-- =============================================
-- 4. TOUR AVAILABILITY POLICIES
-- =============================================

-- Anyone can read availability for active tours
CREATE POLICY "Anyone can read tour availability" ON public.tour_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tours 
      WHERE tours.id = tour_availability.tour_id 
      AND tours.is_active = true
    )
  );

-- Admins can manage availability
CREATE POLICY "Admins can manage availability" ON public.tour_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- 5. BOOKINGS TABLE POLICIES
-- =============================================

-- Users can read their own bookings
CREATE POLICY "Users can read own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (limited fields)
CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND status IN ('pending', 'confirmed')
  ) WITH CHECK (
    auth.uid() = user_id
  );

-- Admins can read all bookings
CREATE POLICY "Admins can read all bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all bookings
CREATE POLICY "Admins can update all bookings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete bookings
CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- 6. SECURITY FUNCTIONS
-- =============================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a resource
CREATE OR REPLACE FUNCTION owns_resource(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = resource_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. STORAGE POLICIES (for file uploads)
-- =============================================

-- Create storage bucket for tour images (run this in Storage section)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tour-images', 'tour-images', true);

-- Storage policies for tour images
-- CREATE POLICY "Public can view tour images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'tour-images');

-- CREATE POLICY "Admins can upload tour images" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'tour-images' 
--     AND is_admin()
--   );

-- CREATE POLICY "Admins can update tour images" ON storage.objects
--   FOR UPDATE USING (
--     bucket_id = 'tour-images' 
--     AND is_admin()
--   );

-- CREATE POLICY "Admins can delete tour images" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'tour-images' 
--     AND is_admin()
--   );

COMMIT;