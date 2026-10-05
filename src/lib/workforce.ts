import { HardHat, Hammer, Paintbrush, Users, type LucideIcon } from "lucide-react";

export interface WorkerType {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  hourlyRate: number; // INR / hour
  dailyRate: number;  // INR / day (8 hours, slight discount)
  icon: LucideIcon;
  accent: string;
  image: string;
}

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const WORKER_TYPES: WorkerType[] = [
  {
    slug: "mason",
    name: "Mason",
    tagline: "Brickwork, plastering & concrete",
    description: "Skilled masons for brick laying, plastering, tiling base & concrete finishing.",
    hourlyRate: 140,
    dailyRate: 1000, // ~140 * 8 with small discount
    icon: HardHat,
    accent: "bg-amber-500/10 text-amber-600",
    image: U("photo-1503387762-592deb58ef4e"),
  },
  {
    slug: "labour",
    name: "General Labour",
    tagline: "Loading, mixing & site help",
    description: "Site assistance, material loading/unloading, mixing, cleaning & general support.",
    hourlyRate: 99,
    dailyRate: 700,
    icon: Users,
    accent: "bg-slate-500/10 text-slate-600",
    image: U("photo-1581094794329-c8112a89af12"),
  },
  {
    slug: "carpenter",
    name: "Carpenter",
    tagline: "Doors, furniture & woodwork",
    description: "Door fitting, furniture assembly, modular work, repairs & custom woodwork.",
    hourlyRate: 180,
    dailyRate: 1300,
    icon: Hammer,
    accent: "bg-orange-500/10 text-orange-600",
    image: U("photo-1558618666-fcd25c85cd64"),
  },
  {
    slug: "painter",
    name: "Painter",
    tagline: "Interior & exterior painting",
    description: "Wall preparation, primer, putty work, interior emulsion & exterior coats.",
    hourlyRate: 150,
    dailyRate: 1100,
    icon: Paintbrush,
    accent: "bg-rose-500/10 text-rose-600",
    image: U("photo-1562259949-e8e7689d7828"),
  },
];

export const getWorkerBySlug = (slug: string) =>
  WORKER_TYPES.find((w) => w.slug === slug);
