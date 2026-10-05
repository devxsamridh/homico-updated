import { Link } from "@tanstack/react-router";
import { HardHat, Mail, Phone, MapPin, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function Footer() {
  const { theme, toggle } = useTheme();
  return (
    <footer className="border-t border-border bg-gradient-subtle mt-24">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground">
              <HardHat className="h-5 w-5" />
            </span>
            <span>Hom<span className="text-accent">i</span>co</span>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            Plan, design, and build your dream home end-to-end. Architects, materials,
            and turnkey construction — all in one place.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Services</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services/planning-construction" hash="consultation" className="hover:text-foreground">Architecture Consultation</Link></li>
            <li><Link to="/services/materials" className="hover:text-foreground">Raw Materials</Link></li>
            <li><Link to="/services/planning-construction" hash="construction" className="hover:text-foreground">Full Construction</Link></li>
            <li><Link to="/services/planning-construction" hash="estimation" className="hover:text-foreground">Cost Estimator</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" />hello@homico.in</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" />+91 80 4000 0000</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />Bengaluru, India</li>
          </ul>
          <Link
            to="/vendor"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 transition-base"
          >
            Sell on Homico
          </Link>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Homico. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <span className="opacity-40">·</span>
            <Link to="/vendor" className="hover:text-foreground">Vendor Login</Link>
            <span className="opacity-40">·</span>
            <Link to="/admin" className="hover:text-foreground">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
