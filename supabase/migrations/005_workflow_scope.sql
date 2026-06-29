-- M6.4: Project-scoped work sessions (nullable room_id)

alter table public.work_sessions
  alter column room_id drop not null;
