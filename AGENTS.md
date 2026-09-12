# AGENTS.md — Exam Prep Platform

This file governs how downstream implementation agents operate on this workspace.
It defines role boundaries, the task-fetch protocol, and the execution loop.
**Do not modify this file except to record protocol changes agreed with the human operator.**

---

## 0. System Overview

This is a **decoupled, data-driven learning platform**:

- **Supabase** (`exam-prep-platform`, project ref `xhofqrfthpihgvlbcbpl`) is the single
  source of truth for all content (`modules`, `lessons`, `lesson_blocks`), vectorized
  source material (`knowledge_base`), and user state (`user_progress`).
- **Next.js + Shadcn/ui** is a purely presentational rendering shell. It contains
  **zero hardcoded course material**. It reads `lesson_blocks.type` +
  `lesson_blocks.content_json` and dispatches to a generic renderer component.
- **Notion** (`Exam Prep Platform — Task Pipeline` database) is the coordination
  layer: a deterministic, sequentially numbered task backlog (`TASK-001` … `TASK-026`,
  extensible) that agents pull work from.

Base content domain for this instance: the Romanian teaching-qualification exam
curriculum (Legea 198/2023, ROFUIP/OME 5726/2024, OME 4137/2026, OME 3934/2026,
Bush, Hattie) — 4 modules (`Săptămâna 1–4`), 20 lessons (`Ziua 1–20`). This content
is seeded as **structure only** (titles, slugs, source references, schedule). Actual
teaching content, flashcards, quizzes, and citations are populated by the Content
Ingestion Agent into `knowledge_base` and `lesson_blocks` — never hardcoded in the UI.

---

## 1. Role Split

### Content Ingestion Agent (Track A)
- Owns: `knowledge_base`, `lesson_blocks`, `modules`/`lessons` content fields.
- Responsibilities: crawl/collect source material, chunk it, generate embeddings,
  write structured rows to Supabase.
- **Must NOT** write frontend code, touch the Next.js repo, or invent UI behavior.
- Tools: `supabase`, `notion` (for task status), optionally `github` only for
  standalone ingestion worker scripts (never inside the Next.js app directory).

### UI Application Agent (Track B)
- Owns: the Next.js app — routing, components, Supabase client wiring, auth,
  progress-sync client actions.
- Responsibilities: build generic, reusable rendering components driven entirely
  by `lesson_blocks.type` + `content_json` and by live Supabase queries.
- **Must NOT** write content or mock/sample lesson data into components, fixtures,
  or seed files. If a component "needs" example content to look right in dev,
  it must fetch a real row from Supabase (even a placeholder one), not hardcode text.
- Tools: `github`, `notion` (for task status), `supabase`, `vercel`, `nextjs`, `shadcn`,
  `open-design`.

---

## 2. Task Fetch Protocol

1. Query the Notion task database (`Exam Prep Platform — Task Pipeline`) for the
   **lowest-numbered `TASK-XXX`** with `Status = Backlog` whose
   `Prerequisite Task ID` (comma-separated list, may be empty) are **all** `Status = Done`.
2. If multiple tasks tie on eligibility, prefer the one with the lower `Order` value.
3. Update that task's `Status` to `In Progress` before starting any work.
4. If no eligible task exists (all remaining tasks are blocked or done), stop and
   report status — do not invent new work outside the numbering scheme without
   human sign-off (see §5).

---

## 3. Execution Loop & Verification

For every task:

- **Step 1 — Execute:** Write code / SQL migrations / content strictly according to
  the task's `Definition of Done`. Nothing more, nothing less than what's scoped.
- **Step 2 — Data-Contract Check:** Confirm UI components depend only on Supabase
  tables/JSON schemas (via props or query results), never on hardcoded literals.
  Confirm ingestion outputs land only in `knowledge_base` / `lesson_blocks`, never
  in frontend files.
- **Step 3 — QA:** Verify against **live** Supabase data (`execute_sql` / `list_tables`
  / advisors for Track A; a real dev-server render or Vercel preview for Track B).
  Re-run `get_advisors` (security + performance) after any schema change.
- **Step 4 — Commit & Hand-off:** Set the task's `Status` to `QA / Verification` if
  independent review is warranted, otherwise directly to `Done`. Record output notes
  as a comment on the Notion task page (what changed, any deviations, links to
  commits/migrations). Then return to §2 and fetch the next task.

If a step fails, leave `Status = In Progress`, log the blocker as a page comment,
and stop rather than marking the task `Done` prematurely.

---

## 4. Guardrails

- **Never** hardcode lesson/quiz/course content in `.tsx`/`.ts` files, fixtures, or
  seed scripts inside the Next.js app. All such content lives in Supabase.
- **Never** grant public/anon read access to `knowledge_base` — it is an internal
  RAG store, service-role only.
- **Never** bypass the numbering/prerequisite system — if new work is discovered
  mid-task, add it as a new `TASK-XXX` row (next available number) with correct
  `Prerequisite Task ID`s rather than silently expanding scope.
- Any schema change (`apply_migration` / `update_data_source`) must be followed by
  `get_advisors` (security) before the task is marked `Done`.
- Embeddings model/dimension must stay consistent across all ingestion runs
  (`knowledge_base.embedding` is fixed at 1536 dims — matches `text-embedding-3-small`;
  if a different embedding model is used, a migration task must be filed to resize
  the column and re-embed, not a silent dimension mismatch).

---

## 5. Human Sign-off Required For

- Creating/pausing/deleting Supabase projects or branches.
- Any purchase or billing action (Vercel add-ons, domain registration, plan upgrades).
- Deleting or truncating any table with existing rows.
- Changing RLS policies in a way that widens public access.
- Renumbering or removing existing `TASK-XXX` rows (append-only backlog).

---

## 6. Reference

- Supabase project: `exam-prep-platform` (`xhofqrfthpihgvlbcbpl`, `eu-central-1`)
- Notion task database: `Exam Prep Platform — Task Pipeline`
- Tables: `modules`, `lessons`, `lesson_blocks`, `knowledge_base`, `user_progress`
- Block types: `text`, `markdown`, `flashcard_set`, `quiz_mcq`, `quiz_open`,
  `code_exercise`, `reference_list`, `callout`, `video`, `image`
- Lesson types: `interactive`, `markdown`, `quiz`, `code`