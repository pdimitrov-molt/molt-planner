-- M9.0 — Project Settings extras (team, document templates, files metadata)

alter table public.projects
  add column if not exists settings_extras jsonb not null default '{}'::jsonb;
