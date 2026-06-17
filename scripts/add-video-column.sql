-- Add video and size_chart columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_chart JSONB;
