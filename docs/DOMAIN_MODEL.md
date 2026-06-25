# MOLT Planner — Domain Model

**Version:** 1.0  
**Bounded context:** Studio Planning  
**Primary aggregate:** `PlanningDay`  
**Planning unit:** `Task`  
**Workflow spine:** `Phase`  
**Spatial context:** `Room`  
**Engagement container:** `Project` (secondary module)  
**Relationship anchor:** `Client`

This document defines the approved domain model for MOLT Planner. The system is an AI-powered operating system for interior design studios. Every entity exists to support **designer workflow and daily planning**, not generic CRUD.

All persisted entities include:

- `id` (uuid)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz, nullable) — soft delete

---

## Entity Relationship Overview

```
Client
  └── Project
        ├── Meeting
        └── Room ──optional seed from──▶ RoomTemplate
              └── Phase
                    └── Task ◀── TaskDependency ──▶ Task
                          ├── WorkSession
                          └── scheduled onto ──▶ PlanningDay

Capacity ── constrains ──▶ PlanningDay
```

---

## Client

### Purpose

Represents the people the studio serves. A `Client` is the **decision and communication context** for design work — not a generic contact record. Client data travels with every task surfaced on the Planning Dashboard.

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | uuid | yes | Primary key |
| `display_name` | string | yes | Household, company, or primary contact label |
| `contact_email` | string | no | Primary email |
| `contact_phone` | string | no | Primary phone |
| `preferred_channel` | enum | yes | `email`, `phone`, `whatsapp`, `in_person` |
| `decision_style` | enum | yes | `fast`, `collaborative`, `slow`, `committee` |
| `notes` | string | no | Preferences, sensitivities, access constraints |
| `created_at` | timestamptz | yes | |
| `updated_at` | timestamptz | yes | |
| `deleted_at` | timestamptz | no | Soft delete |

### Relationships

- **One → many** `Project`
- **One → many** `Meeting` (via `Project`, resolved at query time)

### Business Rules

- A `Project` must belong to exactly one `Client`.
- Client identity must never be denormalized onto `Project`, `Room`, or `Task`.
- Archiving a `Client` requires all active `Project`s to be `paused` or `archived` first.
- `preferred_channel` and `decision_style` inform meeting scheduling and deadline buffers.

### Future AI Usage

- Summarize client preferences before site visits and presentations.
- Draft client communications matched to `preferred_channel` and `decision_style`.
- Flag projects at risk when client decision style conflicts with compressed timelines.
- Suggest follow-up timing based on historical approval patterns per client.

---

## Project

### Purpose

Represents a design engagement — site, scope, and client context. `Project` is a **secondary module**: it anchors work but is not the center of the Planning Dashboard. Design progress is derived from rooms, phases, and tasks — not from a flat project status field.

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | uuid | yes | Primary key |
| `client_id` | uuid | yes | FK → `Client` |
| `name` | string | yes | e.g. "Riverdale Residence" |
| `project_type` | enum | yes | `residential`, `commercial`, `hospitality`, `renovation`, `staging` |
| `site_address` | string | no | Site visit and delivery location |
| `site_area` | number | no | Total area in square meters |
| `engagement_status` | enum | yes | `inquiry`, `active`, `paused`, `completed`, `archived` |
| `target_handover_date` | date | no | Client-facing milestone |
| `priority` | enum | yes | `low`, `normal`, `high`, `critical` |
| `created_at` | timestamptz | yes | |
| `updated_at` | timestamptz | yes | |
| `deleted_at` | timestamptz | no | Soft delete |

### Relationships

- **Many → one** `Client`
- **One → many** `Room`
- **One → many** `Meeting`
- **One → many** `Task` (denormalized reference for query performance)

### Business Rules

- `engagement_status` reflects business state, not design progress.
- Design progress is always derived from `Room`, `Phase`, and `Task` completion.
- A project cannot move to `completed` while any room has an incomplete final phase (`styling`).
- `priority` influences task scheduling suggestions but does not override capacity constraints.
- New projects may seed rooms from a `RoomTemplate` matching `project_type`.

### Future AI Usage

