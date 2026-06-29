-- M8.2 fix: safely ensure workflow_waiting_events exists (idempotent)

create table if not exists public.workflow_waiting_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  workflow_instance_id uuid not null references public.workflow_stage_instances (id) on delete cascade,
  reason text not null,
  custom_reason text,
  started_at timestamptz not null default now(),
  expected_end_at timestamptz,
  ended_at timestamptz,
  status text not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint workflow_waiting_events_reason_check check (
    reason in (
      'client_approval',
      'presentation',
      'payment',
      'measurements',
      'supplier',
      'furniture_production',
      'contractor',
      'delivery',
      'other'
    )
  ),
  constraint workflow_waiting_events_status_check check (
    status in ('ACTIVE', 'COMPLETED', 'CANCELLED')
  ),
  constraint workflow_waiting_events_custom_reason_check check (
    reason <> 'other' or (custom_reason is not null and length(trim(custom_reason)) > 0)
  )
);

create index if not exists workflow_waiting_events_project_id_idx
  on public.workflow_waiting_events (project_id);

create index if not exists workflow_waiting_events_workflow_instance_id_idx
  on public.workflow_waiting_events (workflow_instance_id);

create index if not exists workflow_waiting_events_status_idx
  on public.workflow_waiting_events (workflow_instance_id, status)
  where deleted_at is null;

create unique index if not exists workflow_waiting_events_active_instance_uidx
  on public.workflow_waiting_events (workflow_instance_id)
  where deleted_at is null
    and status = 'ACTIVE';
