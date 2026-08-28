---
name: pr
description: Use when a committed branch in this repo needs a pull request description written against .github/pull_request_template.md. Generates a pr-<branch-suffix>.md file only — it never pushes or opens the PR.
---

# PR description

Generate a pull request description, in simple words, for the current branch using
this project's template.

## When to use

- A branch is committed and needs its PR description written.
- Invoked as the final step by `/bug-fix-factory` and `/feature-build-factory`
  (step 14, after `/opsx:archive`).

Do **not** use it to push a branch or open a PR — the generated `.md` file is the
whole deliverable, and any git operation needs the user's go-ahead first. See the
**Git safety** section of `.claude/rules/hard-gates.md`.

The ticket skills sit on the other end of the workflow: `bug-ticket` and
`task-ticket` write intake before the pipeline runs, this one writes the write-up
after it finishes.

## Steps

1. Read both templates:
   - `.github/pull_request_template.md` — GitHub renders this one, so it is the
     **source of truth for the section list**.
   - `.claude/skills/pr/template.md` — the authoring scaffold. Same sections, plus
     the per-section fill-in hints for this repo. Work from this copy.

   If the two disagree, follow `.github/pull_request_template.md` and say so in your
   final report so the scaffold gets re-synced.

2. Run `git branch --show-current` and `git log master...HEAD --oneline` to identify
   the branch's commits. The base branch is **`master`** (this repo has no `develop`).
3. Run `git diff master...HEAD --stat` for the changed-file list, then
   `git diff master...HEAD` for the actual diff. Read the whole branch diff, not just
   the latest commit — a factory run usually lands several commits.
4. Read the OpenSpec change behind the branch, if there is one. The branch suffix
   matches the change name, so look in `openspec/changes/<change-name>/` or, once
   archived, `openspec/changes/archive/<date>-<change-name>/`. Its `proposal.md`
   gives you the _why_; the delta `specs/` give you the behavior to describe under
   **How to Test?**.
5. Fill in every section of the scaffold from the diff and the change artifacts.
   Each section's HTML comment carries the detail; the summary below is what matters
   most in each:
   - **What Changed?**: 1–2 sentence summary, then one bullet per changed file or
     behavior — what changed and why, not just which file.
   - **Screenshots/Videos**: leave this for the user — a placeholder line per visual
     surface the diff touches, inside the template's HTML comment
     (`.claude/rules/accuracy.md`). Never describe a screenshot you have not seen.
     For any UI change name the three themes explicitly (light / dark / forest),
     since this repo requires all three to be verified.
   - **Impact Area Identification**: list features/modules indirectly affected, one
     line each, and say explicitly what is _not_ affected. Anything shared has a
     wide blast radius here — flag it and enumerate the consumers when the diff
     touches `src/index.css` tokens, `src/assets/styles/_variables.scss` or
     `_mixins.scss`, `src/components/` shared UI (e.g. `TableCommon`, `ConfirmModal`,
     `StatusBadge`), `src/hooks/`, `src/contexts/`, `src/utils/`, `src/services/`,
     `src/configs/`, or the route table.
   - **Type of Impact**: check the correct boxes. Shared tokens, mixins and shared
     components all count as 📦 Shared code; `src/configs/` and `app-config.ts` count
     as 🗄️ Config.
   - **Type of Change**: check the correct boxes. A `bugfix/*` branch is 🐛, a
     `feature/*` branch is ✨, locale files under `public/locales/` add 🌍.
   - **Related Documentation**: link the OpenSpec change directory from step 4 and,
     if the change was archived, its `openspec/SPECS-CATALOG.md` entry. Leave a
     placeholder for anything only the user can supply
     (`.claude/rules/accuracy.md`).
   - **How to Test?**: numbered steps, one action per step, with the expected result.
     Start from `yarn dev`. Cover the happy path and the edge cases the diff touches.
     Add a theme-switch step for any visual change and an en/jp switch step for any
     copy change.
   - **Checklist**: check only boxes the branch actually earns. Tick 🧪 and ✅ only
     if `yarn test` was run and passed; tick ⚠️ only if `yarn lint` and `yarn build`
     came back clean. Report, don't assume (`.claude/rules/verify.md`).
6. When the branch came out of a factory run, add the `MEDIUM`/`LOW` review findings
   that were accepted rather than fixed as a short **Known items** list at the end of
   **What Changed?**.
7. Write the result to `pr-<branch-suffix>.md` in the project root — the suffix is
   the branch name after the `bugfix/` or `feature/` prefix (e.g. branch
   `bugfix/unify-loading-accent-color` → `pr-unify-loading-accent-color.md`).
   Strip every scaffold comment on the way out, **except** the Screenshots/Videos and
   Related Documentation placeholders the user has to fill in themselves. Drop the
   **Known items** heading unless there are findings to list.
8. Report the file path when done.

## Rules

- Follow `.claude/rules/writing-style.md` — including its **Section content** rules
  on keeping each section short but complete.
- Follow `.claude/rules/accuracy.md` — every claim traces to the diff or to a command
  you actually ran. Never tick a checklist box, claim a test passed, or describe
  behavior you have not seen in the code. Screenshot/video and documentation
  sections stay as placeholders for the user to fill in.
- Follow `.claude/rules/verify.md` before ticking anything in **Checklist**.
- `.claude/rules/hard-gates.md` applies in full — in particular its **Git safety**
  section: the file is the deliverable, and nothing gets committed, pushed or opened.