- Generate project briefs from inquiry notes and client profile.
- Recommend `target_handover_date` feasibility based on room count, phase history, and capacity.
- Detect scope creep when task volume or estimated hours exceed project-type benchmarks.
- Produce handover summaries linking completed rooms, selections, and open snagging items.

---

## Room

### Purpose

Represents a **space within a project** — the unit interior designers think in when planning work. Rooms carry their own phase progression. A kitchen and a master bedroom on the same project may be at different workflow stages simultaneously.

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | uuid | yes | Primary key |
| `project_id` | uuid | yes | FK → `Project` |
| `room_template_id` | uuid | no | FK → `RoomTemplate` (if seeded from template) |
| `name` | string | yes | e.g. "Master Bedroom", "Reception" |
| `room_kind` | enum | yes | `living`, `bedroom`, `kitchen`, `bathroom`, `office`, `retail`, `other` |
| `scope_summary` | string | no | What is being designed in this space |
| `priority` | enum | yes | `low`, `normal`, `high` |
| `current_phase_id` | uuid | no | FK → `Phase`; active workflow position |
| `sort_order` | number | yes | Display order within project |
| `created_at` | timestamptz | yes | |
| `updated_at` | timestamptz | yes | |
| `deleted_at` | timestamptz | no | Soft delete |

### Relationships

- **Many → one** `Project`
- **Many → one** `RoomTemplate` (optional)
- **One → many** `Phase`
- **One → many** `Task`

### Business Rules

- Every room-scoped `Task` must reference exactly one `Room`.
- `current_phase_id` must belong to the same room.
- Only one `Phase` per room may be `in_progress` at a time.
- Phases within a room follow the ordered `PhaseKind` sequence unless explicitly reopened by a senior designer.
- Deleting a room soft-deletes its phases and tasks; hard removal requires no scheduled tasks on future planning days.

### Future AI Usage

- Suggest `scope_summary` from project type, room kind, and client notes.
- Recommend phase duration based on room kind and historical studio data.
- Flag rooms falling behind sibling rooms on the same project.
- Generate room-specific material and FF&E checklists per active phase.

---

## RoomTemplate

### Purpose

Represents a **reusable room blueprint** for a project type. Templates accelerate project setup by pre-defining standard rooms, phase sequences, and default tasks — without forcing every project into identical scope.

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | uuid | yes | Primary key |
| `name` | string | yes | e.g. "Residential Full Home" |
| `project_type` | enum | yes | `residential`, `commercial`, `hospitality`, `renovation`, `staging` |
| `description` | string | no | When to use this template |
| `is_default` | boolean | yes | Default template for the project type |
| `created_at` | timestamptz | yes | |
| `updated_at` | timestamptz | yes | |
| `deleted_at` | timestamptz | no | Soft delete |

### Template Structure (embedded, not separate entities)

Each template contains an ordered list of room definitions:

| Sub-field | Type | Description |
|---|---|---|
| `room_kind` | enum | Same values as `Room.room_kind` |
| `default_name` | string | e.g. "Kitchen" |
| `scope_summary` | string | Default scope text |
| `default_phases` | PhaseKind[] | Phase sequence to instantiate |
| `default_tasks` | object[] | Seed tasks per phase with `title`, `task_kind`, `estimated_hours` |

### Relationships

- **One → many** `Room` (rooms seeded from this template)
- **Belongs to** a `project_type` (logical grouping, not FK)

### Business Rules

- At most one `is_default = true` template per `project_type`.
- Instantiating a template creates `Room`, `Phase`, and optional seed `Task` records — never live references back to the template.
- Templates may be edited without retroactively changing existing projects.
- Custom rooms may always be added alongside template-seeded rooms.

### Future AI Usage

- Propose custom templates from repeated manual project setups.
- Adjust default task estimates per template based on studio velocity data.
- Recommend the best template at project creation based on `site_area`, `project_type`, and scope notes.
- Identify template gaps when designers repeatedly add the same custom rooms.

---

## Phase

### Purpose

