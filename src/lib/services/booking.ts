// Booking creation (server-side): customer upsert + property + job insert.

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Customer, Job, Property } from "@/lib/types";
import { estimateLotSize } from "./lot-size";
import { calculateQuote } from "./pricing";
import { getLawnMowingService } from "./services";

export const BOOKING_WINDOW_DAYS = 14;

export interface BookingRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  /** YYYY-MM-DD, within the next BOOKING_WINDOW_DAYS days. */
  scheduledDate: string;
}

export interface BookingSummary {
  jobId: string;
  serviceName: string;
  address: string;
  scheduledDate: string;
  quotedPrice: number;
  turfSqft: number;
  customerName: string;
  customerEmail: string;
}

function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function validate(req: BookingRequest): void {
  if (!req.name.trim()) throw new Error("Please enter your name.");
  if (!/^\S+@\S+\.\S+$/.test(req.email.trim())) {
    throw new Error("Please enter a valid email address.");
  }
  if (!req.address.trim()) throw new Error("Please select an address.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(req.scheduledDate)) {
    throw new Error("Please pick a service date.");
  }

  const today = new Date();
  const minDate = toISODate(today);
  const maxDate = toISODate(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + BOOKING_WINDOW_DAYS)
  );
  if (req.scheduledDate < minDate || req.scheduledDate > maxDate) {
    throw new Error(`Service dates must be within the next ${BOOKING_WINDOW_DAYS} days.`);
  }
}

export async function createBooking(req: BookingRequest): Promise<BookingSummary> {
  validate(req);

  if (!isSupabaseConfigured()) {
    throw new Error(
      "Bookings need a database connection — copy .env.local.example to .env.local and add your Supabase keys."
    );
  }

  const service = await getLawnMowingService();
  if (!service.id) {
    throw new Error("Service pricing is unavailable — run supabase/seed.sql.");
  }

  // Recompute the estimate and price server-side; never trust client numbers.
  const estimate = await estimateLotSize(req.address);
  const quotedPrice = calculateQuote({
    turfSqft: estimate.turfSqft,
    pricePerSqft: service.pricePerSqft,
    minPrice: service.minPrice,
  });

  const supabase = await createClient();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .upsert(
      {
        name: req.name.trim(),
        email: req.email.trim().toLowerCase(),
        phone: req.phone.trim(),
      },
      { onConflict: "email" }
    )
    .select()
    .single<Customer>();
  if (customerError || !customer) {
    throw new Error(`Could not save your details (${customerError?.message ?? "unknown error"}).`);
  }

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .insert({
      customer_id: customer.id,
      address: req.address.trim(),
      latitude: req.latitude,
      longitude: req.longitude,
      estimated_turf_sqft: estimate.turfSqft,
    })
    .select()
    .single<Property>();
  if (propertyError || !property) {
    throw new Error(`Could not save the property (${propertyError?.message ?? "unknown error"}).`);
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      property_id: property.id,
      service_id: service.id,
      scheduled_date: req.scheduledDate,
      status: "requested",
      quoted_price: quotedPrice,
    })
    .select()
    .single<Job>();
  if (jobError || !job) {
    throw new Error(`Could not create the booking (${jobError?.message ?? "unknown error"}).`);
  }

  return {
    jobId: job.id,
    serviceName: service.name,
    address: property.address,
    scheduledDate: req.scheduledDate,
    quotedPrice,
    turfSqft: estimate.turfSqft,
    customerName: customer.name,
    customerEmail: customer.email,
  };
}
