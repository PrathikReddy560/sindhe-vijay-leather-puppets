-- Fix: Convert products.category from restrictive enum to TEXT
-- This allows dynamic categories managed via the categories table.

-- Step 1: Change the column type from enum to TEXT
ALTER TABLE public.products
  ALTER COLUMN category TYPE TEXT USING category::TEXT;

-- Step 2: Drop the now-unused enum type
DROP TYPE IF EXISTS public.product_category;

-- Step 3: Set a CHECK constraint to ensure category is not empty (optional safety)
ALTER TABLE public.products
  ADD CONSTRAINT products_category_not_empty CHECK (category <> '');
