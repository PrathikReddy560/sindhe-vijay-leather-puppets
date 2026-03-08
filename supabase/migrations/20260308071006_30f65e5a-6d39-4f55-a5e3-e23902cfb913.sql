
-- Create product category enum
CREATE TYPE public.product_category AS ENUM ('big-paintings', 'medium-paintings', 'hanging-lamps');

-- Create inventory tag enum
CREATE TYPE public.inventory_tag AS ENUM ('in-stock', 'made-to-order', 'limited-edition');

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  long_description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  category product_category NOT NULL DEFAULT 'medium-paintings',
  inventory_tag inventory_tag NOT NULL DEFAULT 'in-stock',
  image_day TEXT NOT NULL DEFAULT '',
  image_night TEXT,
  dimensions TEXT,
  material TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

-- Create user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admin policies for products
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update trigger for products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Anyone can view product images
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Admins can upload product images
CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update product images
CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete product images
CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Seed products from existing catalog
INSERT INTO public.products (slug, name, description, long_description, price, category, inventory_tag, image_day, image_night, dimensions, material, featured) VALUES
('big-ganesha', 'Lord Ganesha — Pure Leather Painting', 'Magnificent handmade leather artwork depicting Lord Ganesha in a powerful and graceful pose, crafted in rich traditional Indian folk-art style.', 'This magnificent handmade leather artwork depicts Lord Ganesha in a powerful and graceful pose, created in a rich traditional Indian folk-art style. The artwork symbolizes wisdom, prosperity, protection, and positive energy, making it an auspicious centerpiece for any space. Crafted exclusively on 100% pure goat leather, this painting has a unique natural quality — the leather gently reflects light, enhancing colors, depth, and fine details. Painted using natural camel drawing inks, every detail is meticulously hand-drawn and hand-painted, showcasing exceptional craftsmanship.', 25000, 'big-paintings', 'made-to-order', '/images/products/big-ganesha.jpg', NULL, '35" × 25"', '100% Pure Goat Leather, Natural Camel Drawing Inks', true),
('big-dashavatara', 'Dashavatara — Ten Avatars of Vishnu', 'Magnificent painting depicting the ten divine incarnations of Lord Vishnu, representing the eternal fight between dharma and adharma.', 'This magnificent handmade leather painting depicts the Dashavatara — the ten divine incarnations of Lord Vishnu, representing the eternal fight between dharma (righteousness) and adharma (evil). According to Hindu tradition, whenever cosmic balance is disturbed, Lord Vishnu incarnates on Earth to restore harmony and protect creation. Each incarnation is beautifully framed and richly detailed, symbolizing a specific era and purpose in the evolution of life and consciousness. Crafted on 100% pure goat leather using natural camel drawing inks, this artwork reflects light naturally, enhancing depth, vibrancy, and fine detailing.', 18000, 'big-paintings', 'made-to-order', '/images/products/big-dashavatara.jpg', NULL, '23" × 31"', '100% Pure Goat Leather, Natural Camel Drawing Inks', true),
('big-shiva-parivar', 'Shiva Parivar — Divine Family', 'Lord Shiva with Goddess Parvati, Lord Ganesha and Lord Kartikeya — representing family unity, balance, and cosmic harmony.', 'This magnificent handmade leather painting beautifully depicts Lord Shiva with Goddess Parvati and their children, Lord Ganesha and Lord Kartikeya (Murugan) — together known as the Shiva Parivar. The artwork represents family unity, balance, protection, devotion, and cosmic harmony. Created on 100% pure goat leather, this artwork naturally reflects light, enhancing depth, color richness, and fine detailing. Painted using natural camel drawing inks, every figure and ornament is hand-drawn and hand-painted, showcasing exceptional craftsmanship and traditional Indian folk-art heritage.', 28000, 'big-paintings', 'made-to-order', '/images/products/big-shiva-parivar.jpg', NULL, '30.5" × 25"', '100% Pure Goat Leather, Natural Camel Drawing Inks', false),
('big-krishna-leela', 'Krishna Divine Leelas', 'Sacred narrative painting depicting the divine leelas of Lord Krishna with six circular panels and central Kaliya Mardana scene.', 'This magnificent handmade leather painting narrates the divine leelas (sacred acts) of Lord Krishna, inspired by the Bhagavata Purana. At the center is the powerful scene of Kaliya Mardana, surrounded by six circular panels, each depicting an important episode from Krishna''s childhood and divine life — Putana Moksha, Vishvarupa Darshan, Rasa Leela, Govardhana Giri, Kaliya Mardana, and Krishna with Cows and Nature. Together, these scenes form a visual scripture, illustrating how the Divine protects devotees, destroys evil, restores balance, and teaches humanity the path of dharma, devotion, humility, and love.', 32000, 'big-paintings', 'limited-edition', '/images/products/big-krishna-leela.jpg', NULL, '30" × 20"', '100% Pure Goat Leather, Natural Camel Drawing Inks', true),
('big-krishna-cow', 'Lord Krishna with Cow', 'Lord Krishna playing the flute beside a sacred cow, symbolizing divine love, compassion, and harmony with nature.', 'This exquisite handmade leather painting portrays Lord Krishna playing the flute, standing gracefully beside a sacred cow, surrounded by rich ornamental patterns inspired by traditional Indian folk art. The scene represents divine love, compassion, protection, and harmony with nature. Krishna, shown as the eternal cowherd of Vrindavan, symbolizes supreme consciousness expressed through simplicity and joy. The cow beside Him represents motherly abundance, purity, and selfless giving. Created on 100% pure goat leather using natural camel drawing inks, featuring rich tones and long-lasting beauty.', 21000, 'big-paintings', 'made-to-order', '/images/products/big-krishna-cow.jpg', NULL, '34" × 26"', '100% Pure Goat Leather, Natural Camel Drawing Inks', false),
('big-ramayana', 'Ramayana Epic — 11 Stories', 'Complete visual narration of the Ramayana divided into 11 detailed panels, each illustrating a key episode from the life of Lord Rama.', 'This magnificent handmade leather painting presents a complete visual narration of the Ramayana, one of India''s greatest spiritual epics. The artwork is divided into 11 detailed square panels, each illustrating a key episode from the life of Lord Rama — from birth to coronation — conveying timeless moral and spiritual values. Created in a traditional Indian folk-art style, this painting functions as a visual scripture. Handcrafted on 100% pure goat leather using natural camel drawing inks, each panel is hand-drawn and hand-painted, making every artwork unique.', 40000, 'big-paintings', 'limited-edition', '/images/products/big-ramayana.jpg', NULL, '26" × 36"', '100% Pure Goat Leather, Natural Camel Drawing Inks', true),
('big-hanuman-battle', 'Hanuman in Battle — Ramayana', 'Powerful depiction of Lord Hanuman in fierce battle, highlighting unmatched courage and devotion during Rama''s divine mission.', 'This powerful handmade leather painting depicts a dramatic episode from the Ramayana, highlighting the unmatched courage and devotion of Lord Hanuman during Rama''s divine mission to defeat evil and restore righteousness. At the center, Hanuman is shown in a fierce battle, overpowering a mighty demon who symbolizes ego, arrogance, and adharma. On the right side, Lord Rama stands calm and composed, holding his bow, representing dharma, moral authority, and divine guidance. The painting beautifully contrasts Rama''s serenity with Hanuman''s dynamic strength. Created on 100% pure goat leather using natural camel drawing inks.', 34000, 'big-paintings', 'limited-edition', '/images/products/big-hanuman-battle.jpg', NULL, '30" × 26"', '100% Pure Goat Leather, Natural Camel Drawing Inks', false),
('med-ganesha', 'Lord Ganesha — Medium Painting', 'Vibrant Lord Ganesha in traditional Indian folk-art style with intricate detailing and harmonious color combinations.', 'This handcrafted artwork beautifully depicts Lord Ganesha in a vibrant traditional Indian folk-art style. Created on genuine leather, the painting showcases intricate detailing, rich patterns, and harmonious color combinations that reflect India''s cultural heritage. Natural camel drawing inks are used to achieve long-lasting colors and fine precision, giving the artwork an authentic and timeless appeal.', 3500, 'medium-paintings', 'in-stock', '/images/products/med-ganesha.jpg', NULL, '30" × 14"', 'Genuine Leather, Natural Camel Drawing Inks', false),
('med-floral', 'Floral Creepers Artwork', 'Vibrant traditional floral and creeper design with blooming flowers emerging from a decorative pot.', 'This exquisite handmade leather artwork features a vibrant traditional floral and creeper design, inspired by Indian folk art. The composition showcases blooming flowers emerging gracefully from a decorative pot, symbolizing growth, prosperity, harmony, and positivity. Crafted on genuine leather using natural camel drawing inks, the artwork stands out with its rich colors, fine detailing, and symmetrical patterns.', 3000, 'medium-paintings', 'in-stock', '/images/products/med-floral.jpg', NULL, '29" × 10"', 'Genuine Leather, Natural Camel Drawing Inks', false),
('med-radha-krishna', 'Radha Krishna — Divine Love', 'Exquisite portrayal of Radha and Krishna symbolizing divine love, harmony, and eternal togetherness.', 'This exquisite handmade leather artwork beautifully portrays Radha and Krishna in a vibrant traditional Indian folk-art style. The scene symbolizes divine love, harmony, devotion, and eternal togetherness, surrounded by richly detailed floral patterns and a graceful tree motif. Crafted on genuine leather using natural camel drawing inks, the artwork features intricate line work, bold colors, and exceptional detailing.', 3500, 'medium-paintings', 'in-stock', '/images/products/med-radha-krishna.jpg', NULL, '30" × 14"', 'Genuine Leather, Natural Camel Drawing Inks', true),
('med-elephant', 'Royal Elephant Motif', 'Beautifully decorated elephant symbolizing strength, wisdom, prosperity, and good fortune.', 'This stunning handmade leather artwork features a beautifully decorated elephant motif, inspired by traditional Indian folk art. The elephant symbolizes strength, wisdom, prosperity, and good fortune, making this artwork a powerful and positive décor element. Rendered on genuine leather using natural camel drawing inks, the painting showcases intricate floral patterns, flowing creepers, and rich symmetrical detailing.', 3500, 'medium-paintings', 'in-stock', '/images/products/med-elephant.jpg', NULL, '30" × 14"', 'Genuine Leather, Natural Camel Drawing Inks', false),
('med-radha-krishna-landscape', 'Radha Krishna — Landscape', 'Lively depiction of Radha and Krishna with gopis in a lush natural setting, celebrating divine love and joy.', 'This beautiful handmade leather artwork depicts Radha and Krishna in a lively traditional Indian folk-art style, celebrating divine love, devotion, joy, and eternal togetherness. The scene captures Krishna playing the flute, surrounded by Radha and gopis in a lush natural setting filled with flowering trees and rhythmic movement. Crafted on genuine leather using natural camel drawing inks, the artwork features rich colors, intricate detailing, and graceful expressions.', 4000, 'medium-paintings', 'in-stock', '/images/products/med-radha-krishna-small.jpg', NULL, '17" × 27"', 'Genuine Leather, Natural Camel Drawing Inks', false),
('med-fish-floral', 'Fish & Floral Design', 'Traditional fish and floral creeper design symbolizing prosperity, abundance, and good fortune.', 'This beautiful handmade leather artwork features a vibrant traditional fish and floral creeper design, inspired by Indian folk art. The paired fishes at the base symbolize prosperity, abundance, harmony, and good fortune, while the flowing floral vines represent growth and continuity. Crafted on genuine leather using natural camel drawing inks, the artwork showcases rich colors, intricate patterns, and detailed handwork.', 3000, 'medium-paintings', 'in-stock', '/images/products/med-fish-floral.jpg', NULL, '30" × 14"', 'Genuine Leather, Natural Camel Drawing Inks', false),
('med-birds-pot-fish', 'Birds, Pot & Fish Motif', 'Rich folk-art composition with two birds, a decorative pot with fishes, and graceful floral creepers.', 'This exquisite handmade leather artwork features a rich traditional Indian folk-art composition showcasing two birds on either side of a decorative pot, with fishes depicted inside the pot, surrounded by graceful floral creepers. The artwork symbolizes prosperity, harmony, abundance, balance, and positive energy.', 3000, 'medium-paintings', 'in-stock', '/images/products/med-birds-pot-fish.jpg', NULL, '30" × 14"', 'Genuine Leather, Natural Camel Drawing Inks', false),
('lamp-1', 'Traditional Hanging Lamp — Style 1', 'Hand-painted leather hanging lamp casting warm, intricate shadow patterns when illuminated.', 'This stunning 12-inch leather hanging lamp transforms any room into a shadow theater. The leather is perforated in traditional folk-art patterns that cast mesmerizing shadows across walls and ceilings when illuminated. By day, it''s an elegant decorative piece; by night, it becomes a living art installation. Hand-painted with natural camel drawing inks on genuine leather, this lamp is a perfect blend of heritage craftsmanship and functional décor.', 2500, 'hanging-lamps', 'in-stock', '/images/products/lamp-1.jpg', '/images/products/lamp-1-night.jpg', '12" diameter', 'Genuine Leather, Brass Frame, Natural Dyes', true),
('lamp-2', 'Traditional Hanging Lamp — Style 2', 'Beautifully crafted leather lamp with intricate perforations for stunning light play.', 'This handcrafted 12-inch leather hanging lamp features intricate perforations that create a breathtaking play of light and shadow. The carefully placed patterns cast mesmerizing designs across walls and ceilings when illuminated, transforming any room into an ambient space. Each lamp is hand-painted with natural camel drawing inks, ensuring rich colors and long-lasting beauty.', 2500, 'hanging-lamps', 'in-stock', '/images/products/lamp-2.jpg', '/images/products/lamp-2-night.jpg', '12" diameter', 'Genuine Leather, Brass Frame, Natural Dyes', false),
('lamp-3', 'Traditional Hanging Lamp — Style 3', 'Heritage leather lamp with folk-art motifs, creating ambient light patterns.', 'This beautiful 12-inch leather hanging lamp is adorned with traditional Indian folk-art motifs. When illuminated, the carefully perforated leather casts warm, intricate shadow patterns that fill the room with an enchanting ambiance. Hand-painted using natural camel drawing inks on genuine leather, each lamp is a unique piece of functional art.', 2500, 'hanging-lamps', 'in-stock', '/images/products/lamp-3.jpg', '/images/products/lamp-3-night.jpg', '12" diameter', 'Genuine Leather, Brass Frame, Natural Dyes', false),
('lamp-4', 'Traditional Hanging Lamp — Style 4', 'Artisan leather lamp with vibrant painted designs and mesmerizing shadow effects.', 'This artisan 12-inch leather hanging lamp features vibrant painted designs inspired by centuries-old Indian folk art. The detailed perforations and natural dye painting create a stunning visual experience both day and night. During the day, it serves as an elegant decorative accent; at night, it transforms into a magical light source casting intricate shadow patterns.', 2500, 'hanging-lamps', 'in-stock', '/images/products/lamp-4.jpg', '/images/products/lamp-4-night.jpg', '12" diameter', 'Genuine Leather, Brass Frame, Natural Dyes', false),
('lamp-5', 'Traditional Hanging Lamp — Style 5', 'Handcrafted leather lamp with mythological motifs and warm ambient lighting.', 'This handcrafted 12-inch leather hanging lamp showcases mythological motifs from Indian tradition. Each perforation is carefully placed to create a harmonious pattern of light and shadow when illuminated. The natural camel drawing inks used in painting ensure the colors remain vibrant and authentic for years to come.', 2500, 'hanging-lamps', 'in-stock', '/images/products/lamp-5.jpg', '/images/products/lamp-5-night.jpg', '12" diameter', 'Genuine Leather, Brass Frame, Natural Dyes', false),
('lamp-6', 'Traditional Hanging Lamp — Style 6', 'Elegant leather hanging lamp with detailed folk patterns and enchanting shadow play.', 'This elegant 12-inch leather hanging lamp features detailed folk patterns that have been passed down through generations of artisans. The combination of hand-painting and precision perforation creates a lamp that is both a stunning decorative piece and a functional light source. When lit, the shadows dance across walls creating an atmosphere of warmth and cultural richness.', 2500, 'hanging-lamps', 'in-stock', '/images/products/lamp-6.jpg', '/images/products/lamp-6-night.jpg', '12" diameter', 'Genuine Leather, Brass Frame, Natural Dyes', false);
