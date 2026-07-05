// Quote pricing. Single source of truth for how a turf area becomes a price.

export interface QuoteInput {
  turfSqft: number;
  pricePerSqft: number;
  minPrice: number;
}

/**
 * Price a job: area × rate, with a price floor for small properties.
 * Returns whole cents (rounded) as a dollar amount.
 */
export function calculateQuote({ turfSqft, pricePerSqft, minPrice }: QuoteInput): number {
  if (turfSqft < 0) throw new Error(`turfSqft must be >= 0, got ${turfSqft}`);
  const areaPrice = turfSqft * pricePerSqft;
  return Math.round(Math.max(areaPrice, minPrice) * 100) / 100;
}
