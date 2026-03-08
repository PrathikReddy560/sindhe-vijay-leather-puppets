export type ProductCategory = "puppets" | "lampshades" | "wall-art" | "jewelry";
export type InventoryTag = "in-stock" | "made-to-order" | "limited-edition";

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: ProductCategory;
  inventoryTag: InventoryTag;
  images: { day: string; night: string };
  dimensions?: string;
  material: string;
  featured?: boolean;
}

export const categories: { value: ProductCategory; label: string }[] = [
  { value: "puppets", label: "Traditional Puppets" },
  { value: "lampshades", label: "Hand-painted Lampshades" },
  { value: "wall-art", label: "Mythological Wall Art" },
  { value: "jewelry", label: "Leather Jewelry" },
];

export const products: Product[] = [
  {
    id: "puppet-rama",
    name: "Lord Rama — Shadow Puppet",
    description: "Intricately hand-carved Rama figure from the Ramayana, crafted from treated goat hide with natural dyes.",
    longDescription: "This magnificent Lord Rama shadow puppet is a masterpiece of 8th-generation craftsmanship from Nimmalakunta village. Each piece takes approximately 3 weeks to complete, involving the careful selection and treatment of goat hide, hand-punching of intricate perforations, and painting with natural mineral dyes that have been used for centuries. When illuminated from behind, Rama comes alive with a kaleidoscope of colors dancing through the translucent leather.",
    price: 8500,
    category: "puppets",
    inventoryTag: "made-to-order",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    dimensions: "24\" × 14\"",
    material: "Treated goat hide, natural mineral dyes, bamboo sticks",
    featured: true,
  },
  {
    id: "puppet-sita",
    name: "Goddess Sita — Shadow Puppet",
    description: "Elegant Sita figure adorned with traditional jewelry motifs, painted using centuries-old natural dye techniques.",
    longDescription: "This exquisite Goddess Sita shadow puppet showcases the finest details of Tholu Bommalata artistry. The delicate jewelry patterns, the flowing garments, and the graceful posture are all achieved through painstaking hand-perforation and painting. The natural dyes — derived from turmeric, indigo, and pomegranate — create colors that deepen and enrich with age.",
    price: 7500,
    category: "puppets",
    inventoryTag: "made-to-order",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    dimensions: "22\" × 12\"",
    material: "Treated goat hide, natural mineral dyes, bamboo sticks",
    featured: true,
  },
  {
    id: "puppet-hanuman",
    name: "Hanuman — Giant Shadow Puppet",
    description: "A striking large-format Hanuman puppet, perfect as a centerpiece for collectors and cultural enthusiasts.",
    longDescription: "This grand Hanuman shadow puppet stands at an impressive 36 inches, making it a true statement piece. The dynamic pose captures the devotion and strength of Hanuman, with every muscle and ornament rendered in extraordinary detail. The perforations are designed to create dramatic shadow effects when backlit.",
    price: 15000,
    category: "puppets",
    inventoryTag: "limited-edition",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    dimensions: "36\" × 20\"",
    material: "Treated goat hide, natural mineral dyes, bamboo sticks",
    featured: true,
  },
  {
    id: "puppet-ravana",
    name: "Ravana — Ten-Headed King",
    description: "Dramatic multi-headed Ravana puppet showcasing the pinnacle of shadow puppetry craftsmanship.",
    longDescription: "The ten-headed Ravana is among the most technically challenging puppets in the Tholu Bommalata tradition. Each head displays a distinct expression, and the intricate crown work requires weeks of careful perforation. This piece is a testament to the extraordinary skill passed down through eight generations of the Sindhe family.",
    price: 25000,
    category: "puppets",
    inventoryTag: "limited-edition",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    dimensions: "40\" × 28\"",
    material: "Treated goat hide, natural mineral dyes, bamboo sticks",
  },
  {
    id: "lamp-lotus",
    name: "Lotus Bloom Lampshade",
    description: "Hand-painted leather lampshade featuring lotus motifs. Casts warm, intricate shadow patterns when lit.",
    longDescription: "This stunning lotus lampshade transforms any room into a shadow theater. The leather is perforated in traditional patterns that cast mesmerizing shadows across walls and ceilings when illuminated. By day, it's an elegant decorative piece; by night, it becomes a living art installation.",
    price: 4500,
    category: "lampshades",
    inventoryTag: "in-stock",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    dimensions: "12\" diameter × 8\" height",
    material: "Treated goat hide, brass frame, natural dyes",
    featured: true,
  },
  {
    id: "lamp-peacock",
    name: "Peacock Dance Lampshade",
    description: "Vibrant peacock-themed lampshade with intricate tail feather perforations for stunning light play.",
    longDescription: "Inspired by the national bird of India, this lampshade features a magnificent peacock with its tail feathers spread in full display. The carefully placed perforations in the feather patterns create a breathtaking play of light and shadow, reminiscent of a peacock's iridescent display.",
    price: 5500,
    category: "lampshades",
    inventoryTag: "in-stock",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    dimensions: "14\" diameter × 10\" height",
    material: "Treated goat hide, brass frame, natural dyes",
  },
  {
    id: "lamp-elephant",
    name: "Royal Elephant Lampshade",
    description: "Majestic elephant procession lampshade, perfect for creating an ambient, heritage atmosphere.",
    longDescription: "This lampshade depicts a royal elephant procession, a scene straight from the courts of ancient Indian kingdoms. The detailed howdah, the caparisoned elephants, and the attendant figures are all rendered with remarkable precision.",
    price: 6000,
    category: "lampshades",
    inventoryTag: "made-to-order",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    dimensions: "16\" diameter × 12\" height",
    material: "Treated goat hide, brass frame, natural dyes",
  },
  {
    id: "art-ramayana-panel",
    name: "Ramayana Scene — Wall Panel",
    description: "Large narrative wall panel depicting key scenes from the Ramayana, hand-painted on treated leather.",
    longDescription: "This panoramic wall panel tells the story of the Ramayana through a series of connected scenes. From the Swayamvara to the battle of Lanka, each vignette is painted with the same techniques used by shadow puppet masters for centuries. The panel can be mounted on a wall or displayed on a stand.",
    price: 12000,
    category: "wall-art",
    inventoryTag: "made-to-order",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    dimensions: "48\" × 18\"",
    material: "Treated goat hide on wooden frame, natural dyes",
    featured: true,
  },
  {
    id: "art-mahabharata-set",
    name: "Mahabharata Warriors — Triptych",
    description: "Three-panel set featuring Arjuna, Krishna, and Bhishma from the great Indian epic.",
    longDescription: "This stunning triptych presents three iconic warriors of the Mahabharata in dramatic battle poses. Each panel is individually crafted and painted, yet together they form a cohesive narrative. The natural dyes ensure colors that age gracefully.",
    price: 18000,
    category: "wall-art",
    inventoryTag: "limited-edition",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    dimensions: "3 panels, each 16\" × 24\"",
    material: "Treated goat hide on wooden frame, natural dyes",
  },
  {
    id: "art-tree-of-life",
    name: "Tree of Life — Wall Hanging",
    description: "Ancient Tree of Life motif with birds, animals, and floral patterns in vibrant natural colors.",
    longDescription: "The Tree of Life is one of the most universal symbols in Indian art. This wall hanging features a magnificent tree populated with birds, deer, elephants, and flowers, all rendered in the distinctive Tholu Bommalata style. It's a celebration of life and nature.",
    price: 9500,
    category: "wall-art",
    inventoryTag: "in-stock",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    dimensions: "24\" × 36\"",
    material: "Treated goat hide on wooden frame, natural dyes",
  },
  {
    id: "jewel-earrings-peacock",
    name: "Peacock Feather Leather Earrings",
    description: "Lightweight hand-painted leather earrings with intricate peacock feather design.",
    longDescription: "These delicate earrings bring the art of Tholu Bommalata to wearable fashion. Each pair is individually hand-cut and painted with the same natural dyes used in puppet-making. The peacock feather design is a beloved motif in Indian decorative arts.",
    price: 1200,
    category: "jewelry",
    inventoryTag: "in-stock",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    material: "Treated goat hide, brass hooks, natural dyes",
    featured: true,
  },
  {
    id: "jewel-pendant-lotus",
    name: "Lotus Medallion Pendant",
    description: "Hand-carved leather pendant with sacred lotus design, on an adjustable cord.",
    longDescription: "This pendant features a sacred lotus carved from treated goat hide and painted with natural dyes. The intricate perforation work allows light to play through the design, creating a subtle glow effect. Comes on an adjustable waxed cotton cord.",
    price: 800,
    category: "jewelry",
    inventoryTag: "in-stock",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    material: "Treated goat hide, waxed cotton cord, natural dyes",
  },
  {
    id: "jewel-bracelet-tribal",
    name: "Tribal Pattern Leather Cuff",
    description: "Bold leather cuff bracelet with ancient tribal patterns hand-punched and painted.",
    longDescription: "This statement cuff features tribal patterns inspired by the ancient rock art of Andhra Pradesh. The designs are hand-punched into the leather and painted with earth-tone natural dyes, creating a piece that bridges prehistoric art with contemporary fashion.",
    price: 1500,
    category: "jewelry",
    inventoryTag: "in-stock",
    images: { day: "/placeholder.svg", night: "/placeholder.svg" },
    material: "Treated goat hide, brass clasp, natural dyes",
  },
];

export const getProductById = (id: string) => products.find((p) => p.id === id);
export const getProductsByCategory = (category: ProductCategory) => products.filter((p) => p.category === category);
export const getFeaturedProducts = () => products.filter((p) => p.featured);
