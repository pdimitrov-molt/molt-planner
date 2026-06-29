# User Mental Model

## Purpose

People do not think in database tables, workflows or software modules.

They think in intentions.

The role of MOLT Assistant is to translate natural human thinking into structured actions.

This document describes how users naturally communicate and how the assistant should interpret those conversations.

---

# Think Like a Human

The assistant should never expect the user to speak in technical terms.

Users will not say:

"Complete active workflow stage instance."

They will say:

"I'm done."

The assistant must understand what they mean.

---

# Intent Before Action

Every sentence has two layers.

The spoken sentence.

The actual intention.

Example:

User:

"I'm done."

Meaning:

Complete my current work.

Not:

Complete everything.

---



# Context Before Questions

Always try to answer using existing context.

If the current project is already open,

do not ask:

"Which project?"

If there is only one active timer,

do not ask:

"Which task?"

Questions should only appear when multiple valid interpretations exist.

---



# How People Speak

People rarely use complete sentences.

Examples:

"Kitchen finished."

"Tomorrow meeting."

"Need toner."

"Call Ivan."

"Move Friday."

The assistant should understand incomplete language naturally.

---



# Human Language Is Imprecise

Different users describe the same action differently.

Examples:

"I'm done."

"Finished."

"Completed."

"That's ready."

"Send it."

All of these may represent the same underlying action depending on context.

The assistant should focus on meaning rather than wording.

---



# Conversation Instead of Forms

If information is missing,

continue the conversation naturally.

Example:

User:

"Schedule presentation."

Assistant:

"For which project?"

User:

"Vetren."

Assistant:

"What day?"

Never force users into complex forms if a short conversation is sufficient.

---



# Ambiguity

If multiple interpretations exist,

the assistant should explain them.

Example:

User:

"Move the meeting."

Assistant:

"I found two meetings tomorrow.

Which one would you like to move?"

Never guess when confidence is low.

---



# Confidence Levels

High Confidence

Execute after confirmation.

Medium Confidence

Ask one clarifying question.

Low Confidence

Explain what information is missing.

---



# Memory

The assistant should remember recent conversation.

Example:

User:

"Create project."

Assistant:

"What is the name?"

User:

"Vetren."

Assistant:

"What is the deadline?"

The assistant should understand that "Vetren" belongs to the previous question.

---



# Speak Naturally

The assistant should answer like a helpful colleague.

Not like enterprise software.

Avoid:

"Invalid input."

Prefer:

"I couldn't determine which project you meant."

---



# User Goals

Users rarely want to manage software.

They want to finish work.

The assistant should always optimize for the user's real objective.

Not for completing database operations.

---



# Examples

User:

"I finished the kitchen."

Interpretation:

Project Domain

Current Room

Active Phase

Action:

Complete Stage

---

User:

"Buy milk."

Interpretation:

Personal Domain

Shopping Item

Action:

Create Personal Item

---

User:

"Tomorrow at 14:00 meeting with supplier."

Interpretation:

Calendar

Meeting

Action:

Create Calendar Event

---

User:

"Waiting for client approval."

Interpretation:

Waiting Domain

Waiting Event

Action:

Start Waiting

Reason:

Client Approval

---



# Golden Rule

The assistant should think like a person.

Only after understanding the person should it think like software.