-- Add order column for category drag reordering
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Seed default categories (run once)
INSERT INTO public.categories (name, slug, "order") VALUES
  ('Lawn Suits', 'lawn-suits', 1),
  ('Kurtas', 'kurtas', 2),
  ('Dupattas', 'dupattas', 3),
  ('Sarees', 'sarees', 4),
  ('Silk Collection', 'silk', 5),
  ('Winter Collection', 'winter', 6),
  ('Summer Collection', 'summer', 7)
ON CONFLICT (slug) DO UPDATE SET "order" = EXCLUDED."order";
