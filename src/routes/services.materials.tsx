import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Search, Loader2, Zap, Truck, ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-context";
import { useVendor } from "@/lib/vendor-context";
import { formatINR } from "@/lib/format";
import { getMaterialImage } from "@/lib/material-images";
import { MATERIAL_GROUPS, CATEGORY_LABELS, getGroupForCategory, getDeliveryType } from "@/lib/material-categories";

export const Route = createFileRoute("/services/materials")({
  component: MaterialsPage,
  head: () => ({
    meta: [
      { title: "Raw Materials — Homico" },
      { name: "description", content: "Quality-verified construction materials delivered to your site — cement, steel, bricks, tiles, plywood and more." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Raw Materials — Homico",
          description: "Catalog of quality-verified construction materials.",
          url: "https://homico.lovable.app/services/materials",
          isPartOf: { "@type": "WebSite", name: "Homico", url: "https://homico.lovable.app" },
        }),
      },
    ],
  }),
});

interface Material {
  id: string; name: string; category: string; unit: string;
  price: number; image_url: string | null; description: string | null;
}

function MaterialsPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { vendor } = useVendor();
  const cart = useCart();
  const [items, setItems] = useState<Material[]>([]);
  const [search, setSearch] = useState("");
  const [groupSlug, setGroupSlug] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Material | null>(null);

  useEffect(() => {
    supabase.from("materials").select("*").order("name").then(({ data }) => {
      setItems((data ?? []) as Material[]);
      setLoading(false);
    });
  }, []);

  const activeGroupData = MATERIAL_GROUPS.find((g) => g.slug === groupSlug);
  const filtered = items.filter((i) => {
    const matchesGroup = !activeGroupData || activeGroupData.categories.includes(i.category);
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const groupCount = (slug: string) => {
    const g = MATERIAL_GROUPS.find((x) => x.slug === slug);
    if (!g) return items.length;
    return items.filter((i) => g.categories.includes(i.category)).length;
  };

  const checkout = () => {
    if (!user) {
      toast.info("Please sign in to checkout");
      navigate({ to: "/auth" });
      return;
    }
    if (cart.items.length === 0) return;
    navigate({ to: "/checkout/materials" });
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-subtle border-b border-border">
        <div className="container mx-auto px-4 py-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Raw Materials</h1>
            <p className="text-muted-foreground mt-2">Quality-verified materials delivered to your site.</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="hero" size="lg" className="relative">
                <ShoppingCart className="h-4 w-4" /> Cart
                {cart.count() > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-background text-foreground text-xs font-bold">
                    {cart.count()}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
              <SheetHeader><SheetTitle>Your Cart</SheetTitle></SheetHeader>
              {cart.items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <ShoppingCart className="h-10 w-10 mx-auto opacity-40 mb-2" />
                    <p>Your cart is empty</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-3 py-4">
                    {cart.items.map((i) => (
                      <div key={i.id} className="flex gap-3 p-3 rounded-lg border border-border">
                        <img src={i.image_url ?? ""} alt={i.name} className="h-14 w-14 rounded object-cover bg-muted" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{i.name}</p>
                          <p className="text-xs text-muted-foreground">{formatINR(i.price)} / {i.unit}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => cart.setQty(i.id, i.qty - 1)}><Minus className="h-3 w-3" /></Button>
                            <span className="text-sm w-6 text-center">{i.qty}</span>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => cart.setQty(i.id, i.qty + 1)}><Plus className="h-3 w-3" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto text-destructive" onClick={() => cart.remove(i.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span><span>{formatINR(cart.total())}</span>
                    </div>
                    <Button variant="hero" className="w-full" onClick={checkout}>Checkout</Button>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <p className="text-sm text-muted-foreground mt-1">Browse our complete range of construction materials.</p>
          </div>
          {activeGroupData && (
            <Button variant="outline" size="sm" onClick={() => setGroupSlug("all")}>
              <ArrowLeft className="h-4 w-4" /> Clear filter
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {MATERIAL_GROUPS.map((g) => {
            const active = groupSlug === g.slug;
            return (
              <button
                key={g.slug}
                onClick={() => setGroupSlug(active ? "all" : g.slug)}
                className={`group rounded-xl border bg-card p-2.5 flex flex-col items-center text-center transition-base hover:-translate-y-0.5 hover:shadow-elegant ${
                  active ? "border-accent ring-2 ring-accent/40" : "border-border hover:border-accent/40"
                }`}
              >
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted/50 mb-2">
                  <img
                    src={g.image}
                    alt={g.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="font-semibold text-[11px] leading-tight line-clamp-2 min-h-[1.8rem]">{g.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{groupCount(g.slug)}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 mb-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold">
              {activeGroupData ? activeGroupData.name : "All Products"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {activeGroupData ? activeGroupData.description : "Complete catalog"}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((m) => {
              const img = getMaterialImage(m.name, m.category, m.image_url);
              const delivery = getDeliveryType(m.category);
              const isLocal = delivery === "local";
              return (
                <div
                  key={m.id}
                  onClick={() => setPreview(m)}
                  className="group cursor-pointer rounded-xl border border-border bg-card overflow-hidden transition-base hover:shadow-elegant hover:-translate-y-0.5 hover:border-accent/40"
                >
                  <div className="relative h-28 overflow-hidden bg-muted/40">
                    <img src={img} alt={m.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    <span
                      className={`absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide shadow-md ${
                        isLocal ? "bg-amber-500 text-white" : "bg-blue-600 text-white"
                      }`}
                    >
                      {isLocal ? <Zap className="h-2.5 w-2.5" /> : <Truck className="h-2.5 w-2.5" />}
                      {isLocal ? "Near" : "Ship"}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-semibold text-xs line-clamp-2 min-h-[2rem]">{m.name}</h3>
                    <div className="mt-1.5 flex items-baseline justify-between gap-1">
                      <div className="text-sm font-bold">{formatINR(m.price)}</div>
                      <div className="text-[10px] text-muted-foreground">/{m.unit}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="hero"
                      className="w-full mt-2 h-7 text-[11px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        cart.add({ id: m.id, name: m.name, unit: m.unit, price: m.price, image_url: img });
                        toast.success("Added to cart");
                      }}
                    >
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No products match your search.</p>
        )}

        {!isAdmin && !vendor && (
          <p className="text-center text-xs text-muted-foreground mt-10">
            Need a saved cart and order history? <Link to="/dashboard" className="text-accent">Go to dashboard</Link>
          </p>
        )}
      </section>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-lg">
          {preview && (() => {
            const img = getMaterialImage(preview.name, preview.category, preview.image_url);
            const delivery = getDeliveryType(preview.category);
            const isLocal = delivery === "local";
            const groupForCat = getGroupForCategory(preview.category);
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{preview.name}</DialogTitle>
                  <DialogDescription>{groupForCat?.name ?? CATEGORY_LABELS[preview.category] ?? preview.category}</DialogDescription>
                </DialogHeader>
                <div className="rounded-xl overflow-hidden bg-muted aspect-video">
                  <img src={img} alt={preview.name} className="w-full h-full object-cover" />
                </div>
                <div className={`inline-flex w-fit items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isLocal ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" : "bg-blue-500/15 text-blue-700 dark:text-blue-400"}`}>
                  {isLocal ? <Zap className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
                  {isLocal ? "Near & Now • Same / Next Day Delivery" : "ShipDirect • 3–5 Days Delivery"}
                </div>
                {preview.description && <p className="text-sm text-muted-foreground">{preview.description}</p>}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <div className="text-2xl font-bold">{formatINR(preview.price)}</div>
                    <div className="text-xs text-muted-foreground">per {preview.unit}</div>
                  </div>
                  <Button
                    variant="hero"
                    onClick={() => {
                      cart.add({ id: preview.id, name: preview.name, unit: preview.unit, price: preview.price, image_url: img });
                      toast.success("Added to cart");
                      setPreview(null);
                    }}
                  >
                    <Plus className="h-4 w-4" /> Add to Cart
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
