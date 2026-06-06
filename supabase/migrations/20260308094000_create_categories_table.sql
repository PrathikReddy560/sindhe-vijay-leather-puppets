-- Create the categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for categories"
  ON public.categories FOR SELECT
  USING (true);

-- Allow admin write access (insert, update, delete)
CREATE POLICY "Allow admin write access for categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- Seed initial categories in the specified order
INSERT INTO public.categories (slug, name, display_order) VALUES
  ('lamps', 'Lamps', 1),
  ('gifting-purpose', 'Gifting Purpose', 2),
  ('paintings', 'Paintings', 3),
  ('story-paintings', 'Story Paintings', 4),
  ('hangings', 'Hangings', 5),
  ('puppets', 'Puppets', 6),
  ('new-innovated-products', 'New Innovated Products', 7),
  -- Legacy categories to prevent breaking existing mock data/database rows
  ('big-paintings', 'Big Paintings — Pure Leather', 8),
  ('medium-paintings', 'Medium Paintings', 9),
  ('hanging-lamps', 'Hanging Lamps', 10)
ON CONFLICT (slug) DO NOTHING;
