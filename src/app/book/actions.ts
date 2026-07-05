"use server";

import { estimateLotSize } from "@/lib/services/lot-size";
import { calculateQuote } from "@/lib/services/pricing";
import { getLawnMowingService } from "@/lib/services/services";
import {
  createBooking,
  type BookingRequest,
  type BookingSummary,
} from "@/lib/services/booking";

export interface QuotePayload {
  address: string;
  turfSqft: number;
  price: number;
  serviceName: string;
  /** True when Supabase isn't configured and seed-default pricing is used. */
  usingFallbackPricing: boolean;
}

export type QuoteResult =
  | { ok: true; quote: QuotePayload }
  | { ok: false; error: string };

export type BookingResult =
  | { ok: true; booking: BookingSummary }
  | { ok: false; error: string };

export async function getQuoteForAddress(address: string): Promise<QuoteResult> {
  try {
    const trimmed = address.trim();
    if (!trimmed) return { ok: false, error: "Enter an address to get a quote." };

    const [estimate, service] = await Promise.all([
      estimateLotSize(trimmed),
      getLawnMowingService(),
    ]);
    const price = calculateQuote({
      turfSqft: estimate.turfSqft,
      pricePerSqft: service.pricePerSqft,
      minPrice: service.minPrice,
    });

    return {
      ok: true,
      quote: {
        address: trimmed,
        turfSqft: estimate.turfSqft,
        price,
        serviceName: service.name,
        usingFallbackPricing: service.isFallback,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not build a quote.",
    };
  }
}

export async function submitBooking(request: BookingRequest): Promise<BookingResult> {
  try {
    const booking = await createBooking(request);
    return { ok: true, booking };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not create the booking.",
    };
  }
}
