-- M6.5: Workflow core refactor — stage instances as source of truth for progress

drop table if exists public.workflow_stage_instances cascade;

create table public.workflow_stage_instances (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  group_key text not null,
  stage_key text not null,
  group_name text not null,
  stage_name text not null,
  execution_mode text not null,
  instance_type text not null,
  room_id uuid references public.rooms (id) on delete cascade,
  document_key text,
  assigned_user_id uuid,
  status text not null default 'not_started',
  estimated_minutes integer not null default 480,
  worked_minutes integer not null default 0,
  progress_percent integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  last_activity_at timestamptz,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  legacy_phase_id uuid references public.phases (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint workflow_stage_instances_execution_mode_check check (
    execution_mode in ('PROJECT', 'ROOMS', 'DOCUMENTS')
  ),
  constraint workflow_stage_instances_instance_type_check check (
    instance_type in ('project', 'room', 'document')
  ),
  constraint workflow_stage_instances_status_check check (
    status in ('not_started', 'in_progress', 'blocked', 'completed')
  ),
  constraint workflow_stage_instances_progress_percent_check check (
    progress_percent >= 0 and progress_percent <= 100
  ),
  constraint workflow_stage_instances_estimated_minutes_check check (
    estimated_minutes >= 0
  ),
  constraint workflow_stage_instances_worked_minutes_check check (
    worked_minutes >= 0
  )
);

create index workflow_stage_instances_project_id_idx
  on public.workflow_stage_instances (project_id);

create index workflow_stage_instances_group_stage_idx
  on public.workflow_stage_instances (project_id, group_key, stage_key);

create index workflow_stage_instances_room_id_idx
  on public.workflow_stage_instances (room_id)
  where room_id is not null;

create index workflow_stage_instances_document_key_idx
  on public.workflow_stage_instances (project_id, document_key)
  where document_key is not null;

create index workflow_stage_instances_status_idx
  on public.workflow_stage_instances (project_id, status)
  where deleted_at is null;

create index workflow_stage_instances_assigned_user_id_idx
  on public.workflow_stage_instances (assigned_user_id)
  where assigned_user_id is not null;

create index workflow_stage_instances_deleted_at_idx
  on public.workflow_stage_instances (deleted_at);

create unique index workflow_stage_instances_project_room_uidx
  on public.workflow_stage_instances (project_id, group_key, stage_key, room_id)
  where deleted_at is null
    and room_id is not null
    and document_key is null;

create unique index workflow_stage_instances_project_document_uidx
  on public.workflow_stage_instances (project_id, group_key, stage_key, document_key)
  where deleted_at is null
    and document_key is not null;

create unique index workflow_stage_instances_project_single_uidx
  on public.workflow_stage_instances (project_id, group_key, stage_key)
  where deleted_at is null
    and room_id is null
    and document_key is null
    and execution_mode = 'PROJECT';

create index workflow_stage_instances_legacy_phase_id_idx
  on public.workflow_stage_instances (legacy_phase_id)
  where legacy_phase_id is not null;
