---
description: End-to-end bug-fix workflow on top of OpenSpec — route, root-cause, propose, gate, test, apply, constraint check, verify, parallel review, archive.
argument-hint: <bug report, ticket text, Sentry excerpt, or path to a report file>
---

End-to-end bug-fix workflow for dashstack-dashboard.

**OpenSpec owns the lifecycle. This command owns execution discipline.** `CLAUDE.md` mandates the OpenSpec pipeline for every change; this command does not replace it, it drives it and adds three things the pipeline does not have on its own:

| Added | Where it slots in | Why |
| --- | --- | --- |
| **Routing** | Step 0, before `requirements-analyst` | One prompt can't carry rules for eight kinds of defect. The router also picks the model for the work that follows. |
| **Detect/correct split** | Steps 8–9, after `opsx:apply`, before review | A single prompt carrying "fix the bug and don't use inline styles and don't forget the aria-label" reliably drops a constraint. Listing violations first, then fixing exactly those, is far more stable. |
| **Parallel review** | Step 11, alongside `code-reviewer` | One pass can't weigh a11y, performance, correctness, convention, coverage and client security at once. |

Everything else — the ticket, the design, the delta specs, the task list, the archive — **is** OpenSpec. Do not create a parallel ticket format.

## Hard gates

These are not suggestions. They come from `CLAUDE.md` and override anything below.

- **`security-reviewer` BLOCKS.** If the fix adds a dependency, fetches an external URL, or uses a web-sourced snippet, pause **all** other work until the verdict is ✅ allow. No `yarn add`, no `unit-test-writer`, no `opsx:apply` before then.
- **Never auto-chain `opsx:apply`.** Step 7 is a full stop. Present findings and wait for the user to trigger implementation.
- **Never commit on `master`.** Ask before any git operation.
- **Yarn only** — never `npm`.

## Steps

0. **Route the report** — run `/route-ticket` on the bug report.
   - Adopt the returned `category`, `area`, `focus`, `must_do` and `skip` for the rest of this run
   - `must_do` entries are gates — `PERFORMANCE` profiles before proposing a fix, `A11Y` names the WCAG criterion, `THEMING` verifies all three themes
   - If the category is `NEW_COMPONENT`, stop and hand off to `/feature-build-factory`
   - Do not re-classify later in the run

1. **Report the root cause** before changing anything. This is the bug-specific input `requirements-analyst` and `opsx:propose` consume — without it the proposal describes a symptom.

   ```
   <symptom>          What the user actually sees, and on which route/breakpoint/theme/locale
   <repro>            Exact steps, state, and data needed to trigger it
   <affected_layers>  page / component / hook / context / service / style / config
   <broken_code>      file:line and the specific logic at fault
   <why_broken>       Why this code produces the symptom
   <correct_behavior> What should happen instead
   <related>          Related bugs found while looking (do NOT fix them here)
   ```

   Stay inside the routed `focus`; skip what the router listed under `skip`. **Read `openspec/specs/` for the affected capability first** — the spec is the source of truth for correct behaviour, so `<correct_behavior>` should cite it rather than be invented. Check `openspec/changes/archive/` for prior decisions on the same surface.

2. **`requirements-analyst`** — never skipped, even for a one-line fix. It reads the existing specs first, then resolves ambiguity in the root-cause report. Present its questions to the user and **wait for answers** before step 3. For a trivial fix this may be a zero-question pass.

3. **`/opsx:propose`** — create the change: proposal, design, delta specs, tasks. This **is** the bug ticket; do not write a separate one.
   - Right-size it — a one-line fix gets a one-line proposal
   - The delta spec states the corrected behaviour as a requirement plus scenarios, not as a diff description
   - Anything under `<related>` becomes its own future change, not a task here

4. **`security-reviewer`** — run **only** if this fix adds a dependency, an external URL, or web-sourced code. ⛔ **BLOCKING** — if it runs, nothing else proceeds until the verdict is ✅ allow. Skip when the change adds no external code.

5. **`unit-test-writer`** — write the regression test from the delta spec **before** implementation. The test must fail without the fix. Skip only if the change produces no testable unit (pure styling, routing constants, config).

6. **⏸ WAIT for the user.** Present the proposal, the security verdict, and the tests. **Stop here.** Do not proceed to step 7 until the user explicitly triggers apply.

7. **`/opsx:apply` via `react-frontend-specialist`** — implement the tasks.
   - Target exactly the cause identified in step 1
   - Do not fix anything under `<related>`; do not clean up adjacent code, rename, or reformat untouched lines

