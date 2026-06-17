-- Create visits table for realtime visitor tracking
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  page TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_created_at ON public.visits(created_at);
CREATE INDEX IF NOT EXISTS idx_visits_page ON public.visits(page);
