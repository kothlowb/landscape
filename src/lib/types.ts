// Data model types mirroring the Supabase schema (see supabase/migrations).

export type JobStatus =
  | "requested"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Property {
  id: string;
  customer_id: string;
  address: string;
  latitude: number;
  longitude: number;
  estimated_turf_sqft: number;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  price_per_sqft: number;
  min_price: number;
  created_at: string;
}

export interface Job {
  id: string;
  property_id: string;
  service_id: string;
  scheduled_date: string;
  status: JobStatus;
  quoted_price: number;
  created_at: string;
}

export interface JobCost {
  id: string;
  job_id: string;
  labor_minutes: number | null;
  clock_in_at: string | null;
  clock_out_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface Crew {
  id: string;
  name: string;
  created_at: string;
}
