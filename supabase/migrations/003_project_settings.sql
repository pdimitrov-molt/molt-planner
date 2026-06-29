-- M5.2 — Project settings: workflow type, hour estimates, workflow definition

alter table public.projects
  add column if not exists workflow_type text not null default 'interior_design',
  add column if not exists estimated_design_hours numeric,
  add column if not exists estimated_execution_hours numeric,
  add column if not exists workflow_definition jsonb not null default '{"stages":[]}'::jsonb;

alter table public.projects
  drop constraint if exists projects_workflow_type_check;

alter table public.projects
  add constraint projects_workflow_type_check check (
    workflow_type in (
      'interior_design',
      'interior_design_execution',
      'execution_only',
      'exterior_design',
      'exterior_execution',
      'consultation',
      'author_supervision'
    )
  );

alter table public.projects
  drop constraint if exists projects_estimated_design_hours_positive_check;

alter table public.projects
  add constraint projects_estimated_design_hours_positive_check check (
    estimated_design_hours is null or estimated_design_hours >= 0
  );

alter table public.projects
  drop constraint if exists projects_estimated_execution_hours_positive_check;

alter table public.projects
  add constraint projects_estimated_execution_hours_positive_check check (
    estimated_execution_hours is null or estimated_execution_hours >= 0
  );
