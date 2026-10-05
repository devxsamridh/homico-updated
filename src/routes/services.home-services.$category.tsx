import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarCheck, Loader2, Upload, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-store";
import {
  getServiceBySlug, TIME_SLOTS, formatServicePrice,
  DESIGN_STYLES, RENOVATION_INSPECTION_TIERS,
} from "@/lib/home-services";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/services/home-services/$category")({
  component: BookingPage,
  head: ({ params }) => ({
    meta: [
      { title: `Book ${params.category} — Homico` },
      { name: "description", content: `Book a verified ${params.category} professional with Homico.` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: `${params.category} — Homico`,
          serviceType: params.category,
          description: `Book a verified ${params.category} professional with Homico.`,
          provider: { "@type": "Organization", name: "Homico", url: "https://homico.lovable.app" },
          areaServed: "IN",
        }),
      },
    ],
  }),
});

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function BookingPage() {
  const { category } = Route.useParams();
  const service = getServiceBySlug(category);
  const navigate = useNavigate();
  const { user } = useAuth();
  const addService = useCart((s) => s.addService);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState(TIME_SLOTS[0]);
  const [problem, setProblem] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Renovation-only state
  const isInteriorDesign = category === "interior-design";
  const [designStyle, setDesignStyle] = useState<string>(DESIGN_STYLES[0].value);
  const [tier, setTier] = useState<number>(RENOVATION_INSPECTION_TIERS[0].value);
  const [roomImages, setRoomImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (!user) {
      toast.info("Please sign in to upload room photos");
      return;
    }
    if (roomImages.length + files.length > 6) {
      toast.error("Up to 6 photos allowed");
      return;
    }
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is over 5MB`);
        continue;
      }
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("service-uploads").upload(path, file, { contentType: file.type });
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("service-uploads").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
    setRoomImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  };

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.full_name && !fullName) setFullName(data.full_name);
      if (data?.phone && !phone) setPhone(data.phone);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const estimate = useMemo(() => {
    if (isInteriorDesign) return tier;
    return service?.basePrice ?? 0;
  }, [service, isInteriorDesign, tier]);

  if (!service) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Service not found</h1>
          <Button asChild className="mt-4"><Link to="/services/home-services">Back to services</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill name, phone and address");
      return;
    }
    setSubmitting(true);
    addService({
      slug: service.slug,
      name: service.name,
      price: estimate,
      priceLabel: isInteriorDesign ? undefined : service.priceLabel,
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim() || undefined,
      pincode: pincode.trim() || undefined,
      scheduledDate: date,
      timeSlot: slot,
      problem: problem.trim() || undefined,
      designStyle: isInteriorDesign ? designStyle : undefined,
      roomImages: isInteriorDesign && roomImages.length ? roomImages : undefined,
    });
    setSubmitting(false);
    toast.success("Added to cart — review before confirming");
    navigate({ to: "/cart" });
  };

  const Icon = service.icon;

  return (
    <PublicLayout>
      <section className="bg-gradient-subtle border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <Link to="/services/home-services" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-xl ${service.accent} flex items-center justify-center`}>
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{service.name}</h1>
              <p className="text-muted-foreground text-sm">{service.description}</p>
            </div>
          </div>

          {isInteriorDesign && (
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {[
                { before: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=70", after: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=70", label: "Living room" },
                { before: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=70", after: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=70", label: "Kitchen" },
              ].map((p) => (
                <div key={p.label} className="rounded-xl overflow-hidden border border-border bg-card">
                  <div className="grid grid-cols-2">
                    <div className="relative">
                      <img src={p.before} alt={`${p.label} before renovation`} className="h-40 w-full object-cover" />
                      <span className="absolute top-2 left-2 text-[10px] font-semibold bg-background/90 px-2 py-0.5 rounded">BEFORE</span>
                    </div>
                    <div className="relative">
                      <img src={p.after} alt={`${p.label} after renovation`} className="h-40 w-full object-cover" />
                      <span className="absolute top-2 left-2 text-[10px] font-semibold bg-accent text-accent-foreground px-2 py-0.5 rounded">AFTER</span>
                    </div>
                  </div>
                  <div className="px-3 py-2 text-xs font-medium">{p.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 grid lg:grid-cols-[1fr_360px] gap-8 max-w-5xl">
        <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <div>
            <h2 className="font-semibold mb-3">Contact details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={20} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-3">Service address</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Street address *</Label>
                <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} required maxLength={500} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} />
                </div>
                <div>
                  <Label htmlFor="pin">Pincode</Label>
                  <Input id="pin" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={10} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-3">Choose a slot</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <Label>Time slot *</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {TIME_SLOTS.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setSlot(t)}
                      className={`px-2 py-2 rounded-md text-xs font-medium border transition-base ${slot === t ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/50"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {isInteriorDesign && (
            <div className="space-y-5 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <h2 className="font-semibold">Design preferences</h2>
              </div>

              <div>
                <Label className="mb-2 block">Inspection package *</Label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {RENOVATION_INSPECTION_TIERS.map((t) => (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => setTier(t.value)}
                      className={`text-left p-3 rounded-lg border transition-base ${tier === t.value ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"}`}
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold text-sm">{t.label}</span>
                        <span className="font-bold">₹{t.value}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Design style *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {DESIGN_STYLES.map((s) => (
                    <button
                      type="button"
                      key={s.value}
                      onClick={() => setDesignStyle(s.value)}
                      className={`p-3 rounded-lg border text-center transition-base ${designStyle === s.value ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"}`}
                    >
                      <div className="font-semibold text-sm">{s.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Room photos (optional, up to 6)</Label>
                <div className="flex flex-wrap gap-3">
                  {roomImages.map((url, i) => (
                    <div key={url} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border group">
                      <img src={url} alt={`Room ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setRoomImages((p) => p.filter((u) => u !== url))}
                        className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-background/90 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {roomImages.length < 6 && (
                    <label className="h-20 w-20 rounded-lg border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-accent transition-base">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      <span className="text-[10px] mt-1">Add</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
                {!user && <p className="text-[11px] text-muted-foreground mt-2">Sign in to attach room photos.</p>}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="problem">{isInteriorDesign ? "Tell us about your vision (optional)" : "Describe the issue (optional)"}</Label>
            <Textarea
              id="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder={isInteriorDesign ? "e.g. Want to redo the living room with warm tones and built-in storage..." : "e.g. Kitchen tap is leaking from the base..."}
            />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</> : <><CalendarCheck className="h-4 w-4" /> Add to cart</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Review the cart before confirming the booking.</p>
        </form>

        <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold">Order summary</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{service.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{date}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Slot</span><span className="font-medium">{slot}</span></div>
            {isInteriorDesign && (
              <div className="flex justify-between"><span className="text-muted-foreground">Style</span><span className="font-medium capitalize">{designStyle}</span></div>
            )}
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">{estimate === 0 ? "Site visit" : service.priceLabel === "/hour" ? "Starting at" : "Inspection visit fee"}</span>
              <span className="text-2xl font-bold">{isInteriorDesign ? formatINR(estimate) : formatServicePrice(service)}</span>
            </div>
            <div className="mt-3 rounded-lg bg-accent/10 border border-accent/30 p-3">
              <p className="text-xs text-foreground font-medium">Final cost will be provided after on-site inspection.</p>
              <p className="text-[11px] text-muted-foreground mt-1">You'll receive a transparent quote (labor + materials). Accept to start work, or reject and pay only the inspection fee.</p>
            </div>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 border-t border-border pt-4">
            <li>✓ Verified professional</li>
            <li>✓ Free reschedule up to 2 hours before</li>
            <li>✓ 30-day service warranty</li>
          </ul>
        </aside>
      </section>
    </PublicLayout>
  );
}
