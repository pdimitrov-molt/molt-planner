-- M0-005: Align legacy projects table with the domain model.
-- Idempotent: safe to run on databases that already applied partial 002 changes.

-- ---------------------------------------------------------------------------
-- Ensure clients table exists (required for client_id FK)
-- ---------------------------------------------------------------------------

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  contact_email text,
  contact_phone text,
  preferred_channel text not null default 'email',
  decision_style text not null default 'collaborative',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists clients_deleted_at_idx on public.clients (deleted_at);

-- ---------------------------------------------------------------------------
-- Add domain columns when missing
-- ---------------------------------------------------------------------------

alter table public.projects
  add column if not exists client_id uuid,
  add column if not exists site_address text,
  add column if not exists site_area numeric,
  add column if not exists engagement_status text,
  add column if not exists priority text,
  add column if not exists target_handover_date date,
  add column if not exists updated_at timestamptz default now(),
  add column if not exists deleted_at timestamptz;

-- ---------------------------------------------------------------------------
-- Backfill from legacy columns when they still exist
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'address'
  ) then
    execute $sql$
      update public.projects
      set site_address = coalesce(site_address, address)
      where site_address is null
        and address is not null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'area'
  ) then
    execute $sql$
      update public.projects
      set site_area = coalesce(site_area, area)
      where site_area is null
        and area is not null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'status'
  ) then
    execute $sql$
      update public.projects
      set engagement_status = case
        when engagement_status in ('inquiry', 'active', 'paused', 'completed', 'archived')
          then engagement_status
        when status = 'completed' then 'completed'
        when status in ('on_hold', 'paused') then 'paused'
        when status = 'archived' then 'archived'
        when status = 'inquiry' then 'inquiry'
        when status = 'active' then 'active'
        when status is not null and trim(status) <> '' then 'active'
        else coalesce(engagement_status, 'inquiry')
      end
      where engagement_status is null
         or engagement_status = ''
         or engagement_status not in ('inquiry', 'active', 'paused', 'completed', 'archived')
    $sql$;
  end if;
end $$;

update public.projects
set engagement_status = coalesce(nullif(engagement_status, ''), 'inquiry')
where engagement_status is null or engagement_status = '';

update public.projects
set priority = case
  when priority in ('low', 'normal', 'high', 'critical') then priority
  else 'normal'
end
where priority is null
   or priority = ''
   or priority not in ('low', 'normal', 'high', 'critical');

update public.projects
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

-- ---------------------------------------------------------------------------
-- Create clients from legacy client_name and link projects
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'client_name'
  ) then
    execute $sql$
      insert into public.clients (display_name, created_at, updated_at)
      select distinct trim(p.client_name), now(), now()
      from public.projects p
      where p.client_id is null
        and p.client_name is not null
        and trim(p.client_name) <> ''
        and not exists (
          select 1
          from public.clients c
          where c.display_name = trim(p.client_name)
            and c.deleted_at is null
        )
    $sql$;

    execute $sql$
      update public.projects p
      set client_id = c.id
      from public.clients c
      where p.client_id is null
        and p.client_name is not null
        and trim(p.client_name) <> ''
        and c.display_name = trim(p.client_name)
        and c.deleted_at is null
    $sql$;
  end if;
end $$;

insert into public.clients (display_name, created_at, updated_at)
select 'Unassigned Client', now(), now()
where exists (
  select 1
  from public.projects
  where client_id is null
)
and not exists (
  select 1
  from public.clients
  where display_name = 'Unassigned Client'
    and deleted_at is null
);

update public.projects p
set client_id = c.id
from public.clients c
where p.client_id is null
  and c.display_name = 'Unassigned Client'
  and c.deleted_at is null;

-- ---------------------------------------------------------------------------
-- Enforce NOT NULL defaults on required domain columns
-- ---------------------------------------------------------------------------

alter table public.projects
  alter column engagement_status set default 'inquiry',
  alter column priority set default 'normal',
  alter column updated_at set default now();

update public.projects
set engagement_status = 'inquiry'
where engagement_status is null;

update public.projects
set priority = 'normal'
where priority is null;

alter table public.projects
  alter column engagement_status set not null,
  alter column priority set not null,
  alter column updated_at set not null;

-- ---------------------------------------------------------------------------
-- Foreign key and indexes
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_client_id_fkey'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_client_id_fkey
      foreign key (client_id) references public.clients (id);
  end if;
end $$;

create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists projects_engagement_status_idx on public.projects (engagement_status);
create index if not exists projects_deleted_at_idx on public.projects (deleted_at);

drop index if exists public.projects_status_idx;

-- ---------------------------------------------------------------------------
-- Drop legacy columns once data has been migrated
-- ---------------------------------------------------------------------------

alter table public.projects
  drop column if exists client_name,
  drop column if exists address,
  drop column if exists area,
  drop column if exists status;

-- Require client_id after backfill (only when no orphaned rows remain).
do $$
begin
  if not exists (
    select 1
    from public.projects
    where client_id is null
  ) then
    alter table public.projects
      alter column client_id set not null;
  end if;
end $$;
