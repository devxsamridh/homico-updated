import { Wrench, Zap, Paintbrush, Hammer, Package, type LucideIcon } from "lucide-react";

export interface SpecializedService {
  slug: string;
  name: string;
  tagline: string;
  priceLabel: string;
  priceNote: string;
  responseTime: string;
  rating: number;
  jobs: string;
  availability: { label: string; available: boolean };
  subServices: string[];
  bookSlug: string; // category slug used by /services/home-services/$category route
  detailsHref?: string; // overrides when not a home-services category
  icon: LucideIcon;
  accent: string;
}

export const SPECIALIZED_SERVICES: SpecializedService[] = [
  {
    slug: "plumbing",
    name: "Plumbing",
    tagline: "Leaks, fittings, installations & repairs",
    priceLabel: "Starts at ₹89",
    priceNote: "Inspection visit",
    responseTime: "Response within 2 hours",
    rating: 4.8,
    jobs: "1,200+ jobs completed",
    availability: { label: "Available in Bengaluru", available: true },
    subServices: ["Leak Repairs", "Tap Installation", "Bathroom Fittings"],
    bookSlug: "plumbing",
    icon: Wrench,
    accent: "bg-blue-500/10 text-blue-600",
  },
  {
    slug: "electrical",
    name: "Electrical",
    tagline: "Wiring, switches, fans & lights",
    priceLabel: "Starts at ₹89",
    priceNote: "Inspection visit",
    responseTime: "Response within 2 hours",
    rating: 4.8,
    jobs: "980+ jobs completed",
    availability: { label: "Available in Bengaluru", available: true },
    subServices: ["Wiring", "Switch Installation", "Fan & Light Setup"],
    bookSlug: "electrical",
    icon: Zap,
    accent: "bg-amber-500/10 text-amber-600",
  },
  {
    slug: "painting",
    name: "Painting",
    tagline: "Interior, exterior & texture finishes",
    priceLabel: "Free site visit",
    priceNote: "On-site quotation",
    responseTime: "Response within 24 hours",
    rating: 4.9,
    jobs: "1,900+ jobs completed",
    availability: { label: "Available in Bengaluru", available: true },
    subServices: ["Interior Painting", "Exterior Painting", "Texture Finishes"],
    bookSlug: "painting",
    icon: Paintbrush,
    accent: "bg-rose-500/10 text-rose-600",
  },
  {
    slug: "carpentry",
    name: "Carpentry",
    tagline: "Furniture, woodwork & door fitting",
    priceLabel: "Starts at ₹99",
    priceNote: "Inspection visit",
    responseTime: "Response within 4 hours",
    rating: 4.7,
    jobs: "640+ jobs completed",
    availability: { label: "Available in Bengaluru", available: true },
    subServices: ["Furniture Repair", "Custom Woodwork", "Door Installation"],
    bookSlug: "minor-repairs",
    icon: Hammer,
    accent: "bg-orange-500/10 text-orange-600",
  },
  {
    slug: "materials",
    name: "Materials",
    tagline: "Cement, steel, tiles & more — delivered",
    priceLabel: "From ₹350/bag",
    priceNote: "Doorstep delivery",
    responseTime: "Same-day delivery",
    rating: 4.8,
    jobs: "3,400+ orders delivered",
    availability: { label: "Available in Bengaluru", available: true },
    subServices: ["Cement", "Steel", "Tiles"],
    bookSlug: "",
    detailsHref: "/services/materials",
    icon: Package,
    accent: "bg-emerald-500/10 text-emerald-600",
  },
];
