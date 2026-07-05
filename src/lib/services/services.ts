// Service catalog queries (server-side).

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Service } from "@/lib/types";

export interface LawnServicePricing {
  /** Null when running on fallback pricing (Supabase not configured). */
  id: string | null;
  name: string;
  pricePerSqft: number;
  minPrice: number;
  isFallback: boolean;
}

// Mirrors supabase/seed.sql — used only when Supabase env vars are absent
// so the booking UI stays demoable in local dev before keys are set up.
const FALLBACK_PRICING: LawnServicePricing = {
  id: null,
  name: "Lawn mowing",
  pricePerSqft: 0.012,
  minPrice: 45,
  isFallback: true,
};

export async function getLawnMowingService(): Promise<LawnServicePricing> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_PRICING;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("name", "Lawn mowing")
    .single();

  if (error || !data) {
    throw new Error(
      `Could not load the "Lawn mowing" service — has supabase/seed.sql been run? (${error?.message ?? "no row"})`
    );
  }

  const service = data as Service;
  return {
    id: service.id,
    name: service.name,
    pricePerSqft: Number(service.price_per_sqft),
    minPrice: Number(service.min_price),
    isFallback: false,
  };
}
