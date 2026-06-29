-- Project Settings — workflow and hour estimate columns on projects

alter table public.projects
  add column if not exists workflow_type text not null default 'interior_design',
  add column if not exists workflow_definition jsonb not null default '[]'::jsonb,
  add column if not exists estimated_design_hours integer default 0,
  add column if not exists estimated_execution_hours integer default 0;
