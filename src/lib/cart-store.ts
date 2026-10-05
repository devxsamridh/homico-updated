import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  image_url: string | null;
  qty: number;
}

export interface ServiceCartItem {
  id: string; // local uuid
  slug: string; // category slug
  name: string;
  price: number; // inspection fee or hourly base
  priceLabel?: string;
  fullName: string;
  phone: string;
  address: string;
  city?: string;
  pincode?: string;
  scheduledDate: string; // yyyy-mm-dd
  timeSlot: string;
  problem?: string;
  designStyle?: string; // renovation: modern | minimal | luxury
  roomImages?: string[]; // renovation: public URLs
}

interface CartState {
  items: CartItem[];
  services: ServiceCartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  addService: (svc: Omit<ServiceCartItem, "id">) => void;
  removeService: (id: string) => void;
  updateService: (id: string, patch: Partial<ServiceCartItem>) => void;
  clear: () => void;
  clearServices: () => void;
  total: () => number;
  servicesTotal: () => number;
  count: () => number;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      services: [],
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, qty }] };
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((state) => ({
          items: qty <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),
      addService: (svc) =>
        set((state) => ({ services: [...state.services, { ...svc, id: uid() }] })),
      removeService: (id) =>
        set((state) => ({ services: state.services.filter((s) => s.id !== id) })),
      updateService: (id, patch) =>
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      clear: () => set({ items: [] }),
      clearServices: () => set({ services: [] }),
      total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      servicesTotal: () => get().services.reduce((s, i) => s + i.price, 0),
      count: () =>
        get().items.reduce((s, i) => s + i.qty, 0) + get().services.length,
    }),
    { name: "homico-cart" },
  ),
);
