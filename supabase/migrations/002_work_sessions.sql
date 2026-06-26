-- M2.1: Work sessions — time tracking foundation

create table public.work_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  room_id uuid not null references public.rooms (id) on delete cascade,
  phase_id uuid not null references public.phases (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer,
  status text not null default 'running',
  note text,
  next_step text,
  blocker text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint work_sessions_status_check check (
    status in ('running', 'paused', 'completed', 'cancelled')
  )
);

create index work_sessions_project_id_idx on public.work_sessions (project_id);
create index work_sessions_room_id_idx on public.work_sessions (room_id);
create index work_sessions_phase_id_idx on public.work_sessions (phase_id);
create index work_sessions_status_idx on public.work_sessions (status);
create index work_sessions_deleted_at_idx on public.work_sessions (deleted_at);

create trigger work_sessions_set_updated_at
  before update on public.work_sessions
  for each row
  execute function public.set_updated_at();
