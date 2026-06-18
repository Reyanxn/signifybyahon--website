-- Homepage sections table
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom',
  display_order INTEGER NOT NULL DEFAULT 0,
  product_ids JSONB DEFAULT '[]'::jsonb,
  alignment TEXT DEFAULT 'left',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.homepage_sections DISABLE ROW LEVEL SECURITY;

-- Add approved and featured columns to reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Seed default homepage sections
INSERT INTO public.homepage_sections (title, type, display_order, alignment, active) VALUES
  ('New Arrivals', 'new-arrivals', 1, 'left', true),
  ('Best Sellers', 'best-sellers', 2, 'left', true),
  ('Trending Now', 'trending', 3, 'left', true),
  ('Sale', 'sale', 4, 'left', true),
  ('Customer Reviews', 'testimonials', 5, 'center', true)
ON CONFLICT DO NOTHING;
