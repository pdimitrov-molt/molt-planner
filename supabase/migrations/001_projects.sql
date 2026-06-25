create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  project_type text not null,
  client_name text,
  address text,
  area numeric,
  status text not null default 'inquiry',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists projects_deleted_at_idx
  on public.projects (deleted_at);

create index if not exists projects_status_idx
  on public.projects (status);
