import { ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useAuth } from "@/lib/auth-context";
import { useVendor } from "@/lib/vendor-context";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const { vendor, loading: vLoading } = useVendor();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || vLoading) return;
    if (isAdmin) navigate({ to: "/admin" });
    else if (vendor) navigate({ to: "/vendor" });
  }, [isAdmin, vendor, loading, vLoading, navigate]);

  if (isAdmin || vendor) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
