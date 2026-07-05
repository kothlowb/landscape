import { describe, expect, it } from "vitest";
import { calculateQuote } from "./pricing";
import { estimateLotSize } from "./lot-size";

describe("calculateQuote", () => {
  it("prices by area when above the minimum", () => {
    expect(calculateQuote({ turfSqft: 6000, pricePerSqft: 0.012, minPrice: 45 })).toBe(72);
  });

  it("applies the price floor for small properties", () => {
    expect(calculateQuote({ turfSqft: 2000, pricePerSqft: 0.012, minPrice: 45 })).toBe(45);
  });

  it("rounds to whole cents", () => {
    // 3701 * 0.0123 = 45.5223 → 45.52
    expect(calculateQuote({ turfSqft: 3701, pricePerSqft: 0.0123, minPrice: 10 })).toBe(45.52);
  });

  it("rejects negative area", () => {
    expect(() => calculateQuote({ turfSqft: -1, pricePerSqft: 0.012, minPrice: 45 })).toThrow();
  });
});

describe("estimateLotSize (stub)", () => {
  it("is deterministic for the same address regardless of case/whitespace", async () => {
    const a = await estimateLotSize("123 Main St, Madison, WI");
    const b = await estimateLotSize("  123 main st, madison, wi ");
    expect(a.turfSqft).toBe(b.turfSqft);
    expect(a.source).toBe("stub");
  });

  it("stays within the expected suburban range", async () => {
    for (const addr of ["1 A St", "999 Long Meadow Farm Rd", "42 Elm"]) {
      const { turfSqft } = await estimateLotSize(addr);
      expect(turfSqft).toBeGreaterThanOrEqual(2000);
      expect(turfSqft).toBeLessThanOrEqual(14000);
    }
  });
});
