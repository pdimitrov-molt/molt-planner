-- 008: Sync Supabase schema with application expectations.
-- Safe, additive only: ALTER TABLE + ADD COLUMN IF NOT EXISTS + backfills.
-- Idempotent — safe even if 006/007 were partially applied.

-- ---------------------------------------------------------------------------
-- clients — M1 contact fields + client insights
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
-- projects — domain columns (002/005) + M1 taxonomy & dates
-- ---------------------------------------------------------------------------

alter table public.projects
  add column if not exists client_id uuid,
  add column if not exists engagement_status text,
  add column if not exists priority text,
  add column if not exists site_address text,
  add column if not exists site_area numeric,
  add column if not exists target_handover_date date,
  add column if not exists project_number text,
  add column if not exists category text,
  add column if not exists object_type text,
  add column if not exists package text,
  add column if not exists design_deadline date,
  add column if not exists execution_deadline date,
  add column if not exists move_in_date date;

-- Backfill engagement_status from legacy status column when present
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'status'
  ) then
    execute $sql$
      update public.projects
      set engagement_status = case
        when engagement_status in ('inquiry', 'active', 'paused', 'completed', 'archived')
          then engagement_status
        when status = 'completed' then 'completed'
        when status in ('on_hold', 'paused') then 'paused'
        when status = 'archived' then 'archived'
        when status = 'inquiry' then 'inquiry'
        when status = 'active' then 'active'
        when status is not null and trim(status) <> '' then 'active'
        else coalesce(engagement_status, 'inquiry')
      end
      where engagement_status is null
         or engagement_status = ''
         or engagement_status not in ('inquiry', 'active', 'paused', 'completed', 'archived')
    $sql$;
  end if;
end $$;

update public.projects
set engagement_status = coalesce(nullif(engagement_status, ''), 'inquiry')
where engagement_status is null or engagement_status = '';

update public.projects
set priority = case
  when priority in ('low', 'normal', 'high', 'critical') then priority
  else 'normal'
end
where priority is null
   or priority = ''
   or priority not in ('low', 'normal', 'high', 'critical');

-- Backfill site fields from legacy address/area columns when present
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'address'
  ) then
    execute $sql$
      update public.projects
      set site_address = coalesce(site_address, address)
      where site_address is null
        and address is not null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'area'
  ) then
    execute $sql$
      update public.projects
      set site_area = coalesce(site_area, area)
      where site_area is null
        and area is not null
    $sql$;
  end if;
end $$;

-- Backfill M1 taxonomy from legacy project_type
update public.projects
set category = case
  when category in ('residential', 'commercial') then category
  when project_type in ('commercial', 'hospitality') then 'commercial'
  when project_type in ('residential', 'renovation', 'staging') then 'residential'
  else coalesce(category, 'residential')
end
where category is null or category = '';

update public.projects
set object_type = case
  when object_type is not null and object_type <> '' then object_type
  when project_type = 'hospitality' then 'hotel'
  when project_type = 'staging' then 'apartment'
  when category = 'commercial' or project_type in ('commercial', 'hospitality') then 'office'
  else 'apartment'
end
where object_type is null or object_type = '';

update public.projects
set package = coalesce(nullif(package, ''), 'interior')
where package is null or package = '';

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

-- ---------------------------------------------------------------------------
-- phases — capacity planning column
-- ---------------------------------------------------------------------------

alter table public.phases
  add column if not exists estimated_hours numeric;

update public.phases
set estimated_hours = case phase_kind
  when 'discovery' then 8
  when 'concept' then 16
  when 'design_development' then 24
  when 'documentation' then 12
  when 'procurement' then 10
  when 'installation' then 8
  when 'styling' then 6
  else 8
end
where estimated_hours is null;
