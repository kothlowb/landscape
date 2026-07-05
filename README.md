# Landscape

MVP for a lawn care service platform: a customer-facing booking flow (instant quote based on estimated lot size) plus internal crew and owner-dashboard tools.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres) for data + auth-ready client setup
- Google Maps JavaScript API (Places autocomplete)

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL/anon key and Google Maps API key.
3. In the Supabase SQL Editor, run `supabase/migrations/00001_initial_schema.sql`, then `supabase/seed.sql`.
4. `npm run dev`

## Project structure

- `src/app/` — routes (`/book`, `/crew`, `/dashboard`)
- `src/lib/types.ts` — data model types matching the Supabase schema
- `src/lib/supabase/` — browser + server Supabase clients
- `src/lib/services/` — Supabase queries, pricing logic, lot-size estimation, Maps integration
- `supabase/` — SQL migration and seed script
