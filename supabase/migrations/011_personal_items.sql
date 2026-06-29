-- MOLT OS: personal items domain (non-project tasks)

create table if not exists public.personal_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'personal',
  priority text not null default 'normal',
  status text not null default 'TODO',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint personal_items_title_check check (length(trim(title)) > 0),
  constraint personal_items_category_check check (
    category in (
      'personal',
      'shopping',
      'reminder',
      'phone_call',
      'meeting',
      'errand',
      'health',
      'family',
      'finance',
      'travel',
      'goal',
      'other'
    )
  ),
  constraint personal_items_priority_check check (
    priority in ('low', 'normal', 'high', 'urgent')
  ),
  constraint personal_items_status_check check (
    status in ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED')
  )
);

create index if not exists personal_items_deleted_at_idx
  on public.personal_items (deleted_at);

create index if not exists personal_items_status_idx
  on public.personal_items (status)
  where deleted_at is null;

create index if not exists personal_items_due_date_idx
  on public.personal_items (due_date)
  where deleted_at is null;

create index if not exists personal_items_category_idx
  on public.personal_items (category)
  where deleted_at is null;
