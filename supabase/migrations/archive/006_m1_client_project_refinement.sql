-- M1.000: Client & project model refinement (safe, additive)

-- ---------------------------------------------------------------------------
-- Clients: contacts + client insights
-- ---------------------------------------------------------------------------

alter table public.clients
  add column if not exists contact_viber text,
  add column if not exists contact_whatsapp text,
  add column if not exists secondary_contact text,
  add column if not exists client_insights text;

update public.clients
set client_insights = notes
where client_insights is null
  and notes is not null
  and trim(notes) <> '';

-- ---------------------------------------------------------------------------
-- Projects: number, category taxonomy, milestone dates
-- ---------------------------------------------------------------------------

alter table public.projects
  add column if not exists project_number text,
  add column if not exists category text,
  add column if not exists object_type text,
  add column if not exists package text,
  add column if not exists design_deadline date,
  add column if not exists execution_deadline date,
  add column if not exists move_in_date date;

-- Backfill category from legacy project_type
update public.projects
set category = case
  when category in ('residential', 'commercial') then category
  when project_type in ('commercial', 'hospitality') then 'commercial'
  when project_type in ('residential', 'renovation', 'staging') then 'residential'
  else coalesce(category, 'residential')
end
where category is null or category = '';

-- Backfill object_type defaults from legacy project_type
update public.projects
set object_type = case
  when object_type is not null and object_type <> '' then object_type
  when project_type = 'hospitality' then 'hotel'
  when project_type = 'staging' then 'apartment'
  when category = 'commercial' or project_type in ('commercial', 'hospitality') then 'office'
  else 'apartment'
end
where object_type is null or object_type = '';

-- Backfill package default
update public.projects
set package = coalesce(nullif(package, ''), 'interior')
where package is null or package = '';

-- Backfill move_in_date from legacy target_handover_date
update public.projects
set move_in_date = target_handover_date
where move_in_date is null
  and target_handover_date is not null;

-- Backfill project_number: YY + 3-digit sequence by created_at
with numbered as (
  select
    id,
    to_char(created_at, 'YY') || lpad(
      row_number() over (order by created_at, id)::text,
      3,
      '0'
    ) as generated_number
  from public.projects
  where project_number is null or trim(project_number) = ''
)
update public.projects as p
set project_number = n.generated_number
from numbered as n
where p.id = n.id;

create unique index if not exists projects_project_number_unique_idx
  on public.projects (project_number)
  where deleted_at is null and project_number is not null;

create index if not exists projects_category_idx on public.projects (category);
