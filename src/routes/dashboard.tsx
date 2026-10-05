import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { useVendor } from "@/lib/vendor-context";

function DashboardGate() {
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
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireAuth>
      <DashboardGate />
    </RequireAuth>
  ),
  head: () => ({ meta: [{ title: "Dashboard — Homico" }] }),
});
