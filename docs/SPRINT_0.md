# Sprint 0 — First Production Milestone

**Product:** MOLT Planner  
**Sprint:** 0  
**Status:** Planned  
**Domain reference:** [DOMAIN_MODEL.md](./DOMAIN_MODEL.md)

---

## Goal

Deliver the **first production-ready Planning Dashboard** that a small interior design studio can use every morning to answer:

> *What am I doing today? What is due? Am I over capacity? What is blocked?*

Sprint 0 establishes the workflow-first foundation defined in the domain model. The homepage becomes a **Planning Dashboard**, not a project list. Projects, clients, rooms, and phases exist to **support planning** — they are not the primary interface.

A studio owner or lead designer must be able to:

1. Set up a client and an active project with at least one room and phase.
2. Create and schedule tasks against rooms and phases.
3. Open the Planning Dashboard for any day and see scheduled work with full context (client → project → room → phase).
4. See daily capacity, planned hours, and over-capacity warnings.

Sprint 0 is **production milestone**, not a prototype: persisted data, validated inputs, soft deletes, repository pattern, and deployable to a hosted environment.

---

## Epics

### Epic 1 — Platform Foundation

Establish the technical baseline required for all features.

**Scope**
- Feature-first folder structure aligned with project rules
- Supabase schema migrations for Sprint 0 entities
- Server-side data access (repository pattern only)
- Server Actions for mutations
- Shared validation (Zod) at service boundaries
- shadcn/ui component baseline
- Environment configuration and deployment readiness

---

### Epic 2 — Client & Project Context

Introduce proper client relationships and refactor projects into secondary engagement records.

**Scope**
- `Client` entity with workflow-relevant fields (`preferred_channel`, `decision_style`)
- `Project` linked to `Client` (remove denormalized client name)
- Project creation as engagement setup, not dashboard center
- Engagement status separate from design progress

---

### Epic 3 — Room & Phase Workflow

Model spatial and workflow structure so tasks have meaningful context.

**Scope**
- `Room` per project with `room_kind`, priority, and `current_phase_id`
- Ordered `Phase` records per room following `PhaseKind` sequence
- Phase status lifecycle: `not_started`, `in_progress`, `blocked`, `completed`
- Manual phase progression with blocker reason capture

---

### Epic 4 — Task Planning

Make `Task` the schedulable unit of designer work.

**Scope**
- Task creation linked to project, room, and phase
- Task kinds and statuses per domain model
- Schedule tasks to a date (`scheduled_date`)
- Task assignment to a single designer (single-user studio acceptable in Sprint 0)
- Blocked tasks with mandatory `blocked_reason`
- Full context resolution for display: client → project → room → phase

---

### Epic 5 — Capacity & Load

Expose studio capacity as a planning constraint.

**Scope**
- Studio-level `Capacity` profile (default weekly hours)
- Computed `planned_hours`, `available_hours`, and `load_percent` per day
- Over-capacity warnings when scheduled task hours exceed daily capacity
- Reuse existing capacity calculation logic where applicable

---

### Epic 6 — Planning Dashboard

Replace the current project-centric homepage with the primary product surface.

**Scope**
- `PlanningDay` read model composed server-side for a selected date
- Today view as default landing page
- Date navigation (previous / next day, jump to today)
- Sections: scheduled tasks, phase deadlines, blocked items, capacity summary
- Empty states guided toward creating schedulable work, not browsing projects

---

### Epic 7 — Secondary Project Access

Provide minimal project management without making it the product center.

**Scope**
- Project list accessible from navigation (not homepage)
- Project detail showing rooms, phases, and tasks
- No standalone project CRUD dashboard on `/`

---

## User Stories

### Platform Foundation

| ID | Story | Priority |
|---|---|---|
| S0-01 | As a developer, I want all entities to use soft deletes and standard timestamps so that data integrity and recovery are consistent. | Must |
| S0-02 | As a developer, I want Supabase access isolated to repositories so that UI and actions never touch the database directly. | Must |
| S0-03 | As a developer, I want Zod validation on all write operations so that invalid workflow data cannot enter the system. | Must |

### Client & Project Context

| ID | Story | Priority |
|---|---|---|
| S0-04 | As a lead designer, I want to create a client with communication preferences so that project context reflects how they make decisions. | Must |
| S0-05 | As a lead designer, I want to create a project linked to a client so that engagements are properly anchored. | Must |
| S0-06 | As a lead designer, I want project engagement status separate from design progress so that I am not misled by a single status field. | Must |
| S0-07 | As a lead designer, I want to archive a project so that finished engagements leave the active planning view. | Should |

