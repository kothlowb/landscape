// Lot size estimation service.
//
// TODO(phase-2): Swap the stub for a real parcel-data provider (Regrid or
// ATTOM). To do that, replace the body of `estimateLotSize` with an API
// call and map the response into `LotSizeEstimate` — the signature and
// return shape stay the same, so no calling code changes:
//   - Regrid: GET https://app.regrid.com/api/v2/parcels/address?query=<address>
//     → use `fields.ll_gissqft` (parcel sqft), then apply a turf ratio.
//   - ATTOM: GET /propertyapi/v1.0.0/property/detail?address=<address>
//     → use `lot.lotSize2` (sqft).
// Keep the provider's API key server-side (call through a route handler or
// server action, never from the browser) and set `source` accordingly.

export interface LotSizeEstimate {
  /** Estimated mowable turf area in square feet. */
  turfSqft: number;
  /** Where the estimate came from — lets the UI caveat stub data. */
  source: "stub" | "regrid" | "attom";
}

/**
 * Estimate the mowable turf area for a street address.
 *
 * Stub implementation: derives a deterministic pseudo-random size from the
 * address text, so the same address always quotes the same price (repeat
 * visits, back-button, demos). Range ≈ 2,000–14,000 sqft, biased toward
 * typical suburban lots, in 50 sqft increments.
 */
export async function estimateLotSize(address: string): Promise<LotSizeEstimate> {
  const normalized = address.trim().toLowerCase();

  // FNV-1a hash — stable across sessions, no dependencies.
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  const unit = (hash >>> 0) / 0xffffffff; // 0..1
  const turfSqft = Math.round((2000 + unit * 12000) / 50) * 50;

  return { turfSqft, source: "stub" };
}
