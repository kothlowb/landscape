-- Seed data for Phase 1. Idempotent — safe to run more than once.
-- Apply via the Supabase SQL Editor, or with the CLI: supabase db reset
-- (which runs migrations then this file).

-- The one service Phase 1 supports. Pricing: $0.012/sqft with a $45 floor,
-- so a typical 6,000 sqft lawn quotes at $72 and small lots never go below $45.
insert into services (name, price_per_sqft, min_price)
values ('Lawn mowing', 0.012, 45)
on conflict (name) do nothing;

-- A starter crew so the crew view has an assignee concept to grow into.
insert into crews (name)
select 'Crew 1'
where not exists (select 1 from crews where name = 'Crew 1');
