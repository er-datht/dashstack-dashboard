---
description: End-to-end bug-fix workflow on top of OpenSpec — route, root-cause, propose, gate, test, apply, constraint check, verify, parallel review, archive, PR description.
argument-hint: <bug report, ticket text, Sentry excerpt, or path to a report file>
---

End-to-end bug-fix workflow for dashstack-dashboard.

**OpenSpec owns the lifecycle. This command owns execution discipline.** `CLAUDE.md` mandates the OpenSpec pipeline for every change; this command does not replace it, it drives it and adds three things the pipeline does not have on its own:

| Added                    | Where it slots in                            | Why                                                                                                                                                                                                      |
| ------------------------ | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Routing**              | Step 0, before `requirements-analyst`        | One prompt can't carry rules for eight kinds of defect. The router also picks the model for the work that follows.                                                                                       |
| **Detect/correct split** | Steps 8–9, after `opsx:apply`, before review | A single prompt carrying "fix the bug and don't use inline styles and don't forget the aria-label" reliably drops a constraint. Listing violations first, then fixing exactly those, is far more stable. |
| **Parallel review**      | Step 11, alongside `code-reviewer`           | One pass can't weigh a11y, performance, correctness, convention, coverage and client security at once.                                                                                                   |

Everything else — the ticket, the design, the delta specs, the task list, the archive — **is** OpenSpec. Do not create a parallel ticket format.

## Hard gates

Read `.claude/rules/hard-gates.md` and apply it in full. It overrides anything below. In this pipeline the stop it refers to is **step 6**.

Then read `.claude/rules/pipeline-discipline.md` — the rules both factories share. This command adds only what is specific to fixing a bug.

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

   Stay inside the routed `focus`; skip what the router listed under `skip`. **Read `openspec/specs/` for the affected capability first** — the spec is the source of truth for correct behavior, so `<correct_behavior>` should cite it rather than be invented. Check `openspec/changes/archive/` for prior decisions on the same surface.

2. **`requirements-analyst`** — never skipped, even for a one-line fix. It reads the existing specs first, then resolves ambiguity in the root-cause report. Present its questions to the user and **wait for answers** before step 3. For a trivial fix this may be a zero-question pass.

3. **`/opsx:propose`** — create the change: proposal, design, delta specs, tasks. This **is** the bug ticket; do not write a separate one.
   - Right-size it — a one-line fix gets a one-line proposal
   - The delta spec states the corrected behavior as a requirement plus scenarios, not as a diff description
   - Anything under `<related>` becomes its own future change, not a task here

4. **`security-reviewer`** — run **only** if this fix adds a dependency, an external URL, or web-sourced code. ⛔ **BLOCKING** — if it runs, nothing else proceeds until the verdict is ✅ allow. Skip when the change adds no external code.

5. **`unit-test-writer`** — write the regression test from the delta spec **before** implementation. The test must fail without the fix. Skip only if the change produces no testable unit (pure styling, routing constants, config).

6. **⏸ WAIT for the user.** Present the proposal, the security verdict, and the tests. **Stop here.** Do not proceed to step 7 until the user explicitly triggers apply.

7. **`/opsx:apply` via `react-frontend-specialist`** — implement the tasks.
   - Target exactly the cause identified in step 1
   - Do not fix anything under `<related>`; do not clean up adjacent code, rename, or reformat untouched lines

8. **Find violations** — review your own diff against `.claude/rules/diff-constraints.md` and **list every violation. Change nothing in this step.** Add these bug-fix-specific OpenSpec checks to that list:
   - Every task in `tasks.md` is actually done, or explicitly deferred with a reason
   - The diff does nothing the delta spec does not cover — scope creep shows up here

9. **Rewrite** — fix exactly the violations listed in step 8, and nothing else.
   - Do not re-open the root-cause fix in this step
   - Do not introduce new behavior while clearing violations

10. **Verify** — run everything in `.claude/rules/verify.md`. The build is optional here unless the fix touches config or imports; if you skip it, run `yarn tsc -b` on its own. Plus, for this pipeline:
    - Check the fix in the running app (`yarn dev`) for `UI_BUG`, `A11Y`, `RESPONSIVE` and `THEMING` categories — a passing test suite does not prove a visual fix
    - The regression test from step 5 must fail without the fix and pass with it

11. **Review — both passes, dispatched together.** Both are read-only over the same diff and neither consumes the other's output, so launch them concurrently rather than waiting for the first to finish:
    - **`code-reviewer`** (the OpenSpec stage, never skipped) — holistic review of the diff
    - **`/review-parallel`** — six single-angle reviewers in one message, for the fan-out `code-reviewer` cannot do alone
    - Dedupe across all seven reports before presenting — several angles will land on the same line
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

15. **Run the `pr` skill** — it owns the PR description format; do not restate it here. Hand it the step 11 findings that were accepted rather than fixed, so they land as **Known items**. The generated `.md` file is the deliverable.

## Rules

`.claude/rules/hard-gates.md` and `.claude/rules/pipeline-discipline.md` apply in full. Specific to this pipeline:

- **One bug per change** — don't bundle multiple unrelated bugs
- **The router picks the pipeline** — do not re-classify mid-run
- **Fix the cause, not the surroundings** — nothing under `<related>`, no adjacent cleanup, no reformatting untouched lines
- **A passing test suite does not prove a visual fix** — `UI_BUG`, `A11Y`, `RESPONSIVE` and `THEMING` get checked in the running app
