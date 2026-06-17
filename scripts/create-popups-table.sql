-- Create popups table for website entrance popup
CREATE TABLE IF NOT EXISTS public.popups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image TEXT NOT NULL,
  link TEXT,
  active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read popups" ON public.popups FOR SELECT USING (true);
CREATE POLICY "Admins can manage popups" ON public.popups FOR ALL USING (auth.role() = 'authenticated');