### Room & Phase Workflow

| ID | Story | Priority |
|---|---|---|
| S0-08 | As a designer, I want to add rooms to a project so that work is organized by space. | Must |
| S0-09 | As a designer, I want each room to have ordered phases so that workflow follows the interior design process. | Must |
| S0-10 | As a designer, I want to mark a phase as in progress so that the room reflects where work is happening now. | Must |
| S0-11 | As a designer, I want to block a phase with a reason so that the planning dashboard surfaces stalled work. | Must |
| S0-12 | As a designer, I want to complete a phase so that the room advances through the workflow. | Must |

### Task Planning

| ID | Story | Priority |
|---|---|---|
| S0-13 | As a designer, I want to create a task within a room and phase so that work is tied to workflow context. | Must |
| S0-14 | As a designer, I want to estimate hours on a task so that capacity planning is possible. | Must |
| S0-15 | As a designer, I want to schedule a task to a specific day so that it appears on my planning dashboard. | Must |
| S0-16 | As a designer, I want to mark a task as blocked with a reason so that blockers are visible on the dashboard. | Must |
| S0-17 | As a designer, I want to complete a task so that progress reflects actual work done. | Must |
| S0-18 | As a designer, I want every scheduled task to show client, project, room, and phase so that I never lose context. | Must |

### Capacity & Load

| ID | Story | Priority |
|---|---|---|
| S0-19 | As a studio owner, I want to set weekly studio capacity so that the planner knows how much work fits. | Must |
| S0-20 | As a designer, I want to see planned vs. available hours on each day so that I know if I am overcommitted. | Must |
| S0-21 | As a designer, I want a visible warning when a day exceeds capacity so that I can reschedule before committing. | Must |

### Planning Dashboard

| ID | Story | Priority |
|---|---|---|
| S0-22 | As a designer, I want the homepage to open on today's plan so that I immediately see what to work on. | Must |
| S0-23 | As a designer, I want to navigate between days so that I can plan ahead or review past work. | Must |
| S0-24 | As a designer, I want phase deadlines on a day surfaced on the dashboard so that I do not miss milestones. | Should |
| S0-25 | As a designer, I want blocked tasks and phases highlighted on the dashboard so that I address stalls first. | Must |
| S0-26 | As a designer, I want an empty day to guide me toward creating schedulable tasks rather than showing an empty project list. | Must |

### Secondary Project Access

| ID | Story | Priority |
|---|---|---|
| S0-27 | As a lead designer, I want a project list in navigation so that I can manage engagements without it being the homepage. | Should |
| S0-28 | As a designer, I want a project detail page showing rooms, phases, and tasks so that I can drill into engagement context. | Should |

---

## Acceptance Criteria

### Sprint-level (Definition of Done)

Sprint 0 is complete when **all Must** stories are done and the criteria below are met:

1. **Planning-first homepage**
   - `/` renders the Planning Dashboard for today's date.
   - No project table or generic CRUD list appears on the homepage.

2. **End-to-end workflow path**
   - A user can create: Client → Project → Room → Phases → Task → schedule task to today.
   - The scheduled task appears on the Planning Dashboard with client, project, room, and phase context.

3. **Capacity enforcement visibility**
   - Dashboard shows `capacity_hours`, `planned_hours`, `available_hours`, and `load_percent` for the selected day.
   - Days where `planned_hours > capacity_hours` display a visible over-capacity warning.

4. **Blocked work visibility**
   - Tasks with `status = blocked` appear in a dedicated blocked section on the Planning Dashboard.
   - Phases with `status = blocked` appear in a dedicated blocked section on the Planning Dashboard.
   - Blocker reason is required and displayed.

5. **Domain model alignment**
   - Persisted entities match [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) field names and enums for Sprint 0 scope.
   - All tables include `id`, `created_at`, `updated_at`, `deleted_at`.
   - `Project` references `Client` by FK; no denormalized client name on project records.

6. **Architecture compliance**
   - Feature-first structure under `features/`.
   - Repository pattern for all data access.
   - Server Actions for all mutations.
   - Server Components by default; client components only for interaction.
   - No `any` in TypeScript.
   - No direct Supabase access outside repositories.

