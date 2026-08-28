---
name: task-ticket
description: Use when a piece of work in this repo needs writing up as a task ticket before implementation — a new page, component or feature request — or when a task's scope, out-of-scope and dependencies need pinning down for the backlog or as the input to /route-ticket and /feature-build-factory.
---

# Task ticket

Generate a task ticket markdown file, in simple words, from this skill's template.

## When to use

- Work has been requested and needs a written ticket before implementation starts.
- A request bundles several pieces of work and needs splitting to one task per ticket.
- A request needs sharpening before it goes into `/route-ticket` →
  `/feature-build-factory`.

Do not start implementing the task. The generated file is the deliverable.

## Where this sits

This ticket is **intake**, upstream of the OpenSpec pipeline. It is what a human
writes down before the machinery starts, and it feeds `/route-ticket` and
`requirements-analyst`.

It is **not** an OpenSpec artifact and never replaces one. `/feature-build-factory`
does not call this skill — inside that pipeline the task ticket *is* the change
created by `/opsx:propose`, and its delta spec is the contract. Do not produce a
ticket file mid-pipeline; it would be the parallel ticket format the factory
commands forbid. In particular, **In-Scope is not a delta spec** — it is a list of
outcomes for a human to agree to, not requirements with scenarios.

## Steps

1. Read the template at `.claude/skills/task-ticket/template.md`.
2. Check what already exists before gathering anything: read
   `openspec/SPECS-CATALOG.md` and any relevant `openspec/specs/<domain>/spec.md`.
   Specs are this repo's source of truth, and half of what looks like new work turns
   out to be a delta on a domain that already has a spec. Say which domain the task
   lands in.
3. Gather the task details from the user (ask if anything is missing):
   - Which page/feature/component the task touches and where it lives — path under
     `src/pages/` or `src/components/`, plus the route (`ROUTES` constant in
     `src/routes/routes.ts`) and the URL under `yarn dev`. For a brand-new page, say
     that the route constant, the lazy `<Route>` in `src/routes/AppRoutes.tsx` and
     the nav item in `src/components/Sidebar/navigationData.ts` are all part of it.
   - What has to be delivered (the outcome, not the implementation).
   - Why it is being done now (the pain point or gap it closes).
   - The reference source of "correct": the domain spec, a design/Figma link, or an
     existing screen to match. If there is none, say so.
   - Every state the work has to cover — loading, empty, error, and the happy path.
     If the request does not mention `empty` or `error`, ask rather than inventing
     one; this repo re-learns that gap constantly.
   - Whether new user-facing strings are needed, and whether they need a new i18n
     namespace registered in the root `i18n.ts`.
   - Whether it needs a new dependency (`yarn add`) — flag it, because
     `security-reviewer` is a blocking gate downstream.
   - What is deliberately NOT part of the task.
   - Anything that must land first (an API, another ticket, a decision).
   - GitHub issue number if one already exists (e.g. `#42`).
4. Scope the ticket to **exactly one task**:
   - Describe only the work this task delivers.
   - Do NOT bundle unrelated work, follow-up improvements, or bugs found along the
     way. Those get their own ticket — a bug uses the `bug-ticket` skill.
5. Fill in every section of the template from the gathered details:
   - **Title**: `[<Page or component>] <concise description>`, prefixed with the
     issue number if there is one — e.g.
     `#57 [Products] Add CSV export to the product stock table`.
   - **Environment**: the `feature/<kebab-name>` branch to cut, `yarn dev` URL, route
     constant, and the theme/locale coverage the task owes.
   - **Goal**: the outcome in one or two sentences.
   - **Background**: why now, linking related specs, catalogue entries or archived
     changes. Delete the section if the goal is self-explanatory.
   - **Problem Statement**: the current situation only — no proposed solution.
   - **In-Scope**: numbered outcomes, one per line. Name actual pages, components,
     fields, hooks and services. Include every state from step 3.
   - **Out-of-Scope**: what the task does not cover, and where each item is handled
     instead.
   - **Impact**: affected pages/features/shared components, and an explicit list of
     what is NOT affected. Anything shared widens this — call out `src/index.css`
     tokens, `_variables.scss` / `_mixins.scss`, shared components (`TableCommon`,
     `ConfirmModal`, `StatusBadge`), `src/hooks/`, `src/contexts/`, `src/utils/`,
     `src/services/`, `src/configs/`, or the route table.
   - **Dependencies & Reference Materials**: blockers first, then links. Use
     placeholders for URLs and IDs the user must fill. List any new package here so
     the `security-reviewer` gate is visible from the ticket.
   - **Definition of Done**: keep the standard checks, add task-specific ones
     underneath.
   - **Note**: anything a reviewer should know — shared component, open question,
     assumption made.
6. Write the result to `task-ticket-<slug>.md` in the project root, where `<slug>` is
   a short kebab-case summary of the task. The slug is a good candidate for the
   `feature/<kebab-name>` branch and the OpenSpec change name later.
7. Report the file path when done.

## Rules

- Follow `.claude/rules/writing-style.md` — including its **Section content** rules
  on keeping each section short but complete.
- Follow `.claude/rules/accuracy.md` — placeholders for anything the user must
  supply, and state what is **not** affected as explicitly as what is.
- Follow the **Git safety** section of `.claude/rules/hard-gates.md` — this skill
  writes one file and touches nothing else. No branch, no commit.
- One task per ticket — never bundle multiple unrelated pieces of work into a single
  ticket.
