// Cost estimator helpers — pure functions for testability.

export type LocationTier = "tier1" | "tier2" | "tier3";
export type Quality = "standard" | "premium" | "luxury";

const BASE_RATE_PER_SQFT: Record<LocationTier, number> = {
  tier1: 2200, // metro
  tier2: 1800,
  tier3: 1500,
};

const QUALITY_MULTIPLIER: Record<Quality, number> = {
  standard: 1,
  premium: 1.25,
  luxury: 1.55,
};

export interface EstimatorInput {
  plotSize: number; // sqft
  floors: number;
  builtUpRatio?: number; // default 0.7 (FSI roughly)
  tier: LocationTier;
  quality: Quality;
}

export interface EstimatorResult {
  builtUpArea: number;
  low: number;
  avg: number;
  high: number;
  materials: {
    cementBags: number;
    steelKg: number;
    bricks: number;
    sandCuft: number;
    aggregateCuft: number;
  };
}

export function estimate(input: EstimatorInput): EstimatorResult {
  const ratio = input.builtUpRatio ?? 0.7;
  const builtUpArea = Math.max(0, input.plotSize) * ratio * Math.max(1, input.floors);
  const baseRate = BASE_RATE_PER_SQFT[input.tier] * QUALITY_MULTIPLIER[input.quality];
  const avg = builtUpArea * baseRate;
  const low = avg * 0.85;
  const high = avg * 1.15;

  return {
    builtUpArea: Math.round(builtUpArea),
    low,
    avg,
    high,
    materials: {
      cementBags: Math.round(builtUpArea * 0.4),
      steelKg: Math.round(builtUpArea * 4),
      bricks: Math.round(builtUpArea * 8),
      sandCuft: Math.round(builtUpArea * 0.8),
      aggregateCuft: Math.round(builtUpArea * 0.6),
    },
  };
}

export const TIER_LABELS: Record<LocationTier, string> = {
  tier1: "Tier 1 (Metro)",
  tier2: "Tier 2 (Major city)",
  tier3: "Tier 3 (Town)",
};

export const QUALITY_LABELS: Record<Quality, string> = {
  standard: "Standard",
  premium: "Premium",
  luxury: "Luxury",
};
