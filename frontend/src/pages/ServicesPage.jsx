import { useState, useMemo } from "react";
import { useFetch } from "../hooks/useFetch.js";
import { servicesApi } from "../api/services.js";
import Card from "../components/Card.jsx";
import BookingForm from "../features/bookings/BookingForm.jsx";
import Reveal, { RevealItem } from "../components/Reveal.jsx";
import { Button } from "../components/Button.jsx";
import {
  MagnifyingGlass,
  Wrench,
  Lightning,
  Wind,
  Sparkle,
  Buildings,
  Compass,
  CheckCircle,
} from "@phosphor-icons/react";

const CATEGORY_ICONS = {
  plumbing: Wrench,
  electrical: Lightning,
  "ac-repair": Wind,
  "house-help": Sparkle,
  "architecture-planning": Compass,
  construction: Buildings,
};

export default function ServicesPage() {
  const { data: categories, loading, error } = useFetch(() => servicesApi.listCategories(), []);
  const [selected, setSelected] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const rawCategories = useMemo(() => {
    return categories?.results ?? categories ?? [];
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return rawCategories
      .map((cat) => {
        if (activeCategory !== "all" && cat.slug !== activeCategory) {
          return null;
        }

        const q = searchQuery.toLowerCase().trim();
        if (!q) return cat;

        const catMatches =
          cat.name.toLowerCase().includes(q) ||
          (cat.description && cat.description.toLowerCase().includes(q));
        const matchedItems = (cat.items || []).filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q))
        );

        if (catMatches) return cat;
        if (matchedItems.length > 0) {
          return { ...cat, items: matchedItems };
        }
        return null;
      })
      .filter(Boolean);
  }, [rawCategories, activeCategory, searchQuery]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 lg:py-16">
      {/* Header section */}
      <Reveal className="max-w-2xl">
        <span className="badge border border-line bg-surface-muted text-ink">
          <CheckCircle size={14} weight="duotone" />
          Verified Technicians &amp; Fair Pricing
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-ink">
          Expert Home <span className="text-spectrum">Services</span>
        </h1>
        <p className="mt-2 text-ink-muted">
          Book an inspection visit for ₹89. Our verified pros diagnose the issue on-site and provide an itemized quote before work starts.
        </p>
      </Reveal>

      {/* Search and Category Filter Toolbar */}
      <div className="mt-8 space-y-4">
        {/* Search input */}
        <div className="relative max-w-md">
          <MagnifyingGlass
            size={18}
            weight="duotone"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="search"
            placeholder="Search repairs, leakage, electrical, AC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-10 pr-14 shadow-soft-xs"
          />
          {searchQuery && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 text-xs font-medium text-ink-faint hover:text-ink"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          <Button
            type="button"
            size="sm"
            variant={activeCategory === "all" ? "primary" : "secondary"}
            aria-pressed={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            className="text-xs"
          >
            All Categories
          </Button>
          {rawCategories.map((c) => {
            const Icon = CATEGORY_ICONS[c.slug] || Wrench;
            const isActive = activeCategory === c.slug;
            return (
              <Button
                key={c.id}
                type="button"
                size="sm"
                variant={isActive ? "primary" : "secondary"}
                aria-pressed={isActive}
                onClick={() => setActiveCategory(c.slug)}
                className="gap-1.5 text-xs"
              >
                <Icon size={14} weight="duotone" />
                {c.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-surface p-6 shadow-soft skeleton">
              <div className="h-6 w-1/2 rounded bg-surface-muted" />
              <div className="mt-2 h-4 w-3/4 rounded bg-surface-muted" />
              <div className="mt-6 space-y-3">
                <div className="h-12 rounded-lg bg-surface-muted" />
                <div className="h-12 rounded-lg bg-surface-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-8 rounded-2xl border border-red-900/40 bg-red-950/20 p-6 text-center text-red-400">
          Failed to load services. Please check your connection and try again.
        </div>
      )}

      {/* Empty Search Results */}
      {!loading && !error && filteredCategories.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-line p-12 text-center">
          <p className="text-base font-semibold text-ink">No services found</p>
          <p className="mt-1 text-sm text-ink-muted">Try adjusting your search query or switching categories.</p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Categories & Service Items Grid */}
      {!loading && !error && (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {filteredCategories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] || Wrench;
            return (
              <Card key={cat.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface-muted text-ink">
                      <Icon size={20} weight="duotone" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-ink">{cat.name}</h3>
                      <p className="text-xs text-ink-faint">{cat.items?.length || 0} services available</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-ink-muted">{cat.description}</p>

                  <ul className="mt-5 space-y-2.5">
                    {(cat.items || []).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-muted/50 p-3 transition-colors hover:border-ink/20"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-ink">
                              {item.is_hourly ? `₹${item.hourly_rate}/hr` : `Inspection ₹${item.inspection_fee}`}
                            </span>
                            {item.is_hourly ? (
                              <span className="rounded bg-surface-muted border border-line px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">
                                Hourly
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                                Flat Visit
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setSelected(item)}
                          className="shrink-0 h-8 px-3.5 text-xs"
                        >
                          Book Visit
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selected && <BookingForm service={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
