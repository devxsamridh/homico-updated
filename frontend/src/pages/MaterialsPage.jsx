import { useState, useMemo } from "react";
import { useFetch } from "../hooks/useFetch.js";
import { materialsApi } from "../api/materials.js";
import Card from "../components/Card.jsx";
import { formatINR } from "../utils/format.js";
import { SUPPORT_EMAIL } from "../config/site.js";
import Reveal from "../components/Reveal.jsx";
import {
  MagnifyingGlass,
  Package,
  Truck,
  EnvelopeSimple,
  CheckCircle,
} from "@phosphor-icons/react";

export default function MaterialsPage() {
  const { data, loading, error } = useFetch(() => materialsApi.list(), []);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  const rawItems = useMemo(() => {
    return data?.results ?? data ?? [];
  }, [data]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    rawItems.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [rawItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return rawItems.filter((m) => {
      if (activeCategory !== "all" && m.category !== activeCategory) return false;
      if (inStockOnly && (!m.stock || m.stock <= 0)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name?.toLowerCase().includes(q);
        const matchesCat = m.category?.toLowerCase().includes(q);
        const matchesDesc = m.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesDesc) return false;
      }
      return true;
    });
  }, [rawItems, activeCategory, inStockOnly, searchQuery]);

  const handleEnquire = (item) => {
    const subject = encodeURIComponent(`Material Enquiry: ${item.name}`);
    const body = encodeURIComponent(
      `Hi Homico Team,\n\nI am interested in procuring "${item.name}" (Unit price: ${formatINR(
        item.price
      )}/${item.unit}).\n\nDelivery Location:\nQuantity Needed:\nPreferred Delivery Date:\n\nPlease share availability and quote.`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header section */}
      <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <span className="badge border border-line bg-surface-muted text-ink">
            <Truck size={14} weight="duotone" />
            Direct Site Delivery
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-ink">
            Raw Construction <span className="text-spectrum">Materials</span>
          </h1>
          <p className="mt-2 text-ink-muted">
            Verified cement, TMT steel, clay bricks, river sand, and electrical supplies. Enquire directly with our logistics team for doorstep site delivery.
          </p>
        </div>
      </Reveal>

      {/* Filter Toolbar */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative max-w-sm flex-1">
          <MagnifyingGlass
            size={18}
            weight="duotone"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="search"
            placeholder="Search cement, steel, bricks, wire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-10 pr-4 shadow-soft-xs"
          />
        </div>

        {/* In Stock Only Checkbox */}
        <label className="flex items-center gap-2 text-xs font-medium text-ink-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded border-line text-primary focus:ring-primary"
          />
          In Stock Only
        </label>
      </div>

      {/* Category Filter Pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeCategory === "all"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "border border-line bg-surface text-ink-muted hover:border-ink/30 hover:text-ink"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground shadow-soft"
                : "border border-line bg-surface text-ink-muted hover:border-ink/30 hover:text-ink"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-surface p-6 skeleton">
              <div className="h-4 w-1/3 rounded bg-surface-muted" />
              <div className="mt-4 h-6 w-3/4 rounded bg-surface-muted" />
              <div className="mt-6 h-8 w-1/2 rounded bg-surface-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-8 rounded-2xl border border-red-900/40 bg-red-950/20 p-6 text-center text-red-400">
          Failed to load materials catalog. Please try again.
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-line p-12 text-center">
          <p className="text-base font-semibold text-ink">No materials match your filters</p>
          <p className="mt-1 text-sm text-ink-muted">Try clearing search terms or displaying out-of-stock items.</p>
        </div>
      )}

      {/* Materials Cards Grid */}
      {!loading && !error && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((m) => {
            const isOutOfStock = !m.stock || m.stock <= 0;
            return (
              <Card key={m.id} className="flex flex-col justify-between transition-all hover:border-ink/20">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg border border-line bg-surface-muted px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                      {m.category}
                    </span>
                    {isOutOfStock ? (
                      <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                        Out of stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        {m.stock} in stock
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-base font-bold text-ink leading-snug">{m.name}</h3>
                  {m.description && (
                    <p className="mt-1.5 text-xs text-ink-muted line-clamp-2 leading-relaxed">{m.description}</p>
                  )}
                </div>

                <div className="mt-6 border-t border-line pt-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-ink">{formatINR(m.price)}</span>
                      <span className="ml-1 text-xs text-ink-faint">/{m.unit}</span>
                    </div>
                  </div>

                  {/* Honest Enquire Button per item (mailto) */}
                  <div className="mt-4">
                    <button
                      onClick={() => handleEnquire(m)}
                      disabled={isOutOfStock}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary-strong hover:shadow-glow disabled:opacity-40"
                    >
                      <EnvelopeSimple size={15} weight="bold" />
                      {isOutOfStock ? "Out of Stock" : "Enquire & Order"}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
