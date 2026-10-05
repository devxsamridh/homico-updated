export const formatINR = (n: number): string => {
  if (Number.isNaN(n)) return "₹0";
  return "₹" + Math.round(n).toLocaleString("en-IN");
};

export const formatINRRange = (low: number, high: number): string =>
  `${formatINR(low)} – ${formatINR(high)}`;

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
