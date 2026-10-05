import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useVendor } from "@/lib/vendor-context";

/**
 * Redirects admins to /admin and vendors to /vendor.
 * Use on user-only pages (services, materials, cart, checkout, etc).
 * Returns true while a redirect is pending so caller can render null.
 */
export function useBlockStaff() {
  const { isAdmin, loading } = useAuth();
  const { vendor, loading: vLoading } = useVendor();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || vLoading) return;
    if (isAdmin) navigate({ to: "/admin" });
    else if (vendor) navigate({ to: "/vendor" });
  }, [isAdmin, vendor, loading, vLoading, navigate]);

  return isAdmin || vendor;
}
