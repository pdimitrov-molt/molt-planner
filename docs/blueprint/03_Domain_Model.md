# Domain Model

## Purpose

This document defines the core objects of MOLT OS.

Every feature, screen, workflow and AI capability is built around these objects.

The assistant should reason using these concepts rather than individual database tables.

---

# Core Philosophy

The database stores data.

The Domain Model stores meaning.

AI should never think in SQL.

AI thinks in real-world objects.

---

# Primary Domains

## Person

The center of the system.

Everything ultimately exists to help one person make better decisions.

A person has:

- work
- personal life
- calendar
- energy
- commitments
- goals
- habits
- knowledge

Everything revolves around the Person.

---



## Project

A project represents a commitment to deliver an outcome.

Examples:

- Interior Design
- House Renovation
- Office Design
- Hotel Renovation

A project owns:

- rooms
- phases
- documents
- deadlines
- waiting periods
- milestones
- work sessions

---



## Room

A project is divided into rooms or logical work areas.

Examples:

Kitchen

Bathroom

Bedroom

Reception

Restaurant Hall

Garden

Garage

---



## Phase

A room progresses through phases.

Examples:

Research

Concept

3D Visualization

Technical Drawings

Electrical

Lighting

Furniture

Execution

Completed

---



## Work Session

A work session is a period of focused work.

It answers:

"What did I actually work on?"

Work Sessions are the foundation of analytics.

---



## Waiting Event

Sometimes work cannot continue.

Examples:

Client Approval

Measurements

Payment

Supplier

Furniture Production

Delivery

Waiting Events pause progress.

They are not delays caused by the designer.

---



## Personal Item

Not everything belongs to a project.

Examples:

Buy toner

Pick up package

Call accountant

Renew passport

Take son to kindergarten

These items belong to the person.

---



## Calendar Event

Represents something that happens at a specific time.

Examples:

Meeting

Presentation

Doctor

School Event

Birthday

Travel

---



## Knowledge

Knowledge is information that should survive projects.

Examples:

Supplier contacts

Building regulations

Favorite materials

Lessons learned

Checklists

Templates

Knowledge becomes smarter over time.

---



# Relationships

Person

├── Projects

│ ├── Rooms

│ │ ├── Phases

│ │ │ ├── Work Sessions

│ │ │ └── Waiting Events

│ │ └── Documents

│ └── Milestones

│

├── Calendar

├── Personal Items

├── Knowledge

└── AI Assistant

---



# Important Rule

Everything should belong to exactly one domain.

Projects should never store personal reminders.

Personal Items should never store project work.

Knowledge should never store deadlines.

Each domain has one responsibility.

---



# AI Mental Model

When a user speaks, the assistant should first determine:

Which domain does this belong to?

Example:

"Finish Kitchen."

→ Project

---

"Buy milk."

→ Personal Item

---

"Move tomorrow's meeting."

→ Calendar

---

"Remember this supplier."

→ Knowledge

Only after identifying the domain should the assistant decide what action to perform.

---



# Future Domains

Possible future additions:

Finance

CRM

Inventory

Travel

Health

Family

Assets

Automation

These should integrate without changing the existing model.