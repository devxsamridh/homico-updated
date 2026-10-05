import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Ruler, CheckCircle2, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import illust from "@/assets/illust-planning.jpg";

export const Route = createFileRoute("/services/planning")({
  component: PlanningPage,
  head: () => ({ meta: [{ title: "Planning & Architecture — Homico" }] }),
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional(),
  budget: z.string().max(50).optional(),
  land_size: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  style: z.string().max(50).optional(),
  message: z.string().max(1000).optional(),
});

const benefits = ["Licensed architects", "3D walkthroughs", "Vastu compliant", "Approval drawings"];

function PlanningPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: user?.email ?? "", phone: "",
    budget: "", land_size: "", location: "", style: "", message: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("consultation_requests").insert({
      user_id: user?.id ?? null,
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      budget: form.budget || null,
      land_size: form.land_size ? Number(form.land_size) : null,
      location: form.location || null,
      style: form.style || null,
      message: form.message || null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Request submitted! Our team will reach out within 24h.");
    setForm({ name: "", email: user?.email ?? "", phone: "", budget: "", land_size: "", location: "", style: "", message: "" });
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-subtle border-b border-border">
        <div className="container mx-auto px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-semibold mb-4">
              <Ruler className="h-3.5 w-3.5" /> Planning & Architecture
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Design a home that fits your life.</h1>
            <p className="mt-4 text-muted-foreground">Work with vetted architects to turn your land into a beautiful, functional home.</p>
            <ul className="mt-6 grid grid-cols-2 gap-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-accent" />{b}</li>
              ))}
            </ul>
            <Button className="mt-8" variant="hero" size="lg" asChild>
              <a href="#book">Book Consultation</a>
            </Button>
          </motion.div>
          <img src={illust} alt="" loading="lazy" className="rounded-2xl shadow-elegant" />
        </div>
      </section>

      <section id="book" className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card p-8 shadow-soft">
          <h2 className="text-2xl font-bold">Tell us about your project</h2>
          <p className="text-sm text-muted-foreground mt-1">Free 30-minute consultation with an architect.</p>
          <form onSubmit={submit} className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-1"><Label>Name *</Label><Input value={form.name} onChange={(e) => update("name", e.target.value)} required /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div>
            <div><Label>Land size (sq ft)</Label><Input type="number" value={form.land_size} onChange={(e) => update("land_size", e.target.value)} /></div>
            <div>
              <Label>Budget</Label>
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
              <Label>Preferred style</Label>
              <Select value={form.style} onValueChange={(v) => update("style", v)}>
                <SelectTrigger><SelectValue placeholder="Choose style" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Modern">Modern</SelectItem>
                  <SelectItem value="Contemporary">Contemporary</SelectItem>
                  <SelectItem value="Traditional">Traditional</SelectItem>
                  <SelectItem value="Minimalist">Minimalist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2"><Label>Location</Label><Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City / area" /></div>
            <div className="sm:col-span-2"><Label>Notes</Label><Textarea rows={4} value={form.message} onChange={(e) => update("message", e.target.value)} /></div>
            <Button className="sm:col-span-2" variant="hero" size="lg" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Submit request
            </Button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
