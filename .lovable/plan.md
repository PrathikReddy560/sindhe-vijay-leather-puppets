

## Sindhe Vijay Leather Puppets — E-commerce Website

### Design System
- **Backgrounds:** Warm parchment (#F5F5DC), off-white
- **Accents:** Burnt Orange (#CC5500), Maroon (#800000), Antique Gold (#C9A94E)
- **Fonts:** Playfair Display (headings) + Inter (body) via Google Fonts
- **Feel:** Heritage Modern — boutique gallery, clean layout, rich cultural textures

---

### Pages & Features

#### 1. Home Page
- Full-width hero with tagline *"The Dance of Shadows & Light"* and CTA to Shop
- "Craftsmanship" story section — goat-hide process, natural dyes, artisan process
- Featured products carousel
- Authenticity callout bar ("Certified Handmade" · "8th Generation Heritage")

#### 2. Shop / Catalog
- Responsive product grid with category filters: Traditional Puppets, Lampshades, Mythological Wall Art, Leather Jewelry
- Product cards with image, name, price, and inventory tags ("Made to Order" / "Limited Edition")
- Click through to product detail pages

#### 3. Product Detail Page
- Large product imagery with **Day & Night toggle** (switches between normal and backlit/illuminated view)
- "Certified Handmade" and "8th Generation Heritage" badges
- Inventory tag display
- Add to cart button
- Related products section

#### 4. Heritage Page
- Storytelling layout: the Sindhe family legacy, Nimmalakunta village, folk art preservation
- Timeline or scroll-based narrative with imagery placeholders

#### 5. Contact / Custom Orders
- Contact form (name, email, message) with validation
- WhatsApp button for bespoke commissions
- Business information section

#### 6. Shopping Cart & Checkout (Frontend Only)
- **Slide-out Shopping Bag** from the right side for quick cart management
- **Checkout page** with 3 steps:
  1. Order Summary (items, price breakdown)
  2. Shipping Information (validated fields: name, phone, address, pincode)
  3. Payment Selection (UI mockup for UPI, Cards, Net Banking — no real processing)
- SSL trust badges and secure checkout UI
- **Thank You page** with mock Order ID, receipt summary, and social sharing buttons

#### 7. Authentication
- Login / Sign up pages (email-based, via Supabase)
- User profile with order history view
- Password reset flow
- *Note: Requires connecting Supabase/Cloud before implementation*

---

### Cross-Cutting Concerns
- **Mobile-first** responsive design throughout
- **Lazy loading** for product images
- **SEO meta tags** for key pages (Handmade Leather Puppets, Indian Shadow Puppetry, etc.)
- **Hardcoded product data** — easily updatable later
- Products stored as TypeScript data files for fast iteration

