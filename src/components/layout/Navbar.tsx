import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ShoppingCart, HardHat, Sun, Moon, ChevronDown, Compass, Calculator, LineChart, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useVendor } from "@/lib/vendor-context";
import { useCart } from "@/lib/cart-store";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const planningMenu = [
  { to: "/tools/ai-home-planner", label: "AI Home Planner", desc: "Generate a personalized home plan with AI", icon: Sparkles },
  { to: "/services/planning", label: "Architecture Consultation", desc: "Licensed architects & buildable plans", icon: Compass },
  { to: "/services/elevation-ideas", label: "Home Elevation Ideas", desc: "Browse modern front elevations", icon: Building2 },
  { to: "/tools/estimator", label: "Cost Estimation", desc: "AI-assisted budget & materials", icon: Calculator },
  { to: "/services/construction", label: "Full Construction", desc: "End-to-end home execution", icon: HardHat },
  { to: "/dashboard/projects", label: "Project Tracking", desc: "Live phases & site photos", icon: LineChart },
];

const mainLinks = [
  { to: "/", label: "Home" },
  { to: "/services/materials", label: "Raw Materials" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [planningOpen, setPlanningOpen] = useState(false);
  const [mobilePlanningOpen, setMobilePlanningOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { vendor } = useVendor();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const cartCount = useCart((s) => s.count());
  const path = router.state.location.pathname;
  const isPlanningActive =
    path.startsWith("/services/planning") || path.startsWith("/services/construction");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground shadow-soft">
            <HardHat className="h-5 w-5" />
          </span>
          <span className="tracking-tight">
            Hom<span className="text-accent">i</span>co
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {!isAdmin && !vendor && (
            <>
              <Link
                to="/"
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-base",
                  path === "/" ? "text-accent" : "text-foreground/80 hover:text-foreground hover:bg-accent/5",
                )}
              >
                Home
              </Link>

              <Link
                to="/services"
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-base",
                  path.startsWith("/services") && !isPlanningActive
                    ? "text-accent"
                    : "text-foreground/80 hover:text-foreground hover:bg-accent/5",
                )}
              >
                Services
              </Link>

              {mainLinks.slice(1).map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-base",
                    path === l.to ? "text-accent" : "text-foreground/80 hover:text-foreground hover:bg-accent/5",
                  )}
                >
                  {l.label}
                </Link>
              ))}

              {/* Planning & Construction dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setPlanningOpen(true)}
                onMouseLeave={() => setPlanningOpen(false)}
              >
                <button
                  type="button"
                  aria-expanded={planningOpen}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-base inline-flex items-center gap-1",
                    isPlanningActive ? "text-accent" : "text-foreground/80 hover:text-foreground hover:bg-accent/5",
                  )}
                  onClick={() => setPlanningOpen(true)}
                  onFocus={() => setPlanningOpen(true)}
                >
                  Planning & Construction
                  <ChevronDown className={cn("h-4 w-4 transition-transform", planningOpen && "rotate-180")} />
                </button>
                {planningOpen && (
                  <div className="absolute left-0 top-full pt-2 w-80 animate-fade-in">
                    <div className="rounded-xl border border-border bg-popover shadow-elegant p-2">
                      {planningMenu.map((s) => (
                        <Link
                          key={s.label}
                          to={s.to}
                          onClick={() => setPlanningOpen(false)}
                          className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/5 transition-base"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                            <s.icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold">{s.label}</span>
                            <span className="block text-xs text-muted-foreground mt-0.5">{s.desc}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {user && !isAdmin && !vendor && (
            <Button asChild variant="outlineNavy" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          )}
          {!isAdmin && !vendor && (
            <Link to="/cart" className="relative inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent/5 transition-base" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="hero" size="sm">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              {vendor && (
                <Button asChild variant="hero" size="sm">
                  <Link to="/vendor">Vendor</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/auth">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent/5"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {!isAdmin && !vendor && (
              <>
                <Link to="/" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/5">
                  Home
                </Link>
                <Link
                  to="/services"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/5"
                >
                  Services
                </Link>
                <button
                  onClick={() => setMobilePlanningOpen((v) => !v)}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/5 flex items-center justify-between"
                >
                  Planning & Construction
                  <ChevronDown className={cn("h-4 w-4 transition-transform", mobilePlanningOpen && "rotate-180")} />
                </button>
                {mobilePlanningOpen && (
                  <div className="ml-3 border-l border-border pl-3 flex flex-col gap-1">
                    {planningMenu.map((s) => (
                      <Link
                        key={s.label}
                        to={s.to}
                        onClick={() => setOpen(false)}
                        className="px-3 py-2 rounded-md text-sm hover:bg-accent/5 flex items-center gap-2"
                      >
                        <s.icon className="h-3.5 w-3.5 text-accent" />
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
                {mainLinks.slice(1).map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/5"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link to="/cart" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/5 flex items-center justify-between">
                  Cart
                  {cartCount > 0 && <span className="text-xs text-accent">{cartCount} items</span>}
                </Link>
              </>
            )}
            <button
              onClick={() => { toggle(); }}
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/5 flex items-center gap-2"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <div className="h-px bg-border my-2" />
            {user ? (
              <>
                {isAdmin ? (
                  <Button asChild variant="hero" onClick={() => setOpen(false)}>
                    <Link to="/admin">Admin Console</Link>
                  </Button>
                ) : vendor ? (
                  <Button asChild variant="hero" onClick={() => setOpen(false)}>
                    <Link to="/vendor">Vendor Portal</Link>
                  </Button>
                ) : (
                  <Button asChild variant="hero" onClick={() => setOpen(false)}>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button asChild variant="ghost" onClick={() => setOpen(false)}>
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild variant="hero" onClick={() => setOpen(false)}>
                  <Link to="/auth">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
