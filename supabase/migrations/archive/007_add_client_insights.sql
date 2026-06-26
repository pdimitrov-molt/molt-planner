-- Safe additive migration: client_insights on clients

alter table public.clients
  add column if not exists client_insights text;

-- Backfill from legacy notes where insights are empty
update public.clients
set client_insights = notes
where client_insights is null
  and notes is not null
  and trim(notes) <> '';
