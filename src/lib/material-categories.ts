// Material category groups for the Raw Materials module.
// Each group maps to one or more `materials.category` values from the DB.

export interface MaterialGroup {
  slug: string;
  name: string;
  description: string;
  image: string;
  categories: string[]; // matches `materials.category`
}

export const MATERIAL_GROUPS: MaterialGroup[] = [
  {
    slug: "building-materials",
    name: "Building Materials",
    description: "Cement, concrete, bricks, blocks, sand & aggregate",
    image: "/materials/cat-building-materials.jpg",
    categories: ["foundation", "plastering", "masonry", "sand", "aggregate"],
  },
  {
    slug: "industrial-steel",
    name: "Industrial & Steel Supplies",
    description: "TMT bars, structural steel, binding wire & mesh",
    image: "/materials/cat-industrial-steel.jpg",
    categories: ["structural"],
  },
  {
    slug: "hardware-accessories",
    name: "Hardware & Accessories",
    description: "Hinges, locks, fasteners & safety gear",
    image: "/materials/cat-hardware-accessories.jpg",
    categories: ["hardware", "safety"],
  },
  {
    slug: "electricals",
    name: "Electricals",
    description: "Wires, switches, MCBs, sockets & conduits",
    image: "/materials/cat-electricals.jpg",
    categories: ["electrical"],
  },
  {
    slug: "adhesive-bonding",
    name: "Adhesive & Bonding Solutions",
    description: "Adhesives, sealants, putty & bonding agents",
    image: "/materials/cat-adhesive-bonding.jpg",
    categories: ["finishing"],
  },
  {
    slug: "kitchen",
    name: "Kitchen Fixtures & Accessories",
    description: "Cabinets, countertops, sinks & chimneys",
    image: "/materials/cat-kitchen.jpg",
    categories: ["kitchen"],
  },
  {
    slug: "lighting",
    name: "Lighting",
    description: "LED bulbs, tube lights, fans & fixtures",
    image: "/materials/cat-lighting.jpg",
    categories: ["lighting"],
  },
  {
    slug: "ceiling-solutions",
    name: "Ceiling Solutions",
    description: "Gypsum boards, false ceiling & roof tiles",
    image: "/materials/cat-ceiling-solutions.jpg",
    categories: ["roofing"],
  },
  {
    slug: "paints",
    name: "Paints",
    description: "Interior, exterior, primer & wood polish",
    image: "/materials/cat-paints.jpg",
    categories: ["painting"],
  },
  {
    slug: "sanitary-bath",
    name: "Sanitary & Bath Fittings",
    description: "WCs, basins, faucets, showers & pipes",
    image: "/materials/cat-sanitary-bath.jpg",
    categories: ["bathroom", "plumbing"],
  },
  {
    slug: "plywood-boards",
    name: "Plywood & Boards",
    description: "Plywood, HDHMR, BWP, doors, windows & laminates",
    image: "/materials/cat-plywood-boards.jpg",
    categories: ["wood", "doors-windows"],
  },
  {
    slug: "water-proofing",
    name: "Water Proofing",
    description: "Waterproofing chemicals, coatings & membranes",
    image: "/materials/cat-water-proofing.jpg",
    categories: ["waterproofing"],
  },
  {
    slug: "tools",
    name: "Tools",
    description: "Hand tools, power tools & site equipment",
    image: "/materials/cat-tools.jpg",
    categories: ["tools"],
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  foundation: "Foundation",
  structural: "Structural",
  masonry: "Masonry",
  plastering: "Plastering",
  "doors-windows": "Doors & Windows",
  electrical: "Electrical",
  lighting: "Lighting",
  plumbing: "Plumbing",
  bathroom: "Bathroom",
  kitchen: "Kitchen",
  flooring: "Flooring",
  stone: "Marble & Granite",
  wood: "Wood & Plywood",
  painting: "Painting",
  finishing: "Finishing & Adhesives",
  roofing: "Ceiling & Roofing",
  waterproofing: "Waterproofing",
  hardware: "Hardware",
  tools: "Tools",
  safety: "Safety Gear",
  sand: "Sand",
  aggregate: "Aggregate",
};

export const getGroupForCategory = (category: string): MaterialGroup | undefined =>
  MATERIAL_GROUPS.find((g) => g.categories.includes(category));

// Delivery type: bulky/heavy categories ship from local hubs (same/next day),
// the rest from central warehouses (3-5 days).
const LOCAL_CATEGORIES = new Set([
  "foundation",
  "structural",
  "masonry",
  "plastering",
  "sand",
  "aggregate",
  "roofing",
]);

export type DeliveryType = "local" | "warehouse";

export const getDeliveryType = (category: string): DeliveryType =>
  LOCAL_CATEGORIES.has(category) ? "local" : "warehouse";
