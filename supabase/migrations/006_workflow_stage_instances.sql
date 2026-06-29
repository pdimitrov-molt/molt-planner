-- M6.5: Workflow stage instances (execution mode materialization)

create table public.workflow_stage_instances (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  group_id uuid not null,
  stage_id uuid not null,
  stage_key text not null,
  execution_mode text not null,
  room_id uuid references public.rooms (id) on delete cascade,
  document_item_id uuid,
  document_item_key text,
  document_item_name text,
  phase_id uuid not null references public.phases (id) on delete restrict,
  status text not null default 'not_started',
  estimated_hours numeric not null default 8,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint workflow_stage_instances_execution_mode_check check (
    execution_mode in ('PROJECT', 'ROOMS', 'DOCUMENTS')
  ),
  constraint workflow_stage_instances_status_check check (
    status in ('not_started', 'in_progress', 'blocked', 'completed')
  )
);

create index workflow_stage_instances_project_id_idx
  on public.workflow_stage_instances (project_id);

create index workflow_stage_instances_stage_id_idx
  on public.workflow_stage_instances (stage_id);

create index workflow_stage_instances_phase_id_idx
  on public.workflow_stage_instances (phase_id);

create unique index workflow_stage_instances_project_stage_room_uidx
  on public.workflow_stage_instances (project_id, stage_id, room_id)
  where deleted_at is null
    and room_id is not null
    and document_item_id is null;

create unique index workflow_stage_instances_project_stage_project_uidx
  on public.workflow_stage_instances (project_id, stage_id)
  where deleted_at is null
    and room_id is null
    and document_item_id is null
    and execution_mode = 'PROJECT';

create unique index workflow_stage_instances_project_stage_document_uidx
  on public.workflow_stage_instances (project_id, stage_id, document_item_id)
  where deleted_at is null
    and document_item_id is not null;

alter table public.phases
  add column is_workflow_instance boolean not null default false;

create index phases_is_workflow_instance_idx
  on public.phases (is_workflow_instance)
  where is_workflow_instance = true;
