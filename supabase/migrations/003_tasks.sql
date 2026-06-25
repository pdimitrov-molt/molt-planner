create table if not exists public.tasks (
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
  deleted_at timestamptz
);

create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists tasks_room_id_idx on public.tasks (room_id);
create index if not exists tasks_scheduled_date_idx on public.tasks (scheduled_date);
create index if not exists tasks_deleted_at_idx on public.tasks (deleted_at);
