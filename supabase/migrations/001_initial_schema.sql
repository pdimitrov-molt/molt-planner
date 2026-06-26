-- Schema freeze: canonical application schema (MOLT Planner)

create extension if not exists pgcrypto;

-- =============================================================================
-- clients
-- =============================================================================

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  contact_email text,
  contact_phone text,
  contact_viber text,
  contact_whatsapp text,
  secondary_contact text,
  preferred_channel text not null default 'email',
  client_insights text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint clients_preferred_channel_check check (
    preferred_channel in ('phone', 'email', 'viber', 'whatsapp', 'in_person')
  )
);

create index clients_deleted_at_idx on public.clients (deleted_at);
create index clients_display_name_idx on public.clients (display_name);

-- =============================================================================
-- projects
-- =============================================================================

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id),
  project_number text not null,
  name text not null,
  category text not null default 'residential',
  object_type text not null default 'apartment',
  package text not null default 'interior',
  site_address text,
  site_area numeric,
  engagement_status text not null default 'inquiry',
  priority text not null default 'normal',
  design_deadline date,
  execution_deadline date,
  move_in_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint projects_category_check check (
    category in ('residential', 'commercial')
  ),
  constraint projects_object_type_check check (
    object_type in (
      'apartment',
      'house',
      'penthouse',
      'studio',
      'office',
      'restaurant',
      'hotel',
      'clinic',
      'fitness',
      'retail',
      'beauty_salon',
      'cafe',
      'bar',
      'villa',
      'holiday_apartment',
      'other'
    )
  ),
  constraint projects_package_check check (
    package in (
      'interior',
      'exterior',
      'interior_exterior',
      'author_supervision',
      'complete_package'
    )
  ),
  constraint projects_engagement_status_check check (
    engagement_status in ('inquiry', 'active', 'paused', 'completed', 'archived')
  ),
  constraint projects_priority_check check (
    priority in ('low', 'normal', 'high', 'critical')
  )
);

create index projects_client_id_idx on public.projects (client_id);
create index projects_deleted_at_idx on public.projects (deleted_at);
create index projects_engagement_status_idx on public.projects (engagement_status);
create index projects_created_at_idx on public.projects (created_at desc);
create unique index projects_project_number_active_uidx
  on public.projects (project_number)
  where deleted_at is null;

-- =============================================================================
-- rooms
-- =============================================================================

create table public.rooms (
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
  deleted_at timestamptz,
  constraint rooms_priority_check check (
    priority in ('low', 'normal', 'high')
  ),
  constraint rooms_room_kind_check check (
    room_kind in (
      'entrance',
      'hallway',
      'open_living_area',
      'kitchen',
      'dining_room',
      'master_bedroom',
      'bedroom',
      'kids_room',
      'guest_room',
      'walk_in_closet',
      'bathroom',
      'wc',
      'laundry',
      'storage',
      'pantry',
      'office',
      'terrace',
      'garage',
      'basement',
      'staircase',
      'reception',
      'lobby',
      'meeting_room',
      'open_office',
      'kitchenette',
      'server_room',
      'restroom',
      'restaurant',
      'bar',
      'hotel_room',
      'suite',
      'spa',
      'fitness',
      'medical_room',
      'retail_area',
      'waiting_area',
      'technical_room',
      'other'
    )
  )
);

create index rooms_project_id_idx on public.rooms (project_id);
create index rooms_deleted_at_idx on public.rooms (deleted_at);
create index rooms_current_phase_id_idx on public.rooms (current_phase_id);

-- =============================================================================
-- phases
-- =============================================================================

create table public.phases (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  phase_kind text not null,
  status text not null default 'not_started',
  estimated_hours numeric not null default 8,
  target_start_date date,
  target_end_date date,
  completed_at timestamptz,
  blocker_reason text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint phases_phase_kind_check check (
    phase_kind in (
      'discovery',
      'concept',
      'design_development',
      'documentation',
      'procurement',
      'installation',
      'styling'
    )
  ),
  constraint phases_status_check check (
    status in ('not_started', 'in_progress', 'blocked', 'completed')
  ),
  constraint phases_estimated_hours_positive_check check (
    estimated_hours > 0
  )
);

create index phases_room_id_idx on public.phases (room_id);
create index phases_deleted_at_idx on public.phases (deleted_at);

-- =============================================================================
-- tasks
-- =============================================================================

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  room_id uuid not null references public.rooms (id) on delete cascade,
  phase_id uuid not null references public.phases (id) on delete cascade,
  title text not null,
  description text,
  task_kind text not null,
  status text not null default 'backlog',
  estimated_hours numeric not null default 1,
  scheduled_date date,
  due_date date,
  assignee_id uuid,
  blocked_reason text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint tasks_task_kind_check check (
    task_kind in (
      'site_visit',
      'client_presentation',
      'design_work',
      'sourcing',
      'coordination',
      'review',
      'administration'
    )
  ),
  constraint tasks_status_check check (
    status in ('backlog', 'scheduled', 'in_progress', 'blocked', 'done')
  ),
  constraint tasks_estimated_hours_positive_check check (
    estimated_hours > 0
  )
);

create index tasks_project_id_idx on public.tasks (project_id);
create index tasks_room_id_idx on public.tasks (room_id);
create index tasks_phase_id_idx on public.tasks (phase_id);
create index tasks_scheduled_date_idx on public.tasks (scheduled_date);
create index tasks_deleted_at_idx on public.tasks (deleted_at);

-- =============================================================================
-- updated_at triggers
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_set_updated_at
  before update on public.clients
  for each row
  execute function public.set_updated_at();

create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

create trigger rooms_set_updated_at
  before update on public.rooms
  for each row
  execute function public.set_updated_at();

create trigger phases_set_updated_at
  before update on public.phases
  for each row
  execute function public.set_updated_at();

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- Circular rooms.current_phase_id → phases.id is enforced at application level
-- (avoids ALTER TABLE after both tables exist).
-- =============================================================================
-- updated_at trigger function
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- clients
-- =============================================================================

drop trigger if exists clients_set_updated_at on public.clients;

create trigger clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

-- =============================================================================
-- projects
-- =============================================================================

drop trigger if exists projects_set_updated_at on public.projects;

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

-- =============================================================================
-- rooms
-- =============================================================================

drop trigger if exists rooms_set_updated_at on public.rooms;

create trigger rooms_set_updated_at
before update on public.rooms
for each row
execute function public.set_updated_at();

-- =============================================================================
-- phases
-- =============================================================================

drop trigger if exists phases_set_updated_at on public.phases;

create trigger phases_set_updated_at
before update on public.phases
for each row
execute function public.set_updated_at();

-- =============================================================================
-- tasks
-- =============================================================================

drop trigger if exists tasks_set_updated_at on public.tasks;

create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();