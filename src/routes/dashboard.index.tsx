import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, User, Camera, ShoppingBag, CalendarCheck, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard/")({
  component: ProfilePage,
});

function StatCard({ to, label, value, icon: Icon, accent }: { to: string; label: string; value: number; icon: typeof ShoppingBag; accent: string }) {
  return (
    <Link to={to} className="rounded-2xl border border-border bg-card p-5 hover:border-accent transition-base group">
      <div className="flex items-center justify-between mb-2">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-accent transition-base">View →</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Link>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ orders: 0, activeBookings: 0, ongoingProjects: 0 });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("material_orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("service_bookings").select("id", { count: "exact", head: true }).eq("user_id", user.id).not("status", "in", "(completed,cancelled)"),
      supabase.from("construction_projects").select("id", { count: "exact", head: true }).eq("user_id", user.id).neq("current_stage", "handover"),
    ]).then(([p, o, b, pr]) => {
      const data = p.data;
      if (data) {
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
        setAvatarUrl(data.avatar_url ?? null);
        setAddressLine(data.address_line ?? "");
        setCity(data.city ?? "");
        setStateName(data.state ?? "");
        setPincode(data.pincode ?? "");
      }
      setStats({ orders: o.count ?? 0, activeBookings: b.count ?? 0, ongoingProjects: pr.count ?? 0 });
      setLoading(false);
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      phone,
      avatar_url: avatarUrl,
      address_line: addressLine,
      city,
      state: stateName,
      pincode,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = pub.publicUrl;
    setAvatarUrl(url);
    await supabase.from("profiles").upsert({
      id: user.id,
      avatar_url: url,
      updated_at: new Date().toISOString(),
    });
    setUploading(false);
    toast.success("Profile picture updated");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back{fullName ? `, ${fullName.split(" ")[0]}` : ""}</h1>
        <p className="text-muted-foreground text-sm">Quick overview of your activity on Homico.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard to="/dashboard/orders" label="Total Orders" value={stats.orders} icon={ShoppingBag} accent="bg-blue-500/10 text-blue-600" />
        <StatCard to="/dashboard/bookings" label="Active Bookings" value={stats.activeBookings} icon={CalendarCheck} accent="bg-emerald-500/10 text-emerald-600" />
        <StatCard to="/dashboard/projects" label="Ongoing Projects" value={stats.ongoingProjects} icon={HardHat} accent="bg-amber-500/10 text-amber-600" />
      </div>

      <div>
        <h2 className="text-lg font-semibold">Your profile</h2>
        <p className="text-muted-foreground text-sm">Manage your personal information and default delivery address.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName || "Avatar"} className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-elegant hover:opacity-90 disabled:opacity-50"
              aria-label="Change profile picture"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={onPickAvatar} />
          </div>
          <div>
            <p className="font-semibold">{fullName || "Add your name"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled placeholder="" />
          </div>

          <div className="border-t border-border pt-4">
            <h2 className="font-semibold mb-3">Default address</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="addr">Address line</Label>
                <Textarea id="addr" rows={2} value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="House / flat, street, area" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={stateName} onChange={(e) => setStateName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="pin">Pincode</Label>
                  <Input id="pin" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <Button variant="hero" onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