Represents a **stage of the interior design process** for a specific room. Phases are the workflow spine — they gate what work is valid, what deadlines apply, and what appears as urgent on the Planning Dashboard.

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | uuid | yes | Primary key |
| `room_id` | uuid | yes | FK → `Room` |
| `phase_kind` | enum | yes | See PhaseKind below |
| `status` | enum | yes | `not_started`, `in_progress`, `blocked`, `completed` |
| `target_start_date` | date | no | Planned start |
| `target_end_date` | date | no | Planned completion |
| `completed_at` | timestamptz | no | Actual completion timestamp |
| `blocker_reason` | string | no | Required when `status = blocked` |
| `sort_order` | number | yes | Fixed sequence within room |
| `created_at` | timestamptz | yes | |
| `updated_at` | timestamptz | yes | |
| `deleted_at` | timestamptz | no | Soft delete |

### PhaseKind (ordered workflow)

| Order | Value | Designer meaning |
|---|---|---|
| 1 | `discovery` | Brief, measurements, constraints |
| 2 | `concept` | Mood, layout direction, material direction |
| 3 | `design_development` | Drawings, selections, revisions |
| 4 | `documentation` | Specs, schedules, contractor packs |
| 5 | `procurement` | Ordering, lead times, deliveries |
| 6 | `installation` | Site coordination, snagging |
| 7 | `styling` | Final layer, photography, handover |

### Relationships

- **Many → one** `Room`
- **One → many** `Task`
- **Referenced by** `Room.current_phase_id`

### Business Rules

- Phases for a room must follow `PhaseKind` order by `sort_order`.
- Only one phase per room may be `in_progress` at a time.
- A phase cannot move to `completed` until all required tasks (those without satisfied dependencies) are `done`.
- `blocker_reason` is mandatory when `status = blocked`.
- `target_end_date` on active phases drives urgency signals on `PlanningDay`.
- Reopening a completed phase requires an audit reason and resets dependent downstream phases to `not_started`.

### Future AI Usage

- Predict phase completion dates from task velocity and remaining estimated hours.
- Detect blockers early from overdue tasks, missing client approvals, and procurement lead times.
- Suggest phase transition checklists before marking a phase complete.
- Recommend parallel phase work across rooms when capacity allows.

---

## Task

### Purpose

Represents **actionable design work** — the atom scheduled on the Planning Dashboard. Tasks connect client context, project scope, room, and phase into a single schedulable unit with estimated effort.

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | uuid | yes | Primary key |
| `project_id` | uuid | yes | FK → `Project` (denormalized for query speed) |
| `room_id` | uuid | yes | FK → `Room` |
| `phase_id` | uuid | yes | FK → `Phase` |
| `title` | string | yes | e.g. "Finalize pendant shortlist" |
| `description` | string | no | Detailed instructions or references |
| `task_kind` | enum | yes | See TaskKind below |
| `status` | enum | yes | `backlog`, `scheduled`, `in_progress`, `blocked`, `done` |
| `estimated_hours` | number | yes | Planned effort; feeds capacity |
| `scheduled_date` | date | no | Day this task occupies on the plan |
| `due_date` | date | no | Hard deadline within phase |
| `assignee_id` | uuid | no | Designer or team member |
| `blocked_reason` | string | no | Required when `status = blocked` |
| `completed_at` | timestamptz | no | Actual completion timestamp |
| `created_at` | timestamptz | yes | |
| `updated_at` | timestamptz | yes | |
| `deleted_at` | timestamptz | no | Soft delete |

### TaskKind

| Value | Meaning |
|---|---|
| `site_visit` | On-site measurement, inspection, or snagging |
| `client_presentation` | Moodboards, reviews, sign-offs |
| `design_work` | Drawings, layouts, visual development |
| `sourcing` | Material, FF&E, and supplier research |
| `coordination` | Contractor, vendor, and logistics coordination |
| `review` | Internal QA or senior review |
| `administration` | Contracts, invoicing, documentation admin |

### Relationships

- **Many → one** `Project`, `Room`, `Phase`
- **One → many** `WorkSession`
- **Many ↔ many** `Task` via `TaskDependency`
- **Scheduled onto** `PlanningDay` when `scheduled_date` is set

### Business Rules

