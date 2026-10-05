import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Building2, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

import imgModern from "@/assets/elevation-modern.jpg";
import imgDuplex from "@/assets/elevation-duplex.jpg";
import imgMinimal from "@/assets/elevation-minimal.jpg";
import imgLuxury from "@/assets/elevation-luxury.jpg";
import imgCompact from "@/assets/elevation-compact.jpg";
import imgClassical from "@/assets/elevation-classical.jpg";
import imgNeoclassical from "@/assets/elevation-neoclassical.jpg";
import imgContemporary from "@/assets/elevation-contemporary.jpg";
import imgIndianModern from "@/assets/elevation-indian-modern.jpg";
import imgCourtyardModern from "@/assets/elevation-courtyard-modern.jpg";
import imgUrbanDuplex from "@/assets/elevation-urban-duplex.jpg";
import imgNightTerrace from "@/assets/elevation-night-terrace.jpg";
import imgGardenVilla from "@/assets/elevation-garden-villa.jpg";
import imgGrandClassical from "@/assets/elevation-grand-classical.jpg";
import imgTropicalMinimal from "@/assets/elevation-tropical-minimal.jpg";
import imgWhiteManor from "@/assets/elevation-white-manor.jpg";
import imgPillaredVilla from "@/assets/elevation-pillared-villa.jpg";
import imgEveningMansion from "@/assets/elevation-evening-mansion.jpg";
import imgUrbanContemporary from "@/assets/elevation-urban-contemporary.jpg";
import imgRoyalMansion from "@/assets/elevation-royal-mansion.jpg";
import imgBalconyVilla from "@/assets/elevation-balcony-villa.jpg";
import imgGlowMansion from "@/assets/elevation-glow-mansion.jpg";
import imgCompactTower from "@/assets/elevation-compact-tower.jpg";
import imgCurvedBalcony from "@/assets/elevation-curved-balcony.jpg";
import imgClassicPillared from "@/assets/elevation-classic-pillared.jpg";
import imgStoneModern from "@/assets/elevation-stone-modern.jpg";
import imgCurvedLuxury from "@/assets/elevation-curved-luxury.jpg";

export const Route = createFileRoute("/services/elevation-ideas")({
  component: ElevationIdeasPage,
  head: () => ({
    meta: [
      { title: "Home Elevation Ideas — Homico" },
      {
        name: "description",
        content:
          "Browse modern front elevation designs and request a planning consultation from licensed architects.",
      },
      { property: "og:title", content: "Home Elevation Ideas — Homico" },
      {
        property: "og:description",
        content:
          "Pick an elevation you love and our architecture team will plan it for your plot.",
      },
    ],
  }),
});

const DESIGNS = [
  { slug: "modern", title: "Modern", desc: "Clean lines, wood accents and bold cantilevered balconies.", img: imgModern },
  { slug: "duplex", title: "Duplex", desc: "Two distinct floors with a balcony and porch.", img: imgDuplex },
  { slug: "minimal", title: "Minimal", desc: "Wood-slat facade with calm, timeless geometry.", img: imgMinimal },
  { slug: "luxury", title: "Luxury", desc: "Grand columns, premium materials, statement design.", img: imgLuxury },
  { slug: "compact", title: "Compact Homes", desc: "Smart elevations for narrow and small plots.", img: imgCompact },
  { slug: "classical", title: "Classical", desc: "Pillared portico, pediment and symmetrical grandeur.", img: imgClassical },
  { slug: "neoclassical", title: "Neo-Classical", desc: "Ornate cornices and warm facade lighting.", img: imgNeoclassical },
  { slug: "contemporary", title: "Contemporary", desc: "Arched cutouts, glass balconies and layered terraces.", img: imgContemporary },
  { slug: "indian-modern", title: "Indian Modern", desc: "Jali screens, warm tones and lit balconies.", img: imgIndianModern },
  { slug: "courtyard-modern", title: "Courtyard Modern", desc: "Wide frontage, open parking bay and crisp modern framing.", img: imgCourtyardModern },
  { slug: "urban-duplex", title: "Urban Duplex", desc: "Tall city frontage with shaded balcony and modern stone cladding.", img: imgUrbanDuplex },
  { slug: "night-terrace", title: "Night Terrace", desc: "Slim facade with stacked terraces and bright evening lighting.", img: imgNightTerrace },
  { slug: "garden-villa", title: "Garden Villa", desc: "Large lawn-facing elevation with a refined entry portico.", img: imgGardenVilla },
  { slug: "grand-classical", title: "Grand Classical", desc: "Tall fluted columns and a stately luxury frontage.", img: imgGrandClassical },
  { slug: "tropical-minimal", title: "Tropical Minimal", desc: "Soft white geometry placed naturally within lush greenery.", img: imgTropicalMinimal },
  { slug: "white-manor", title: "White Manor", desc: "Symmetrical white facade with a formal double-height porch.", img: imgWhiteManor },
  { slug: "pillared-villa", title: "Pillared Villa", desc: "Neo-classic facade with slender columns and balcony details.", img: imgPillaredVilla },
  { slug: "evening-mansion", title: "Evening Mansion", desc: "Double-height entrance designed to glow beautifully at night.", img: imgEveningMansion },
  { slug: "urban-contemporary", title: "Urban Contemporary", desc: "Glass balconies, dark framing and premium vertical massing.", img: imgUrbanContemporary },
  { slug: "royal-mansion", title: "Royal Mansion", desc: "Grand Corinthian columns, arched portico and ornate balustrades.", img: imgRoyalMansion },
  { slug: "balcony-villa", title: "Balcony Villa", desc: "Soft white facade with planted balcony and warm wood entry.", img: imgBalconyVilla },
  { slug: "glow-mansion", title: "Glow Mansion", desc: "Layered cornices and golden cove lighting against a dusk sky.", img: imgGlowMansion },
  { slug: "compact-tower", title: "Compact Tower", desc: "Narrow plot elevation with rounded corner tower and warm lighting.", img: imgCompactTower },
  { slug: "curved-balcony", title: "Curved Balcony", desc: "Sculpted curved balcony with wood soffit and linear LED detail.", img: imgCurvedBalcony },
  { slug: "classic-pillared", title: "Classic Pillared", desc: "Traditional white facade with columned portico and balustrades.", img: imgClassicPillared },
  { slug: "stone-modern", title: "Stone Modern", desc: "Stone cladding, wood louvers and dramatic metal screen accent.", img: imgStoneModern },
  { slug: "curved-luxury", title: "Curved Luxury", desc: "Stacked terraces with curved soffits and stone-wood material mix.", img: imgCurvedLuxury },
] as const;

