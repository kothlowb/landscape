-- Initial schema for the lawn care platform (Phase 1).
--
-- Apply via the Supabase SQL Editor (paste and run), or with the CLI:
--   supabase db push
--
-- NOTE: RLS is intentionally left disabled for Phase 1 — this is an
-- internal tool with no auth yet. When auth is added, enable RLS on every
-- table and add policies before exposing this beyond the team.

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null default '',
  created_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  address text not null,
  latitude numeric not null,
  longitude numeric not null,
  estimated_turf_sqft numeric not null,
  created_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price_per_sqft numeric not null,
  min_price numeric not null,
  created_at timestamptz not null default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  service_id uuid not null references services (id),
  scheduled_date date not null,
  status text not null default 'requested'
    check (status in ('requested', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  quoted_price numeric not null,
  created_at timestamptz not null default now()
);

create table job_costs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  labor_minutes integer,
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table crews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Lookup patterns the app uses: jobs by date (crew view), jobs by property,
-- job_costs by job (dashboard margin calc).
create index idx_properties_customer_id on properties (customer_id);
create index idx_jobs_property_id on jobs (property_id);
create index idx_jobs_scheduled_date on jobs (scheduled_date);
create index idx_job_costs_job_id on job_costs (job_id);
