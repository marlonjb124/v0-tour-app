-- Add new fields to tours table
ALTER TABLE tours
ADD COLUMN IF NOT EXISTS location_type VARCHAR DEFAULT 'domestic' CHECK (location_type IN ('domestic', 'international')),
ADD COLUMN IF NOT EXISTS tour_type VARCHAR DEFAULT 'tour' CHECK (tour_type IN ('tour', 'ticket')),
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT NULL;

-- Update existing tours to have default values
UPDATE tours
SET 
  location_type = 'domestic',
  tour_type = 'tour',
  duration_days = 1
WHERE location_type IS NULL OR tour_type IS NULL OR duration_days IS NULL;

-- Optionally add appropriate indexes
CREATE INDEX IF NOT EXISTS idx_tours_location_type ON tours(location_type);
CREATE INDEX IF NOT EXISTS idx_tours_tour_type ON tours(tour_type);
CREATE INDEX IF NOT EXISTS idx_tours_duration_days ON tours(duration_days);