import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";

export interface VendorRow {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
}

interface Ctx {
  vendor: VendorRow | null;
  loading: boolean;
  refresh: () => Promise<void>;
}
const VendorCtx = createContext<Ctx | undefined>(undefined);

export function VendorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setVendor(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from("vendors" as never).select("*").eq("id", user.id).maybeSingle();
    setVendor((data as VendorRow | null) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return <VendorCtx.Provider value={{ vendor, loading, refresh }}>{children}</VendorCtx.Provider>;
}

export function useVendor() {
  const ctx = useContext(VendorCtx);
  if (!ctx) throw new Error("useVendor must be inside VendorProvider");
  return ctx;
}
