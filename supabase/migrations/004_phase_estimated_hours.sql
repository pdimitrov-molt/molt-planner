-- M0-003: Phase estimated hours for capacity planning

alter table public.phases
  add column if not exists estimated_hours numeric not null default 8;

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
where estimated_hours is null or estimated_hours = 8;