- `estimated_hours` must be greater than zero when `status` is `scheduled` or `in_progress`.
- A task cannot be `done` if its parent `Phase` is `blocked`, unless explicitly force-completed with audit reason.
- Sum of scheduled task hours on a day must be evaluated against `Capacity` — over-capacity days surface as warnings.
- Every task displayed on the dashboard must resolve full context: client → project → room → phase.
- `task_kind = client_presentation` should prefer alignment with a linked `Meeting` when one exists.

### Future AI Usage

- Break phase goals into task lists with realistic hour estimates.
- Auto-schedule tasks onto `PlanningDay` respecting capacity, dependencies, and deadlines.
- Rewrite task titles and descriptions for clarity and actionability.
- Detect stale tasks in `in_progress` and suggest status updates or splits.

---

## TaskDependency

### Purpose

Represents a **finish-to-start (or start-to-start) constraint** between two tasks. Dependencies encode real design workflow — procurement cannot begin until design is approved, installation cannot start until goods are delivered.

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | uuid | yes | Primary key |
| `predecessor_task_id` | uuid | yes | FK → `Task` (must finish or start first) |
| `successor_task_id` | uuid | yes | FK → `Task` (blocked until predecessor satisfied) |
| `dependency_kind` | enum | yes | `finish_to_start`, `start_to_start` |
| `lag_days` | number | yes | Minimum days between predecessor and successor (default `0`) |
| `created_at` | timestamptz | yes | |
| `updated_at` | timestamptz | yes | |
| `deleted_at` | timestamptz | no | Soft delete |

### Relationships

- **Many → one** `Task` as predecessor
- **Many → one** `Task` as successor

### Business Rules

- A task cannot depend on itself.
- Circular dependency chains are forbidden.
- Predecessor and successor must belong to the same `Project` (cross-project dependencies are not supported in v1).
- A successor task cannot move to `scheduled` or `in_progress` until its predecessor satisfies the `dependency_kind` rule.
- `finish_to_start`: predecessor must be `done` before successor starts.
- `start_to_start`: predecessor must be at least `in_progress` before successor starts.
- `lag_days` is applied after the predecessor condition is met.

### Future AI Usage

- Infer likely dependencies when generating tasks from phase templates.
- Warn when manual scheduling violates dependency order.
- Suggest parallelization opportunities where dependencies allow.
- Recalculate downstream schedules automatically when a predecessor slips.

---

## WorkSession

### Purpose

Represents **actual time spent** on a task. Work sessions ground planning in reality — comparing estimated hours to logged effort improves future estimates and capacity planning.

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | uuid | yes | Primary key |
| `task_id` | uuid | yes | FK → `Task` |
| `designer_id` | uuid | yes | Who performed the work |
| `started_at` | timestamptz | yes | Session start |
| `ended_at` | timestamptz | no | Session end; null if in progress |
| `duration_minutes` | number | no | Computed on close: `ended_at − started_at` |
| `notes` | string | no | What was accomplished |
| `created_at` | timestamptz | yes | |
| `updated_at` | timestamptz | yes | |
| `deleted_at` | timestamptz | no | Soft delete |

### Relationships

- **Many → one** `Task`
- **Aggregated into** `PlanningDay` (sessions started on that date)
- **Contributes to** designer-level `Capacity` utilization analysis

### Business Rules

- A designer may have at most one open work session (`ended_at = null`) at a time.
- Closing a session recalculates `duration_minutes`.
- Total logged minutes on a task should not exceed `estimated_hours × 60` without a variance flag (warning, not hard block).
- Work sessions do not automatically change task status; completing a session may suggest `done` but requires explicit confirmation.
- Sessions inherit project, room, and phase context from the parent task — never stored redundantly.

### Future AI Usage

- Compare estimated vs. actual hours to improve future task and template estimates.
- Detect tasks consistently underestimated by phase and task kind.
- Summarize session notes into task progress updates and client status reports.
- Recommend when to split oversized tasks based on session patterns.

---

## Capacity

### Purpose

