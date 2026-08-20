---
description: Review the current branch diff from six independent angles in parallel, then aggregate deduplicated findings ranked by severity.
argument-hint: "[base-ref] — defaults to master"
---

Parallel review for frontend changes in dashstack-dashboard.

Six reviewers run at the same time, each with exactly one job, then an aggregator merges their output. Each reviewer's prompt stays short and focused instead of one prompt juggling accessibility, performance, correctness, convention, coverage and client security at once. Angles can be tuned independently, and a new angle is added as a new branch — never by widening an existing one.

**Where this sits in the OpenSpec pipeline:** this runs at the `code-reviewer` stage, after `opsx:apply` and before `opsx:verify`. It **complements** `code-reviewer`, it does not replace it — `CLAUDE.md` never skips that agent. `code-reviewer` reads the diff holistically; this command fans the same diff out across six independent lenses. Run both. `opsx:verify` then checks something neither does: conformance to the delta spec.

## Step 1 — Build the shared input once

Every reviewer must read the **same bytes**. Build the input once, then hand all reviewers the same path.

1. Resolve the base ref: `$ARGUMENTS` if given, otherwise `master`.
2. Write the diff to a scratch file:
   - `git diff <base>...HEAD` → full diff
   - `git diff <base>...HEAD --stat` → file summary
3. Note the shared context paths every reviewer will be told to read:
   - `CLAUDE.md`
   - `eslint.config.js`, `src/index.css` and `src/assets/styles/_variables.scss` (the design-token sources)
   - **The active change's delta specs** — `openspec/changes/<change-name>/specs/` plus its `design.md` and `tasks.md`. This is what the diff is supposed to implement; a reviewer without it can only judge the code in a vacuum. If no change is active, fall back to the relevant capability spec under `openspec/specs/`.

If the diff is empty, stop and report that there is nothing to review.

> Cost note: the diff file plus those context paths are the prefix repeated across all six reviewers. Keeping it byte-identical is what makes the repeated context cheap. In an API implementation this is where the cache breakpoint goes — after tools and system prompt, before the per-angle instruction.

## Step 2 — Dispatch all reviewers in ONE message

**Launch every reviewer in a single message with multiple Agent calls.** Sequential calls give up the entire benefit of this command.

Give each reviewer: the scratch diff path, the shared context paths, and its own single-angle instruction. Every reviewer is **read-only** — it reports, it does not edit.

| # | Angle | Model | Looks for |
| --- | --- | --- | --- |
| A | Accessibility | opus | Missing labels on interactive elements; non-semantic elements carrying click handlers; keyboard traps and lost focus; missing `alt`; contrast below AA; ARIA that contradicts the role. Note: this repo has **no** `eslint-plugin-jsx-a11y`, so nothing here is caught by lint — the reviewer is the only gate |
| B | Performance | sonnet | Unnecessary re-renders (unstable props, effect dependency churn); barrel imports pulling in the world; a new page missing its `lazy()` registration in `src/routes/AppRoutes.tsx`; unvirtualized long lists; layout thrash and CLS sources. React Compiler is enabled — flag **manual** `useMemo`/`useCallback` added without a stated reason, not their absence |
| C | Correctness | sonnet | Unhandled loading and error states; race conditions between requests; null/undefined on optional data; stale closures; missing list keys; off-by-one at boundaries; React Query `queryFn` returning `undefined` (v5 forbids it — see `src/hooks/useProduct.ts` for the sentinel-`null` workaround) |
| D | Convention | sonnet | Violations of the flat ESLint config (`js.configs.recommended` + `tseslint.configs.recommended` + `react-hooks` recommended-latest + `react-refresh`); `clsx` instead of the `cn()` helper in `src/utils/cn.ts`; `npm` instead of `yarn`; path aliases instead of relative imports; `interface` instead of `type` for props; missing explicit `React.JSX.Element` return type; hardcoded strings that belong in `react-i18next`; hardcoded colors and spacing outside `src/index.css` / `src/assets/styles/_variables.scss`; business logic sitting in a presentational component |
| E | Test coverage | sonnet | Missing React Testing Library + Vitest cases for changed behaviour; untested error and empty states; whether a bug fix has a regression test that fails without the fix; queries that assert implementation detail instead of user-visible behaviour |
| F | Client security | opus | `dangerouslySetInnerHTML` on unsanitized input; secrets or API keys reaching the client bundle (anything read from `import.meta.env` that is not a `VITE_`-prefixed public value); user input interpolated into URLs or `href`; token storage choice in `src/services/auth.ts`; overly broad CORS or CSP assumptions |

Each reviewer returns **only** a fenced ```json block:

```json
[
  {
    "file": "src/components/TableCommon/index.tsx",
    "line": 42,
    "severity": "HIGH",
    "issue": "The close handler moves focus to document.body, so keyboard users lose their place in the table.",
    "suggestion": "Return focus to the trigger button on close."
  }
]
```

Reviewer rules, repeated in each dispatch:

- Report only what you can tie to a **line present in the diff**. No speculation about untouched code.
- Severity is `HIGH`, `MEDIUM`, or `LOW`. `HIGH` means it should block the PR.
- One finding per object. Do not bundle two problems into one entry.
- Return `[]` if the angle is clean. An empty result is a valid, useful answer.
- Do not edit, create, or delete any file.

## Step 3 — Aggregate

1. **Deduplicate** on `file` + `line` + substance of `issue`. When two angles report the same thing, keep the more specific wording and record both angles.
2. **Drop unverifiable findings** — if a finding does not correspond to a real line in the diff, discard it and note the discard. Do not invent detail to make a finding land.
3. **Rank** `HIGH` → `MEDIUM` → `LOW`, and within a severity by file path.
4. **Emit** the merged list as `[{file, line, severity, angle, issue, suggestion}]`.

## Step 4 — Evaluator–optimizer loop

The reviewers are the evaluator; the code being reviewed is the producer.

- **No `HIGH` findings** → report the merged list and go to step 5.
- **Any `HIGH` finding** → present them to the user, apply the fixes in the main session, then **re-run only the affected angles** — not all six.
- **Cap the loop at 2 iterations.** After the second pass, stop. Report whatever remains and hand the decision to the user. Never loop unattended past the cap.

Only the main session edits files. Reviewer agents stay read-only across every iteration.

## Step 5 — Write the report

1. Write the merged findings, plus a one-line note per angle that came back clean, to `openspec/changes/<change-name>/review-<slug>.md` when a change is active, so the review travels with the change into the archive. Fall back to `review-<slug>.md` in the repo root only when there is no active change.
2. Report the file path, the count by severity, and anything an angle could not determine from the diff alone.
3. Findings that turn out to be **pre-existing** bugs rather than defects in this diff go into their own OpenSpec change — do not bundle them into the current one. Note them in the report and move on.

## Rules

- **Dispatch in one message.** Six Agent calls in one block; anything else is sequential and defeats the pattern.
- **One job per reviewer.** To add an angle (SEO, Core Web Vitals, backward compatibility), add a seventh branch — do not extend an existing prompt.
- **Reviewers never write.** All edits happen in the main session, after the user has seen the findings.
- **Loop cap is 2.** Then stop and hand off.
- **Empty is a result.** Do not pad a clean angle with speculative findings.
