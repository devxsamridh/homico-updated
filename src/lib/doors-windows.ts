// Door & Window design catalog + price estimator.
// Categorized by material/type — material is implied by category.

export type DWCategory = "wooden-window" | "upvc-window" | "door";

export interface DWCategoryMeta {
  slug: DWCategory;
  label: string;
  shortLabel: string;
  description: string;
  material: string; // human-readable material implied
}

export const DW_CATEGORIES: DWCategoryMeta[] = [
  { slug: "wooden-window", label: "Wooden Windows", shortLabel: "Wooden", description: "Warm, classic teak & sal frames", material: "Wood" },
  { slug: "upvc-window", label: "UPVC Windows", shortLabel: "UPVC", description: "Weather-proof and energy-efficient", material: "UPVC" },
  
  { slug: "door", label: "Doors", shortLabel: "Doors", description: "Entrance, internal & statement doors", material: "Wood / Composite" },
];

export interface DWDesign {
  slug: string;
  name: string;
  category: DWCategory;
  tagline: string;
  cover: string;
  baseRatePerSqft: number; // ₹ per sqft
}

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const DW_DESIGNS: DWDesign[] = [
  // Wooden windows — real product photography
  { slug: "teak-casement", name: "Teak Casement", category: "wooden-window", tagline: "Warm teak double-leaf with brass handles", cover: "/designs/wooden/teak-casement.jpg", baseRatePerSqft: 540 },
  { slug: "heritage-arch-top", name: "Heritage Arch-Top", category: "wooden-window", tagline: "Polished teak with arched glass panels", cover: "/designs/wooden/heritage-arch-top.jpg", baseRatePerSqft: 640 },
  { slug: "arched-palladian", name: "Arched Palladian", category: "wooden-window", tagline: "Grand arch with sunburst transom", cover: "/designs/wooden/arched-palladian.jpg", baseRatePerSqft: 720 },
  { slug: "arched-cottage", name: "Arched Cottage", category: "wooden-window", tagline: "Tall arched frame with planter sill", cover: "/designs/wooden/arched-cottage.jpg", baseRatePerSqft: 700 },
  { slug: "grand-arched-mullion", name: "Grand Arched Mullion", category: "wooden-window", tagline: "Multi-panel arched bay with transoms", cover: "/designs/wooden/grand-arched-mullion.jpg", baseRatePerSqft: 760 },
  { slug: "french-double-door-window", name: "French Double Door", category: "wooden-window", tagline: "Glazed double-leaf with brass lever", cover: "/designs/wooden/french-double-door.jpg", baseRatePerSqft: 680 },
  { slug: "pine-cottage", name: "Pine Cottage", category: "wooden-window", tagline: "Light pine 6-pane double casement", cover: "/designs/wooden/pine-cottage.jpg", baseRatePerSqft: 420 },
  { slug: "plantation-shutter", name: "Plantation Shutter", category: "wooden-window", tagline: "Solid teak louvred shutter pair", cover: "/designs/wooden/plantation-shutter.jpg", baseRatePerSqft: 480 },
  { slug: "louvered-bayview", name: "Louvred Bay View", category: "wooden-window", tagline: "Four-panel teak with horizontal louvres", cover: "/designs/wooden/louvered-bayview.jpg", baseRatePerSqft: 560 },
  { slug: "teak-mesh-three", name: "Teak Mesh Trio", category: "wooden-window", tagline: "Three-panel teak with safety mesh glazing", cover: "/designs/wooden/teak-mesh-three.jpg", baseRatePerSqft: 520 },

  // UPVC windows — real product photography
  { slug: "upvc-casement-single", name: "Kitchen Casement", category: "upvc-window", tagline: "Slim white casement with trickle vent", cover: "/designs/upvc/casement-single.jpg", baseRatePerSqft: 360 },
  { slug: "upvc-sliding-cabin", name: "Cabin Slider", category: "upvc-window", tagline: "Two-track sliding sash with grids", cover: "/designs/upvc/sliding-cabin.jpg", baseRatePerSqft: 320 },
  { slug: "upvc-georgian-triple", name: "Georgian Triple", category: "upvc-window", tagline: "Three-panel Georgian-bar casement", cover: "/designs/upvc/georgian-triple.jpg", baseRatePerSqft: 420 },
  { slug: "upvc-french-casement", name: "French Casement", category: "upvc-window", tagline: "Double-leaf French casement with view", cover: "/designs/upvc/french-casement.jpg", baseRatePerSqft: 460 },
  { slug: "upvc-sliding-grid", name: "Grid Slider", category: "upvc-window", tagline: "Two-panel sliding window with colonial grid", cover: "/designs/upvc/sliding-grid.jpg", baseRatePerSqft: 300 },
  { slug: "upvc-leaded-triple", name: "Leaded Triple", category: "upvc-window", tagline: "Three-panel casement with leaded glass", cover: "/designs/upvc/leaded-triple.jpg", baseRatePerSqft: 480 },
  { slug: "upvc-tilt-turn-trio", name: "Tilt & Turn Trio", category: "upvc-window", tagline: "Three-panel tilt-and-turn for full ventilation", cover: "/designs/upvc/tilt-turn-trio.jpg", baseRatePerSqft: 520 },
  { slug: "upvc-cottage-transom", name: "Cottage Transom", category: "upvc-window", tagline: "Cottage-style with top transom vents", cover: "/designs/upvc/cottage-transom.jpg", baseRatePerSqft: 440 },
  { slug: "upvc-heritage-double", name: "Heritage Double", category: "upvc-window", tagline: "Heritage double casement with Georgian bars", cover: "/designs/upvc/heritage-double.jpg", baseRatePerSqft: 470 },
  // Doors — real product photography
  { slug: "teak-brick-panel-door", name: "Teak Brick Panel", category: "door", tagline: "Solid teak with carved brickwork accent panel", cover: "/designs/doors/teak-brick-panel.jpg", baseRatePerSqft: 760 },
  { slug: "modern-inlay-door", name: "Modern Inlay", category: "door", tagline: "Contemporary geometric grooved inlay", cover: "/designs/doors/modern-inlay.jpg", baseRatePerSqft: 540 },
  { slug: "classic-six-panel-door", name: "Classic Six Panel", category: "door", tagline: "Traditional 6-panel oak with bronze knob", cover: "/designs/doors/classic-six-panel.jpg", baseRatePerSqft: 580 },
  { slug: "walnut-horizontal-flush-door", name: "Walnut Horizontal", category: "door", tagline: "Walnut flush with horizontal grooves", cover: "/designs/doors/walnut-horizontal-flush.jpg", baseRatePerSqft: 500 },
  { slug: "heritage-plank-frame-door", name: "Heritage Plank Frame", category: "door", tagline: "Ribbed planks with ornate heritage casing", cover: "/designs/doors/heritage-plank-frame.jpg", baseRatePerSqft: 820 },
  { slug: "curved-walnut-door", name: "Curved Walnut", category: "door", tagline: "Sweeping curved relief on walnut", cover: "/designs/doors/curved-walnut.jpg", baseRatePerSqft: 640 },
  { slug: "carved-leaf-louvre-door", name: "Carved Leaf Louvre", category: "door", tagline: "Hand-carved leaf motif beside fine louvres", cover: "/designs/doors/carved-leaf-louvre.jpg", baseRatePerSqft: 880 },
  { slug: "hourglass-carved-door", name: "Hourglass Carved", category: "door", tagline: "Sculpted hourglass relief in teak", cover: "/designs/doors/hourglass-carved.jpg", baseRatePerSqft: 700 },
  { slug: "walnut-grid-flush-door", name: "Walnut Grid Flush", category: "door", tagline: "Minimal walnut flush with cross grooves", cover: "/designs/doors/walnut-grid-flush.jpg", baseRatePerSqft: 480 },
  { slug: "white-five-panel-door", name: "White Five Panel", category: "door", tagline: "Crisp white painted 5-panel internal door", cover: "/designs/doors/white-five-panel.jpg", baseRatePerSqft: 460 },
];

export const getDesignBySlug = (slug: string) => DW_DESIGNS.find((d) => d.slug === slug);
export const getCategoryMeta = (slug: DWCategory) => DW_CATEGORIES.find((c) => c.slug === slug)!;

export interface DWEstimateInput {
  design: DWDesign;
  heightIn: number;
  widthIn: number;
  quantity: number;
}

export interface DWEstimate {
  sqft: number;
  unitPrice: number;
  low: number;
  high: number;
}

export function estimateDW(input: DWEstimateInput): DWEstimate {
  const sqftEach = Math.max(0, (input.heightIn * input.widthIn) / 144);
  const unitPrice = sqftEach * input.design.baseRatePerSqft;
  const totalAvg = unitPrice * Math.max(1, input.quantity);
  return {
    sqft: Math.round(sqftEach * 100) / 100,
    unitPrice: Math.round(unitPrice),
    low: Math.round(totalAvg * 0.9),
    high: Math.round(totalAvg * 1.15),
  };
}