Represents **how much design time the studio or a designer can commit** — the hard constraint the planner optimizes against. Capacity prevents overcommitment and makes load visible on the Planning Dashboard.

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | uuid | yes | Primary key |
| `scope` | enum | yes | `studio`, `designer` |
| `designer_id` | uuid | no | Required when `scope = designer` |
| `weekly_hours` | number | yes | Default weekly budget (e.g. 45) |
| `daily_hours` | number | no | Optional per-day override; derived from weekly if null |
| `effective_from` | date | yes | When this profile starts |
| `effective_to` | date | no | When this profile ends; null = open-ended |
| `created_at` | timestamptz | yes | |
| `updated_at` | timestamptz | yes | |
| `deleted_at` | timestamptz | no | Soft delete |

### Computed Values (not persisted)

| Value | Formula / source |
|---|---|
| `planned_hours` | Sum of `Task.estimated_hours` where `scheduled_date` falls in period |
| `logged_hours` | Sum of `WorkSession.duration_minutes / 60` in period |
| `available_hours` | `weekly_hours − planned_hours` |
| `load_percent` | `planned_hours / weekly_hours × 100` |

### Relationships

- **Constrains** `PlanningDay` load calculations
- **Scoped to** a designer or the whole studio

### Business Rules

- At most one active capacity profile per scope/designer for any given date.
- Over-capacity days (`planned_hours > capacity_hours`) surface as warnings on `PlanningDay`, never silent overflow.
- `daily_hours` defaults to `weekly_hours / 5` for studio planning when not explicitly set.
- Capacity profiles do not retroactively alter past planning records.

### Future AI Usage

- Recommend weekly capacity adjustments based on sustained over/under-utilization.
- Balance task assignments across designers to equalize load_percent.
- Forecast capacity exhaustion from upcoming phase deadlines and procurement windows.
- Flag unrealistic schedules before they are committed to the plan.

---

## PlanningDay

### Purpose

Read model and **primary aggregate for the Planning Dashboard** — what a designer opens each morning. `PlanningDay` is not a persisted table; it is composed by the Planning Service for a given date and optional designer scope.

Answers: *What am I doing today? What is due? Am I over capacity? What is blocked?*

### Fields

| Field | Type | Description |
|---|---|---|
| `date` | date | The calendar day (natural key) |
| `designer_id` | uuid \| null | `null` = studio-wide view |
| `capacity_hours` | number | From `Capacity` for this day |
| `planned_hours` | number | Sum of scheduled task estimated hours |
| `logged_hours` | number | Sum of work session hours on this day |
| `available_hours` | number | `capacity_hours − planned_hours` |
| `load_percent` | number | Utilization percentage |
| `tasks` | Task[] | Tasks where `scheduled_date = date` |
| `work_sessions` | WorkSession[] | Sessions started on this date |
| `phase_deadlines` | Phase[] | Phases with `target_end_date = date` |
| `meetings` | Meeting[] | Meetings scheduled on this date |
| `blocked_tasks` | Task[] | Tasks with `status = blocked` needing attention |
| `blocked_phases` | Phase[] | Phases with `status = blocked` needing attention |
| `at_risk_projects` | Project[] | Projects with overdue phase or task signals |

### Relationships

- **Composed from** `Task`, `WorkSession`, `Phase`, `Meeting`, `Project`, `Room`, `Client`, `Capacity`
- **Not persisted** — computed on demand

### Business Rules

- The dashboard never lists projects as primary rows; it lists **today's work**, **today's deadlines**, **meetings**, and **capacity pressure**.
- Every surfaced task must display full context: client name → project name → room → phase.
- Over-capacity and blocked items appear above the fold — they are first-class signals, not secondary metadata.
- Studio-wide view aggregates all designers; designer view filters by `assignee_id` and designer capacity.
- Navigating to a different date produces a new `PlanningDay` snapshot; historical days retain logged sessions.

### Future AI Usage

- Generate a daily briefing: priorities, blockers, meetings, and capacity status in natural language.
- Suggest task reordering within the day to maximize flow and respect dependencies.
- Proactively reschedule tasks when meetings or blockers reduce available hours.
- Highlight the highest-impact work when the day is over-capacity and suggest deferrals.

---

## Meeting

### Purpose

