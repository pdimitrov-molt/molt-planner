-- 010: Normalize schema — migrate legacy data, then drop unused columns.
--
-- MIGRATION REPORT
-- ================
--
-- CLIENTS
--   Migrated: notes → client_insights (where insights empty)
--   Dropped:  notes, decision_style
--
-- PROJECTS
--   Migrated: target_handover_date → move_in_date (where move_in_date empty)
--   Migrated: project_type → category / object_type / package (final backfill)
--   Dropped:  target_handover_date, project_type
--   Dropped:  client_name, address, area, status (if still present from 001)
--
-- ROOMS:     (no legacy columns removed)
-- PHASES:    (no legacy columns removed)
-- TASKS:     (no legacy columns removed)

-- =============================================================================
-- CLIENTS
-- =============================================================================

update public.clients
set client_insights = notes
where (client_insights is null or trim(client_insights) = '')
  and notes is not null
  and trim(notes) <> '';

alter table public.clients
  drop column if exists notes,
  drop column if exists decision_style;

-- =============================================================================
-- PROJECTS — data migration before drops
-- =============================================================================

update public.projects
set move_in_date = target_handover_date
where move_in_date is null
  and target_handover_date is not null;

update public.projects
set category = case
  when category in ('residential', 'commercial') then category
  when project_type in ('commercial', 'hospitality') then 'commercial'
  when project_type in ('residential', 'renovation', 'staging') then 'residential'
  else coalesce(nullif(category, ''), 'residential')
end
where category is null or trim(category) = '';

update public.projects
set object_type = case
  when object_type is not null and trim(object_type) <> '' then object_type
  when project_type = 'hospitality' then 'hotel'
  when project_type = 'staging' then 'apartment'
  when category = 'commercial' or project_type in ('commercial', 'hospitality') then 'office'
  else 'apartment'
end
where object_type is null or trim(object_type) = '';

update public.projects
set package = coalesce(nullif(trim(package), ''), 'interior')
where package is null or trim(package) = '';

-- Legacy 001 columns (005 may have already removed these)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'address'
  ) then
    execute $sql$
      update public.projects
      set site_address = coalesce(site_address, address)
      where site_address is null and address is not null
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'area'
  ) then
    execute $sql$
      update public.projects
      set site_area = coalesce(site_area, area)
      where site_area is null and area is not null
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'status'
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
        else coalesce(engagement_status, 'inquiry')
      end
      where engagement_status is null
         or engagement_status = ''
         or engagement_status not in ('inquiry', 'active', 'paused', 'completed', 'archived')
    $sql$;
  end if;
end $$;

alter table public.projects
  drop column if exists target_handover_date,
  drop column if exists project_type,
  drop column if exists client_name,
  drop column if exists address,
  drop column if exists area,
  drop column if exists status;