8. **Find violations** — review your own diff against the checklist below and **list every violation. Change nothing in this step.**

   General:

   - No inline styles — **except** the documented tier-2 case: a dynamic value referencing a CSS custom property, e.g. `style={{ color: 'var(--color-primary-600)' }}`. Static styling goes through Tailwind utilities or an SCSS module
   - Every interactive element has an accessible name
   - Every image has meaningful `alt`, or `alt=""` if decorative
   - No user-facing string hardcoded — keys go through `react-i18next`'s `t()`, with the key added to **both** `public/locales/en/` and `public/locales/jp/`
   - No hardcoded color or spacing value outside `src/index.css` / `src/assets/styles/_variables.scss`
   - No `console.log` left behind
   - No `any` / `@ts-ignore` added
   - Every list render has a stable `key` — not the array index
   - No direct DOM manipulation where React owns the node
   - Loading and error states are handled for every new data fetch
   - No secret, API key, or internal URL added to client-side code
   - Only files related to this one change are touched

   Repo-specific:

   - Class names composed with the `cn()` helper from `src/utils/cn.ts` (`classnames`), never `clsx`
   - Imports are relative — this repo has no path aliases
   - Props typed with `type`, not `interface`; components carry an explicit `React.JSX.Element` return type
   - The change renders correctly in **all three** themes (light, dark, forest)
   - Any new page is lazy-loaded in `src/routes/AppRoutes.tsx`, with its constant in `src/routes/routes.ts`
   - No manual `useMemo` / `useCallback` added without a stated reason — React Compiler is enabled
   - Directory is `src/configs/` (plural); `i18n.ts` lives at the project root, not in `src/`

   OpenSpec:

   - Every task in `tasks.md` is actually done, or explicitly deferred with a reason
   - The diff does nothing the delta spec does not cover — scope creep shows up here

   Output the violations as a plain numbered list, each with `file:line` and what rule it breaks. If there are none, say so explicitly and continue.

9. **Rewrite** — fix exactly the violations listed in step 8, and nothing else.
   - Do not re-open the root-cause fix in this step
   - Do not introduce new behaviour while clearing violations

10. **Verify**:
    - Lint: `yarn lint`
    - Type check: `yarn tsc -b`
    - Tests: `yarn test`
    - Build, if the change touches config or imports: `yarn build`
    - E2E: `yarn test:e2e` — Playwright, currently covering the modal show/hide animation. Run it if the fix touches those modals; **add a regression case** if this is a bug jsdom cannot catch — real animation timing, `prefers-reduced-motion`, theme parity, or computed layout (Vitest swaps CSS Modules for a non-scoped proxy, so no unit test can read a computed style). New specs go in `e2e/`, which is excluded from vitest. **Never run `playwright install`** — it drives the system Chrome via `channel: "chrome"`, a security-review condition
    - Check the fix in the running app (`yarn dev`) for `UI_BUG`, `A11Y`, `RESPONSIVE` and `THEMING` categories — a passing test suite does not prove a visual fix
    - **Report the actual command output.** Never claim lint, types, or tests pass without having run them; if something fails, say so and show the failure

11. **Review — both passes:**
    - **`code-reviewer`** (the OpenSpec stage, never skipped) — holistic review of the diff
    - **`/review-parallel`** — six single-angle reviewers in one message, for the fan-out `code-reviewer` cannot do alone
    - Any `HIGH` finding → present it, loop back to step 9 and clear it. **Cap the loop at 2 iterations**; after that report what remains and let the user decide
    - `MEDIUM` and `LOW` findings go into the PR description as known items unless the user asks for them to be fixed
    - If review exposes a **pre-existing** bug, prefer a new change over bundling it into this one

12. **`/opsx:verify`** — validate the implementation against the delta specs: completeness, correctness, coherence. This is spec conformance; step 10 was tooling. Both are required.

13. **Branch and commit**:
    - Check the current branch: `git branch --show-current`
    - If still on `master`, create `bugfix/<change-name>` — the kebab suffix should match the OpenSpec change name
    - **Ask the user to commit** the changed files

14. **`/opsx:archive`** — finalize the change.
    - Add the domain detail to `openspec/SPECS-CATALOG.md` (NOT `CLAUDE.md` — the per-domain history was extracted out of it); add a one-line entry to CLAUDE.md's **Existing Specs** index only if the domain is new, and put any constraint that must hold for future work in **Common Gotchas** instead, since the catalogue is only read on demand
    - Generate the **PR description file**: summary, before/after behaviour, screenshots placeholder for visual changes, and the step 11 findings that were accepted rather than fixed
    - The generated `.md` file is the deliverable — do NOT push or open a PR

## Rules

- OpenSpec owns the artifacts; this command owns the order and the gates
- One bug per change — don't bundle multiple unrelated bugs
- The router picks the pipeline — do not re-classify mid-run
- Steps 8 and 9 stay separate — never merge "find violations" into "fix"
- `requirements-analyst` and `code-reviewer` are never skipped
- `security-reviewer` blocks everything when it runs
- Step 6 is a hard stop — never auto-chain `opsx:apply`
- Review agents are read-only; every edit happens in the main session
- The evaluator–optimizer loop in step 11 is capped at 2 iterations
- Never commit directly on `master`; ask before any git operation
- Never delete an archived change — the archive is the audit trail
