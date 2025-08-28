-- =============================================
-- Supabase Database Schema for Tour Management System
-- Execute this in your Supabase SQL Editor
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- 1. CREATE CUSTOM TYPES
-- =============================================

-- User role enum
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Booking status enum
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

-- =============================================
-- 2. CREATE TABLES
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  country TEXT,
  role user_role DEFAULT 'user'::user_role,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tours table
CREATE TABLE public.tours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT,
  city TEXT NOT NULL,
  location TEXT NOT NULL,
  meeting_point TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10,2) CHECK (original_price >= 0),
  duration TEXT NOT NULL,
  max_group_size INTEGER NOT NULL CHECK (max_group_size > 0),
  highlights JSONB DEFAULT '[]'::jsonb,
  included JSONB DEFAULT '[]'::jsonb,
  cancellation_policy TEXT NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  images JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tour availability table
CREATE TABLE public.tour_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE NOT NULL,
  available_date DATE NOT NULL,
  time_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  available_spots INTEGER NOT NULL CHECK (available_spots >= 0),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tour_id, available_date)
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID REFERENCES public.tours(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  availability_id UUID REFERENCES public.tour_availability(id) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  status booking_status DEFAULT 'pending'::booking_status,
  payment_status payment_status DEFAULT 'pending'::payment_status,
  payment_id TEXT,
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. CREATE PERFORMANCE INDEXES
-- =============================================

-- Users table indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_active ON public.users(is_active);

-- Tours table indexes
CREATE INDEX idx_tours_city ON public.tours(city);
CREATE INDEX idx_tours_active ON public.tours(is_active);
CREATE INDEX idx_tours_featured ON public.tours(is_featured);
CREATE INDEX idx_tours_price ON public.tours(price);
CREATE INDEX idx_tours_rating ON public.tours(rating DESC);
CREATE INDEX idx_tours_created_at ON public.tours(created_at DESC);

-- Full-text search index for tours
CREATE INDEX idx_tours_search ON public.tours USING gin (
  (title || ' ' || description) gin_trgm_ops
);

-- Composite index for tour filtering
CREATE INDEX idx_tours_city_active_featured ON public.tours(city, is_active, is_featured);

-- Tour availability indexes
CREATE INDEX idx_availability_tour_date ON public.tour_availability(tour_id, available_date);
CREATE INDEX idx_availability_date ON public.tour_availability(available_date);
CREATE INDEX idx_availability_tour_active ON public.tour_availability(tour_id, is_available);

-- Bookings table indexes
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_tour ON public.bookings(tour_id);
CREATE INDEX idx_bookings_availability ON public.bookings(availability_id);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_bookings_user_status ON public.bookings(user_id, status);
CREATE INDEX idx_bookings_tour_date ON public.bookings(tour_id, booking_date);

-- =============================================
-- 4. CREATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =============================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at 
    BEFORE UPDATE ON public.tours 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_availability_updated_at 
    BEFORE UPDATE ON public.tour_availability 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON public.bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. CREATE FUNCTIONS FOR COMPLEX OPERATIONS
-- =============================================

-- Function to get available tours with filters
CREATE OR REPLACE FUNCTION get_available_tours(
  filter_city TEXT DEFAULT NULL,
  filter_search TEXT DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  limit_count INTEGER DEFAULT 12,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  city TEXT,
  location TEXT,
  price DECIMAL,
  original_price DECIMAL,
  duration TEXT,
  rating DECIMAL,
  review_count INTEGER,
  images JSONB,
  is_featured BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id, t.title, t.description, t.city, t.location,
    t.price, t.original_price, t.duration, t.rating,
    t.review_count, t.images, t.is_featured
  FROM public.tours t
  WHERE t.is_active = true
    AND (filter_city IS NULL OR t.city = filter_city)
    AND (filter_search IS NULL OR 
         t.title ILIKE '%' || filter_search || '%' OR 
         t.description ILIKE '%' || filter_search || '%')
    AND (min_price IS NULL OR t.price >= min_price)
    AND (max_price IS NULL OR t.price <= max_price)
  ORDER BY t.is_featured DESC, t.rating DESC, t.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check booking availability
CREATE OR REPLACE FUNCTION check_booking_availability(
  availability_id UUID,
  requested_spots INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_spots INTEGER;
BEGIN
  SELECT available_spots INTO current_spots
  FROM public.tour_availability
  WHERE id = availability_id AND is_available = true;
  
  RETURN current_spots >= requested_spots;
END;
$$ LANGUAGE plpgsql;

-- Function to create booking with availability check
CREATE OR REPLACE FUNCTION create_booking_safe(
  p_tour_id UUID,
  p_user_id UUID,
  p_availability_id UUID,
  p_booking_date DATE,
  p_booking_time TEXT,
  p_guest_count INTEGER,
  p_total_amount DECIMAL,
  p_special_requests TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  booking_id UUID;
  available_spots INTEGER;
BEGIN
  -- Lock the availability row to prevent race conditions
  SELECT tour_availability.available_spots INTO available_spots
  FROM public.tour_availability
  WHERE id = p_availability_id
  FOR UPDATE;
  
  -- Check if enough spots are available
  IF available_spots < p_guest_count THEN
    RAISE EXCEPTION 'Not enough spots available. Available: %, Requested: %', available_spots, p_guest_count;
  END IF;
  
  -- Create the booking
  INSERT INTO public.bookings (
    tour_id, user_id, availability_id, booking_date, booking_time,
    guest_count, total_amount, special_requests
  ) VALUES (
    p_tour_id, p_user_id, p_availability_id, p_booking_date, p_booking_time,
    p_guest_count, p_total_amount, p_special_requests
  ) RETURNING id INTO booking_id;
  
  -- Update available spots
  UPDATE public.tour_availability
  SET available_spots = available_spots - p_guest_count
  WHERE id = p_availability_id;
  
  RETURN booking_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. INSERT SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert sample tours (you can customize these)
INSERT INTO public.tours (
  title, description, full_description, city, location, meeting_point,
  price, original_price, duration, max_group_size, highlights, included,
  cancellation_policy, rating, review_count, images, is_featured
) VALUES
  (
    'Historic City Walking Tour',
    'Explore the historic center with expert local guides',
    'Discover the rich history and culture of our beautiful city center. This comprehensive walking tour covers all major historical landmarks, hidden gems, and local stories that bring the past to life.',
    'Madrid',
    'Historic City Center',
    'Plaza Mayor, Main Fountain',
    45.00,
    60.00,
    '3 hours',
    15,
    '["Professional guide", "Historical insights", "Photo opportunities", "Small group experience"]',
    '["Expert guide", "Walking tour", "Historical commentary", "Photo stops"]',
    'Free cancellation up to 24 hours before the tour',
    4.8,
    126,
    '["https://images.unsplash.com/photo-1539037116277-4db20889f2d4", "https://images.unsplash.com/photo-1545569341-9eb8b30979d9"]',
    true
  ),
  (
    'Culinary Food Tour',
    'Taste the best local cuisine and traditional dishes',
    'Embark on a delicious journey through local markets, traditional restaurants, and hidden culinary gems. Sample authentic dishes, learn about local ingredients, and discover the stories behind traditional recipes.',
    'Barcelona',
    'Gothic Quarter',
    'Plaça de la Seu, Cathedral entrance',
    65.00,
    85.00,
    '4 hours',
    12,
    '["Local food tastings", "Market visits", "Traditional recipes", "Cultural insights"]',
    '["Food guide", "Food tastings", "Market tour", "Recipe booklet"]',
    'Free cancellation up to 48 hours before the tour',
    4.9,
    203,
    '["https://images.unsplash.com/photo-1414235077428-338989a2e8c0", "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa"]',
    true
  ),
  (
    'Art and Architecture Tour',
    'Discover masterpieces of art and stunning architecture',
    'A comprehensive tour of the city''s most important art galleries, museums, and architectural landmarks. Learn about different artistic movements, famous artists, and the evolution of architectural styles.',
    'Madrid',
    'Art District',
    'Museo del Prado, Main entrance',
    55.00,
    70.00,
    '5 hours',
    10,
    '["Museum visits", "Art expert guide", "Architecture insights", "Skip-the-line access"]',
    '["Expert art guide", "Museum entries", "Audio headsets", "Art history booklet"]',
    'Free cancellation up to 24 hours before the tour',
    4.7,
    89,
    '["https://images.unsplash.com/photo-1541961017774-22349e4a1262", "https://images.unsplash.com/photo-1518709268805-4e9042af2176"]',
    false
  );

-- Insert sample availability for the tours
WITH tour_ids AS (
  SELECT id FROM public.tours LIMIT 3
)
INSERT INTO public.tour_availability (tour_id, available_date, time_slots, available_spots)
SELECT 
  id,
  CURRENT_DATE + (generate_series(1, 30) || ' days')::interval,
  '["09:00", "14:00", "16:00"]'::jsonb,
  (SELECT max_group_size FROM public.tours WHERE tours.id = tour_ids.id)
FROM tour_ids;

COMMIT;