const schema = z.object({
  plot_size: z.string().trim().min(1, "Plot size is required").max(50),
  floors: z.string().min(1, "Select floors"),
  budget: z.string().min(1, "Select a budget"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number too long")
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number"),
});

function ElevationIdeasPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<(typeof DESIGNS)[number] | null>(null);
  const [preview, setPreview] = useState<(typeof DESIGNS)[number] | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ plot_size: "", floors: "", budget: "", phone: "" });

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const close = () => {
    setSelected(null);
    setConfirmed(false);
    setForm({ plot_size: "", floors: "", budget: "", phone: "" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const plotNum = Number(String(form.plot_size).replace(/[^\d.]/g, ""));
    const { error } = await supabase.from("consultation_requests").insert({
      user_id: user?.id ?? null,
      name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Elevation lead",
      email: user?.email ?? "no-reply@homico.app",
      phone: form.phone,
      budget: form.budget,
      land_size: Number.isFinite(plotNum) && plotNum > 0 ? plotNum : null,
      style: selected.title,
      message: `Elevation: ${selected.title}\nPlot: ${form.plot_size}\nFloors: ${form.floors}\nBudget: ${form.budget}`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setConfirmed(true);
  };

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="border-b border-border bg-gradient-subtle">
        <div className="container mx-auto px-4 py-14 md:py-20 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-semibold mb-5">
            <Building2 className="h-3.5 w-3.5" /> Elevation Ideas
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Home Elevation Ideas
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Browse front elevation styles and let our architects plan one for your plot.
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESIGNS.map((d, i) => (
            <motion.article
              key={d.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl overflow-hidden border border-border bg-card hover:border-accent/40 hover:shadow-elegant hover:-translate-y-1 transition-base flex flex-col"
            >
              <button
                type="button"
                onClick={() => setPreview(d)}
                aria-label={`View full ${d.title} elevation`}
                className="relative aspect-[4/3] w-full overflow-hidden bg-muted"
              >
                <img
                  src={d.img}
                  alt={`${d.title} elevation`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold">{d.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed flex-1">
                  {d.desc}
                </p>
                <Button
                  variant="hero"
                  className="mt-5 w-full"
                  onClick={() => {
                    setSelected(d);
                    setConfirmed(false);
                  }}
                >
                  Get Plan for This
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-5xl p-2 sm:p-3 bg-background">
          <DialogHeader className="px-2 pt-1">
            <DialogTitle>{preview?.title}</DialogTitle>
            <DialogDescription>{preview?.desc}</DialogDescription>
          </DialogHeader>
          {preview && (
            <img
              src={preview.img}
              alt={`${preview.title} elevation full view`}
              className="w-full h-auto rounded-lg object-contain"
            />
          )}
          <Button
            variant="hero"
            className="w-full"
            onClick={() => {
              if (preview) {
                setSelected(preview);
                setPreview(null);
                setConfirmed(false);
              }
            }}
          >
            Get Plan for This
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-md">
          {confirmed ? (
            <div className="py-4 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-3">
                <Building2 className="h-6 w-6" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Request received</DialogTitle>
                <DialogDescription className="text-center">
                  Our architecture team will contact you with planning suggestions and estimated cost.
                </DialogDescription>
              </DialogHeader>
              <Button className="mt-6 w-full" variant="hero" onClick={close}>
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Get plan for {selected?.title}</DialogTitle>
                <DialogDescription>
                  Share a few details and our architects will reach out.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4 mt-2">
                <div>
                  <Label>Plot size *</Label>
                  <Input
                    placeholder="e.g. 30x40 ft or 1200 sq ft"
                    value={form.plot_size}
                    onChange={(e) => update("plot_size", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Number of floors *</Label>
                  <Select value={form.floors} onValueChange={(v) => update("floors", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 floor</SelectItem>
                      <SelectItem value="2">2 floors</SelectItem>
                      <SelectItem value="3">3 floors</SelectItem>
                      <SelectItem value="4+">4+ floors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Budget *</Label>
                  <Select value={form.budget} onValueChange={(v) => update("budget", v)}>
                    <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-25L">Under ₹25L</SelectItem>
                      <SelectItem value="25-50L">₹25L – ₹50L</SelectItem>
                      <SelectItem value="50L-1Cr">₹50L – ₹1Cr</SelectItem>
                      <SelectItem value="1Cr+">₹1Cr+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phone number *</Label>
                  <Input
                    type="tel"
                    placeholder="+91 ..."
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Submit request
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
