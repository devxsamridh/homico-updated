import {
  Wrench,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Sofa,
  ChefHat,
  Layers,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

export type ServiceGroup = "maintenance" | "renovation";

export interface HomeServiceCategory {
  slug: string;
  name: string;
  group: ServiceGroup;
  tagline: string;
  description: string;
  basePrice: number; // INR — inspection visit fee
  priceLabel?: string; // e.g. "Free visit"
  icon: LucideIcon;
  accent: string;
  cover: string;
  highlights: string[];
  rating: number;
  jobs: string;
}

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const HOME_SERVICES: HomeServiceCategory[] = [
  // ───────── Home Maintenance ─────────
  {
    slug: "plumbing",
    name: "Plumbing",
    group: "maintenance",
    tagline: "Leaks, fittings & installations",
    description: "Tap repair, pipe leaks, bathroom fittings, geyser install and more.",
    basePrice: 89,
    icon: Wrench,
    accent: "bg-blue-500/10 text-blue-600",
    cover: U("photo-1585704032915-c3400ca199e7"),
    highlights: ["Same-day visit", "Verified pros", "30-day warranty"],
    rating: 4.8,
    jobs: "5.4k+ done",
  },
  {
    slug: "electrical",
    name: "Electrical",
    group: "maintenance",
    tagline: "Wiring, switches, fans & lights",
    description: "Switchboard repair, fan & light install, MCB and inverter wiring.",
    basePrice: 89,
    icon: Zap,
    accent: "bg-amber-500/10 text-amber-600",
    cover: U("photo-1558449907-8b82b0264682"),
    highlights: ["Certified electricians", "Safety check", "30-day warranty"],
    rating: 4.8,
    jobs: "4.1k+ done",
  },
  {
    slug: "waterproofing",
    name: "Waterproofing",
    group: "maintenance",
    tagline: "Roof, walls & bathroom sealing",
    description: "Terrace, balcony, bathroom and external wall waterproofing with warranty.",
    basePrice: 149,
    icon: Droplets,
    accent: "bg-cyan-500/10 text-cyan-600",
    cover: U("photo-1558618666-fcd25c85cd64"),
    highlights: ["Leak detection", "Premium chemicals", "5-yr warranty"],
    rating: 4.7,
    jobs: "1.6k+ done",
  },
  {
    slug: "minor-repairs",
    name: "Minor Repairs",
    group: "maintenance",
    tagline: "Hinges, locks, patchwork & more",
    description: "Small fixes around the house — door hinges, locks, wall patches, broken fittings.",
    basePrice: 89,
    icon: Hammer,
    accent: "bg-orange-500/10 text-orange-600",
    cover: U("photo-1581094794329-c8112a89af12"),
    highlights: ["Quick fixes", "Tools included", "Per-visit pricing"],
    rating: 4.8,
    jobs: "3.2k+ done",
  },

  // ───────── Renovation & Interiors ─────────
  {
    slug: "interior-design",
    name: "Interior Design",
    group: "renovation",
    tagline: "Modern, minimal & luxury makeovers",
    description: "Share your room photos, pick a style — get expert design suggestions and a transparent cost estimate on-site.",
    basePrice: 199,
    icon: Sofa,
    accent: "bg-violet-500/10 text-violet-600",
    cover: U("photo-1616486338812-3dadae4b4ace"),
    highlights: ["3D mockups", "Style picker", "On-site quote"],
    rating: 4.9,
    jobs: "1.2k+ done",
  },
  {
    slug: "painting",
    name: "Painting",
    group: "renovation",
    tagline: "Interior & exterior painting",
    description: "Per-room interior painting, exterior weatherproof coatings.",
    basePrice: 0,
    priceLabel: "Free visit",
    icon: Paintbrush,
    accent: "bg-rose-500/10 text-rose-600",
    cover: U("photo-1562259949-e8e7689d7828"),
    highlights: ["Free site visit", "Premium paints", "Spotless finish"],
    rating: 4.9,
    jobs: "1.9k+ done",
  },
  {
    slug: "modular-kitchen",
    name: "Modular Kitchen",
    group: "renovation",
    tagline: "Custom-built modular kitchens",
    description: "Design and install modular kitchens with premium hardware, finishes and storage.",
    basePrice: 299,
    icon: ChefHat,
    accent: "bg-emerald-500/10 text-emerald-600",
    cover: U("photo-1556909114-f6e7ad7d3136"),
    highlights: ["3D layout", "Branded hardware", "10-yr warranty"],
    rating: 4.9,
    jobs: "640+ done",
  },
  {
    slug: "false-ceiling",
    name: "False Ceiling",
    group: "renovation",
    tagline: "Gypsum, POP & designer ceilings",
    description: "Gypsum board, POP and designer false ceilings with integrated lighting.",
    basePrice: 199,
    icon: Layers,
    accent: "bg-indigo-500/10 text-indigo-600",
    cover: U("photo-1600585154340-be6161a56a0c"),
    highlights: ["Cove lighting", "Premium boards", "Clean finish"],
    rating: 4.8,
    jobs: "980+ done",
  },
  {
    slug: "space-renovation",
    name: "Space Renovation",
    group: "renovation",
    tagline: "Full room or area makeovers",
    description: "End-to-end renovation of a single room or area — civil, electrical, finishing.",
    basePrice: 299,
    icon: LayoutGrid,
    accent: "bg-fuchsia-500/10 text-fuchsia-600",
    cover: U("photo-1600210492486-724fe5c67fb0"),
    highlights: ["Single-point ownership", "Project manager", "Milestone billing"],
    rating: 4.9,
    jobs: "520+ done",
  },
];

export const DESIGN_STYLES = [
  { value: "modern", label: "Modern", desc: "Clean lines, neutral palette, statement pieces" },
  { value: "minimal", label: "Minimal", desc: "Decluttered, functional, soft tones" },
  { value: "luxury", label: "Luxury", desc: "Premium finishes, rich textures, bespoke detail" },
] as const;

export const RENOVATION_INSPECTION_TIERS = [
  { value: 199, label: "Standard inspection", desc: "Single room or small area — design ideas + estimate" },
  { value: 299, label: "Full home inspection", desc: "Multi-room walkthrough with detailed plan" },
] as const;

export const QUOTATION_STATUS: Record<string, { label: string; tone: "secondary" | "default" | "destructive" }> = {
  pending: { label: "Awaiting your decision", tone: "secondary" },
  accepted: { label: "Accepted", tone: "default" },
  rejected: { label: "Rejected", tone: "destructive" },
};

export const TIME_SLOTS = [
  "08:00 – 10:00",
  "10:00 – 12:00",
  "12:00 – 14:00",
  "14:00 – 16:00",
  "16:00 – 18:00",
  "18:00 – 20:00",
];

export const getServiceBySlug = (slug: string) =>
  HOME_SERVICES.find((s) => s.slug === slug);

export const getServicesByGroup = (group: ServiceGroup) =>
  HOME_SERVICES.filter((s) => s.group === group);

export const formatServicePrice = (s: HomeServiceCategory): string => {
  if (s.basePrice === 0) return s.priceLabel ?? "Free";
  const inr = "₹" + Math.round(s.basePrice).toLocaleString("en-IN");
  return s.priceLabel ? `${inr}${s.priceLabel}` : inr;
};

export const STATUS_LABELS: Record<string, { label: string; tone: "secondary" | "default" | "destructive" }> = {
  pending: { label: "Booked", tone: "secondary" },
  confirmed: { label: "Inspection Scheduled", tone: "secondary" },
  quoted: { label: "Quotation Given", tone: "secondary" },
  accepted: { label: "Accepted", tone: "default" },
  in_progress: { label: "In progress", tone: "default" },
  completed: { label: "Completed", tone: "default" },
  cancelled: { label: "Cancelled", tone: "destructive" },
};
