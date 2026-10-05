import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { HardHat, CheckCircle2, Loader2, Calculator } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { estimate, type Quality, type LocationTier } from "@/lib/estimator";
import { formatINRRange } from "@/lib/format";
import illust from "@/assets/illust-construction.jpg";

export const Route = createFileRoute("/services/construction")({
  component: ConstructionPage,
  head: () => ({
    meta: [
      { title: "Full Home Construction — Homico" },
      { name: "description", content: "Turnkey home construction in Bengaluru — dedicated project manager, milestone payments and live progress tracking." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Full Home Construction",
          serviceType: "Turnkey home construction",
          description: "Turnkey home construction with dedicated project manager, milestone payments and live progress tracking.",
          provider: { "@type": "Organization", name: "Homico", url: "https://homico.lovable.app" },
          areaServed: { "@type": "City", name: "Bengaluru" },
        }),
      },
    ],
  }),
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional(),
});

function ConstructionPage() {
  const { user } = useAuth();
  const [landSize, setLandSize] = useState(2400);
  const [bedrooms, setBedrooms] = useState(3);
  const [floors, setFloors] = useState(2);
  const [tier, setTier] = useState<LocationTier>("tier2");
  const [quality, setQuality] = useState<Quality>("standard");
  const [form, setForm] = useState({ name: "", email: user?.email ?? "", phone: "", style: "Modern", notes: "" });
  const [loading, setLoading] = useState(false);

  const result = useMemo(() => estimate({ plotSize: landSize, floors, tier, quality }), [landSize, floors, tier, quality]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    const { error } = await supabase.from("construction_bookings").insert({
      user_id: user?.id ?? null,
      name: form.name, email: form.email, phone: form.phone || null,
      land_size: landSize, bedrooms, style: form.style,
      budget_range: formatINRRange(result.low, result.high),
      notes: form.notes || null,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking received! Project tracking is now active in your dashboard.");
    setForm({ name: "", email: user?.email ?? "", phone: "", style: "Modern", notes: "" });
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-subtle border-b border-border">
        <div className="container mx-auto px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-semibold mb-4">
              <HardHat className="h-3.5 w-3.5" /> Full Home Construction
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Turnkey homes, beautifully managed.</h1>
            <p className="mt-4 text-muted-foreground">From foundation to handover — a dedicated project manager and milestone-based payments.</p>
            <ul className="mt-6 grid grid-cols-2 gap-3">
              {["Dedicated PM", "Quality audits", "Milestone payments", "Live progress tracking"].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-accent" />{b}</li>
              ))}
            </ul>
          </motion.div>
          <img src={illust} alt="" loading="lazy" className="rounded-2xl shadow-elegant" />
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 grid lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-border bg-card p-7 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold">Estimate your project</h2>
          </div>
          <div className="space-y-4">
            <div><Label>Land size: <span className="text-accent">{landSize} sq ft</span></Label>
              <input type="range" min={600} max={10000} step={100} value={landSize} onChange={(e) => setLandSize(+e.target.value)} className="w-full mt-2 accent-[oklch(0.72_0.18_50)]" /></div>
            <div><Label>Number of floors: <span className="text-accent">{floors}</span></Label>
              <input type="range" min={1} max={4} value={floors} onChange={(e) => setFloors(+e.target.value)} className="w-full mt-2 accent-[oklch(0.72_0.18_50)]" /></div>
            <div><Label>Bedrooms: <span className="text-accent">{bedrooms}</span></Label>
              <input type="range" min={1} max={6} value={bedrooms} onChange={(e) => setBedrooms(+e.target.value)} className="w-full mt-2 accent-[oklch(0.72_0.18_50)]" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location tier</Label>
                <Select value={tier} onValueChange={(v) => setTier(v as LocationTier)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tier1">Tier 1 (Metro)</SelectItem>
                    <SelectItem value="tier2">Tier 2</SelectItem>
                    <SelectItem value="tier3">Tier 3</SelectItem>
                  </SelectContent>
                </Select></div>
              <div><Label>Finish quality</Label>
                <Select value={quality} onValueChange={(v) => setQuality(v as Quality)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select></div>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-gradient-hero text-primary-foreground p-5">
            <p className="text-xs uppercase tracking-wide opacity-80">Estimated cost range</p>
            <p className="text-3xl font-bold mt-1">{formatINRRange(result.low, result.high)}</p>
            <p className="text-sm opacity-80 mt-1">Built-up area: {result.builtUpArea.toLocaleString("en-IN")} sq ft</p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">For a detailed material breakdown, <Link to="/tools/estimator" className="text-accent">open the full estimator</Link>.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-soft">
          <h2 className="text-xl font-bold">Request full project execution</h2>
          <p className="text-sm text-muted-foreground mt-1">We'll get back within 24 hours.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Style</Label>
              <Select value={form.style} onValueChange={(v) => setForm({ ...form, style: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Modern">Modern</SelectItem>
                  <SelectItem value="Contemporary">Contemporary</SelectItem>
                  <SelectItem value="Traditional">Traditional</SelectItem>
                </SelectContent>
              </Select></div>
            <div><Label>Notes</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Submit booking
            </Button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
