-- Add size_stock JSONB column for per-size inventory management
-- Structure: [{ name: "S", stock: 10, visible: true }, { name: "M", stock: 5, visible: true }, ...]

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_stock JSONB DEFAULT '[]'::jsonb;

-- For existing products with sizes but no size_stock, populate from their sizes array
-- Distributes total stock evenly across sizes
UPDATE public.products
SET size_stock = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', s,
      'stock', GREATEST(0, FLOOR(stock::numeric / GREATEST(1, array_length(sizes, 1)))),
      'visible', true
    )
  )
  FROM unnest(sizes) AS s
)
WHERE sizes IS NOT NULL
  AND array_length(sizes, 1) > 0
  AND (size_stock IS NULL OR size_stock = '[]'::jsonb OR jsonb_array_length(size_stock) = 0);
