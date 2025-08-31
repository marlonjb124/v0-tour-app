-- Add a category column to the tours table to classify tours
ALTER TABLE public.tours
ADD COLUMN category TEXT;

-- Add a comment to the new column for clarity
COMMENT ON COLUMN public.tours.category IS 'Category of the tour, e.g., peru_in, peru_out, one_day, multi_day.';
