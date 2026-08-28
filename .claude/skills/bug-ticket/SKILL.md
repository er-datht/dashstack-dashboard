---
name: bug-ticket
description: Use when a bug in this repo needs writing up as a ticket before anyone investigates it — for the backlog, a GitHub issue, or as the input to /route-ticket and /bug-fix-factory — or when a bug report bundles several issues and must be scoped down to exactly one.
---

# Bug ticket

Generate a bug ticket markdown file, in simple words, from this skill's template.

## When to use

- A bug has been observed and needs a written ticket before anyone fixes it.
- A bug report bundles several issues and needs splitting to one bug per ticket.
- A report needs sharpening before it goes into `/route-ticket` → `/bug-fix-factory`.

Do not start fixing the bug. The generated file is the deliverable.

## Where this sits

This ticket is **intake**, upstream of the OpenSpec pipeline. It is what a human
writes down before the machinery starts, and it feeds `/route-ticket` and
`requirements-analyst`.

It is **not** an OpenSpec artifact and never replaces one. `/bug-fix-factory` does
not call this skill — inside that pipeline the ticket _is_ the change created by
`/opsx:propose`. Do not produce a ticket file mid-pipeline; it would be the parallel
ticket format the factory commands forbid.

## Steps

1. Read the template at `.claude/skills/bug-ticket/template.md`.
2. Gather the bug details from the user (ask if anything is missing):
   - Which page/component and where it lives — path under `src/pages/` or
     `src/components/`, plus the route (`ROUTES` constant in `src/routes/routes.ts`)
     and the URL under `yarn dev`.
   - What is wrong (the observed behavior).
   - What is expected (the correct behavior).
   - The reference source of "correct": first look for a clause in
     `openspec/specs/<domain>/spec.md`, then the domain's entry in
     `openspec/SPECS-CATALOG.md`. If neither covers it, say so — "no spec, user
     report" is a valid answer and tells the reader the expected behavior is a
     judgement call.
   - Which of the three themes it happens in (light / dark / forest), and which
     locale (en / jp). Ask — "does it happen in the other themes?" is the single
     most common gap in this repo's bug reports.
   - GitHub issue number if one already exists (e.g. `#42`).
3. Scope the ticket to **exactly one bug**:
   - Describe only the bug as observed by the user or QA.
   - Do NOT include issues that are side effects of fixing this bug, or fixes and
     implementation details. Those belong to their own ticket.
   - If a pre-existing bug surfaces while writing this one up, write it a separate
     ticket rather than folding it in.
4. Fill in every section of the template from the gathered details:
   - **Title**: `[<Page or component>] <concise description>`, prefixed with the
     issue number if there is one — e.g.
     `#42 [Products] Loading ring keeps the light-theme accent in forest`.
   - **Environment**: branch, `yarn dev` URL, route constant, theme(s), locale(s),
     browser/viewport. Fill in what is known; leave a placeholder for the rest.
   - **Pre-condition**: any state needed to reproduce (e.g. two items already in the
     wishlist, `theme` set to `forest` in localStorage).
   - **Steps to Reproduce**: numbered steps, one action each, starting from
     `yarn dev`. Include the theme/locale switch as a step when it matters.
   - **Actual Result**: the current buggy behavior only. Name measured values —
     the resolved colour, the px offset, the failing key.
   - **Expected Result**: the correct behavior. Quote the spec clause when one
     exists.
   - **Reference**: the spec clause, catalogue entry, or an explicit "no spec".
   - **Impact**: what else shows the bug, and an explicit list of what does not.
     Anything shared widens this — call out `src/index.css` tokens,
     `_variables.scss` / `_mixins.scss`, shared components (`TableCommon`,
     `ConfirmModal`, `StatusBadge`), `src/hooks/`, `src/contexts/`, `src/utils/`,
     `src/services/`, `src/configs/`, or the route table.
   - **Screenshots / Video**: a placeholder per theme affected, for the user to fill.
   - **Note**: anything a reviewer should know — shared component, open question,
     assumption made.
5. Write the result to `ticket-bug-<slug>.md` in the project root, where `<slug>` is
   a short kebab-case summary of the bug. The slug is a good candidate for the
   `bugfix/<kebab-name>` branch and the OpenSpec change name later.
6. Report the file path when done.

## Rules

- Follow `.claude/rules/writing-style.md` — including its **Section content** rules
  on keeping each section short but complete.
- Follow `.claude/rules/accuracy.md` — placeholders for anything the user must
  supply, and state what is **not** affected as explicitly as what is.
- Follow the **Git safety** section of `.claude/rules/hard-gates.md` — this skill
  writes one file and touches nothing else. No branch, no commit.
- One bug per ticket — never bundle multiple unrelated issues into a single ticket.
