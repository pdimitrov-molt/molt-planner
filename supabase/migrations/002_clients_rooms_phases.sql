-- M0-001: Clients, rooms, phases, and domain-aligned projects

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

alter table public.projects
  add column if not exists client_id uuid references public.clients (id),
  add column if not exists engagement_status text not null default 'inquiry',
  add column if not exists priority text not null default 'normal',
  add column if not exists site_address text,
  add column if not exists site_area numeric,
  add column if not exists target_handover_date date;

update public.projects
set site_address = coalesce(site_address, address),
    site_area = coalesce(site_area, area),
    engagement_status = coalesce(
      case status
        when 'completed' then 'completed'
        when 'on_hold' then 'paused'
        else 'active'
      end,
      'inquiry'
    )
where site_address is null or site_area is null or engagement_status = 'inquiry';

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  room_template_key text,
  name text not null,
  room_kind text not null,
  scope_summary text,
  priority text not null default 'normal',
  current_phase_id uuid,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists rooms_project_id_idx on public.rooms (project_id);
create index if not exists rooms_deleted_at_idx on public.rooms (deleted_at);

create table if not exists public.phases (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  phase_kind text not null,
  status text not null default 'not_started',
  target_start_date date,
  target_end_date date,
  completed_at timestamptz,
  blocker_reason text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists phases_room_id_idx on public.phases (room_id);
create index if not exists phases_deleted_at_idx on public.phases (deleted_at);

alter table public.rooms
  add constraint rooms_current_phase_id_fkey
  foreign key (current_phase_id) references public.phases (id)
  deferrable initially deferred;

create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists projects_engagement_status_idx on public.projects (engagement_status);