Represents a **scheduled design interaction** — client presentation, site visit, contractor walkthrough, or internal review. Meetings consume calendar time and often gate task progress. They belong on the Planning Dashboard alongside tasks.

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | uuid | yes | Primary key |
| `project_id` | uuid | yes | FK → `Project` |
| `room_id` | uuid | no | FK → `Room` (when room-specific) |
| `phase_id` | uuid | no | FK → `Phase` (when phase-specific) |
| `title` | string | yes | e.g. "Concept presentation — Kitchen" |
| `meeting_kind` | enum | yes | See MeetingKind below |
| `scheduled_start_at` | timestamptz | yes | Start time |
| `scheduled_end_at` | timestamptz | yes | End time |
| `location` | string | no | Address, video link, or studio |
| `attendees` | string | no | Client, contractors, internal team |
| `agenda` | string | no | Topics to cover |
| `outcome_notes` | string | no | Decisions and follow-ups (post-meeting) |
| `status` | enum | yes | `scheduled`, `completed`, `cancelled` |
| `created_at` | timestamptz | yes | |
| `updated_at` | timestamptz | yes | |
| `deleted_at` | timestamptz | no | Soft delete |

### MeetingKind

| Value | Meaning |
|---|---|
| `client_presentation` | Moodboard, concept, or design review with client |
| `site_visit` | On-site measurement, inspection, or installation check |
| `vendor_meeting` | Showroom, supplier, or procurement discussion |
| `contractor_coordination` | Build team alignment or snagging walk |
| `internal_review` | Studio critique or senior sign-off |

### Relationships

- **Many → one** `Project`
- **Many → one** `Room` (optional)
- **Many → one** `Phase` (optional)
- **Surfaces on** `PlanningDay` for the meeting date
- **May link to** `Task` where `task_kind` matches (logical, not FK in v1)

### Business Rules

- `scheduled_end_at` must be after `scheduled_start_at`.
- Meeting duration counts against daily capacity on `PlanningDay` (meetings consume hours like tasks).
- `outcome_notes` should be captured when `status = completed`; open follow-ups spawn new tasks.
- Cancelling a meeting does not auto-cancel linked tasks; designer must reschedule explicitly.
- Client-facing meetings (`client_presentation`, `site_visit`) should respect `Client.preferred_channel` and `decision_style` when scheduling.

### Future AI Usage

- Draft meeting agendas from active phase tasks and open selections.
- Generate pre-meeting briefs with client preferences, room scope, and pending decisions.
- Transcribe outcome notes into follow-up tasks with suggested estimates and dependencies.
- Recommend optimal meeting slots based on capacity, travel time to `site_address`, and client availability patterns.

---

## Cross-Entity Workflow Rules

1. **Planning-first.** `Task.scheduled_date` and `Meeting.scheduled_start_at` drive the dashboard. Projects provide context, not the schedule grid.
2. **Room-scoped progress.** Design advances per `Room` through ordered `Phase`s independently within a project.
3. **Phase gates work.** Tasks belong to a `Phase`; phase completion requires satisfied tasks and dependencies.
4. **Dependencies enforce order.** `TaskDependency` prevents invalid scheduling within a project.
5. **Capacity-aware planning.** No day is fully planned without comparing scheduled hours (tasks + meetings) to `Capacity`.
6. **Actuals improve estimates.** `WorkSession` data feeds back into template and AI estimate quality.
7. **Blocked work is visible.** Blocked phases and tasks surface on `PlanningDay` as urgent signals.
8. **Client context travels with work.** Every dashboard item resolves to `Client.display_name` through relational joins, never denormalized strings.
9. **Templates accelerate, not constrain.** `RoomTemplate` seeds structure; designers may always customize rooms, phases, and tasks.
10. **Projects are secondary.** The Planning Dashboard is the product center; project management supports it.

---

## Glossary

| Term | Definition |
|---|---|
| **Planning Dashboard** | Primary UI; renders a `PlanningDay` |
| **Engagement** | Synonym for an active `Project` with a `Client` |
| **Soft delete** | Record hidden via `deleted_at`; excluded from planning queries |
| **Load percent** | Ratio of planned hours to capacity hours |
| **At risk** | Project with overdue tasks, blocked phases, or handover date conflict |
| **Seed task** | Default task created from a `RoomTemplate`; editable after creation |