7. **Production readiness**
   - Application builds without errors.
   - Database migrations are versioned and documented.
   - Environment variables documented for Supabase connection.
   - Deployable to a hosted environment (e.g. Vercel + Supabase).

---

### Epic-level acceptance criteria

#### Epic 1 — Platform Foundation
- [ ] Migrations exist for all Sprint 0 tables.
- [ ] Each feature has `types`, `validation`, `repository`, `service`, `actions`, and `components` where applicable.
- [ ] Invalid writes return structured validation errors.

#### Epic 2 — Client & Project Context
- [ ] Clients can be created, updated, and soft-deleted.
- [ ] Projects require a valid `client_id`.
- [ ] Legacy denormalized `client_name` on projects is removed or migrated.

#### Epic 3 — Room & Phase Workflow
- [ ] Rooms belong to a project and expose `current_phase_id`.
- [ ] Phases are created in correct `PhaseKind` order for each room.
- [ ] Only one phase per room can be `in_progress` at a time.

#### Epic 4 — Task Planning
- [ ] Tasks require `project_id`, `room_id`, `phase_id`, and `estimated_hours`.
- [ ] Tasks can be scheduled, blocked, and completed.
- [ ] Scheduled tasks appear on the correct `PlanningDay`.

#### Epic 5 — Capacity & Load
- [ ] Studio capacity profile is configurable.
- [ ] Daily load is computed from scheduled task estimated hours.
- [ ] Over-capacity state is calculated and surfaced.

#### Epic 6 — Planning Dashboard
- [ ] Dashboard composes `PlanningDay` server-side.
- [ ] Date navigation works without full page reload where appropriate.
- [ ] Empty states are workflow-oriented.

#### Epic 7 — Secondary Project Access
- [ ] Project list is reachable via navigation, not as homepage.
- [ ] Project detail shows hierarchical room → phase → task context.

---

## Out of Scope

The following are explicitly **not** part of Sprint 0. They belong to future sprints.

### Domain entities (deferred)

| Entity | Reason deferred |
|---|---|
| `RoomTemplate` | Manual room and phase setup is sufficient for first production use |
| `TaskDependency` | Single-designer scheduling without dependency graph is acceptable for Sprint 0 |
| `WorkSession` | Estimated hours only; actual time logging comes later |
| `Meeting` | Calendar meetings and agenda management are a separate workflow surface |

### AI features (deferred)

- Daily briefing generation
- Auto-scheduling and task breakdown
- Client communication drafts
- Estimate improvement from historical data
- Blocker prediction

All AI usage described in [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) is **future** — Sprint 0 delivers the structured data and dashboard AI will later operate on.

### Product features (deferred)

- Multi-designer studio with per-designer capacity and assignment views
- Authentication and role-based access (designer, lead, admin)
- Client portal or external sharing
- File uploads (moodboards, drawings, specs)
- FF&E / procurement tracking beyond task titles
- Notifications (email, push, reminders)
- Calendar sync (Google Calendar, Outlook)
- Reporting and analytics dashboards
- Mobile-native experience
- Internationalization

### Technical scope (deferred)

- Real-time collaboration
- Offline support
- Background jobs and queue workers
- Full audit log beyond soft delete
- API for third-party integrations
- End-to-end test suite (manual QA acceptable for Sprint 0)

### Legacy cleanup note

The existing project-centric dashboard and denormalized project model must be **replaced or refactored** during Sprint 0 — not extended. Sprint 0 is a pivot, not an incremental CRUD expansion.

---

## Success Metrics

| Metric | Target |
|---|---|
| Time to first scheduled task (new studio) | < 10 minutes |
| Planning Dashboard load time | < 2 seconds on broadband |
| Context completeness on scheduled tasks | 100% show client, project, room, phase |
| Over-capacity days surfaced | 100% visible when planned hours exceed capacity |
| Homepage is Planning Dashboard | Yes — verified in production |

---

## Dependencies & Assumptions

**Assumptions**
- Single studio, single active designer for Sprint 0 (multi-designer data model optional but UI can default to studio-wide view).
- Supabase is the production database.
- English-only UI.
- Designers accept manual room and phase setup without templates in Sprint 0.

**Dependencies**
- Approved domain model ([DOMAIN_MODEL.md](./DOMAIN_MODEL.md))
- Supabase project with migrations applied
- Hosted deployment target available

---

## References

- [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) — Approved entity definitions and business rules
- `.cursor/rules/project-rules.mdc` — Engineering conventions
