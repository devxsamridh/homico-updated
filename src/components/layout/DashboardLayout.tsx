import { ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { User, ShoppingBag, CalendarCheck, HardHat, LogOut, Home, DoorOpen } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Navbar } from "./Navbar";

const links = [
  { to: "/dashboard", label: "Profile", icon: User, exact: true },
  { to: "/dashboard/orders", label: "Material Orders", icon: ShoppingBag },
  { to: "/dashboard/bookings", label: "Service Bookings", icon: CalendarCheck },
  { to: "/dashboard/projects", label: "My Projects", icon: HardHat },
  { to: "/dashboard/designs", label: "Saved Designs", icon: DoorOpen },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = router.state.location.pathname;
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1 grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="lg:sticky lg:top-20 h-fit rounded-2xl border border-border bg-card p-3">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto">
            {links.map((l) => {
              const Icon = l.icon;
              const active = l.exact ? path === l.to : path.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-base",
                    active ? "bg-accent/10 text-accent" : "text-foreground/70 hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" /> {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border my-3" />
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link to="/"><Home className="h-4 w-4" /> Back to site</Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
