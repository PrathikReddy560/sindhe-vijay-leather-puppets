-- 1. Create or recreate the categories table to ensure it exists
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for categories (if not already enabled)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access for categories
CREATE POLICY "Allow public read access for categories"
  ON public.categories FOR SELECT
  USING (true);

-- Allow admin write access for categories
CREATE POLICY "Allow admin write access for categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- Seed default categories with display orders
INSERT INTO public.categories (slug, name, display_order) VALUES
  ('lamps', 'Lamps', 1),
  ('gifting-purpose', 'Gifting Purpose', 2),
  ('paintings', 'Paintings', 3),
  ('story-paintings', 'Story Paintings', 4),
  ('hangings', 'Hangings', 5),
  ('puppets', 'Puppets', 6),
  ('new-innovated-products', 'New Innovated Products', 7),
  ('big-paintings', 'Big Paintings — Pure Leather', 8),
  ('medium-paintings', 'Medium Paintings', 9),
  ('hanging-lamps', 'Hanging Lamps', 10)
ON CONFLICT (slug) DO NOTHING;


-- 2. Add discount_price column to products table if it doesn't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_price INT;


-- 3. Create the showcase_videos table
CREATE TABLE IF NOT EXISTS public.showcase_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.showcase_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for showcase videos"
  ON public.showcase_videos FOR SELECT
  USING (true);

CREATE POLICY "Allow admin write access for showcase videos"
  ON public.showcase_videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );


-- 4. Create the art_stories table
CREATE TABLE IF NOT EXISTS public.art_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.art_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for art stories"
  ON public.art_stories FOR SELECT
  USING (true);

CREATE POLICY "Allow admin write access for art stories"
  ON public.art_stories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );


-- 5. Create the events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  stall_no TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Allow admin write access for events"
  ON public.events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );


-- 6. Create the achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for achievements"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "Allow admin write access for achievements"
  ON public.achievements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );
