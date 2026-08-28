---
description: End-to-end feature workflow on top of OpenSpec — route, explore, propose, gate, test, chained build, constraint check, verify, parallel review, archive, PR description.
argument-hint: <feature description, ticket text, mockup path, or requirements file>
---

End-to-end feature workflow for dashstack-dashboard.

**OpenSpec owns the lifecycle. This command owns execution discipline.** `CLAUDE.md` mandates the OpenSpec pipeline for every change; this command does not replace it, it drives it and adds three things the pipeline does not have on its own:

| Added                                      | Where it slots in                     | Why                                                                                                                                                                                                                                                |
| ------------------------------------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Routing**                                | Step 0, before `requirements-analyst` | Confirms this is net-new work and picks the model for it, instead of one prompt describing every kind of request.                                                                                                                                  |
| **Chained build order**                    | Step 7, inside `opsx:apply`           | markup → styles → state/data → strings → tests. Each sub-step reads the delta spec instead of re-deriving the component from the original request.                                                                                                 |
| **Detect/correct split + parallel review** | Steps 8–9 and 11                      | _"write this component and **don't** use inline styles, **don't** hardcode text, **don't** forget the aria-label"_ almost always drops one of the negatives. Find violations first, then fix exactly those, then fan review out across six angles. |

The component contract is the **delta spec** in `openspec/changes/<name>/specs/`, not a separate JSON blob. Do not create a parallel ticket or spec format.

## Hard gates

Read `.claude/rules/hard-gates.md` and apply it in full. It overrides anything below. In this pipeline the stop it refers to is **step 6**.

Then read `.claude/rules/pipeline-discipline.md` — the rules both factories share. This command adds only what is specific to building a feature.

## Steps

0. **Route the request** — run `/route-ticket` on the feature description.
   - Expect `NEW_COMPONENT`; if it comes back as a defect category, hand off to `/bug-fix-factory`
   - Adopt the returned `area`, `focus`, `must_do` and `skip`
   - Do not re-classify later in the run

1. **`/opsx:explore`** — **optional**, read-only, produces no artifacts. Run it when scope is fuzzy, the design is open-ended (no Figma, no anchoring spec), or the user says "brainstorm / think / explore". Skip when the request is concrete and bounded. Its output feeds step 2.

2. **`requirements-analyst`** — never skipped. It reads `openspec/specs/` **first**, then explores the code for what the specs don't cover, then asks clarifying questions. For a new page or feature this is the deep pass: **present the questions and wait for the user's answers** before step 3.

   Resolve at least these before proposing, because they are the ones this repo keeps re-learning:
   - Every state the component can be in — if the design does not cover `empty` or `error`, ask rather than inventing one
   - Behaviour in all three themes (light, dark, forest)
   - Whether new i18n keys need a new namespace registered in the root `i18n.ts`
   - What is explicitly **out of scope**

3. **`/opsx:propose`** — create the change: proposal, design, delta specs, tasks. This **is** the task ticket; do not write a separate one.
   - The delta spec is the contract every later step reads
   - Record the component shape in `design.md` — name, location, props with types and required-ness, states, events, data source and who fetches it, a11y obligations, responsive rules, themes, i18n keys, planned tests, and out-of-scope
   - Brownfield-first: specify the **delta** against existing specs, not a green-field description

4. **`security-reviewer`** — run **only** if this change adds a dependency, an external URL, or web-sourced code. ⛔ **BLOCKING** — if it runs, nothing else proceeds until the verdict is ✅ allow.

5. **`unit-test-writer`** — write tests from the delta spec **before** implementation, so the tests drive the diff. Cover the states and behaviours the spec names. Skip only if the change produces no testable unit (pure config, routing constants, docs, cosmetic styling).

6. **⏸ WAIT for the user.** Present the proposal, the security verdict, and the tests. **Stop here.** Do not proceed to step 7 until the user explicitly triggers apply.

7. **`/opsx:apply` via `react-frontend-specialist`** — implement in chained order. Each sub-step reads the delta spec; complete one before starting the next.
   - **7a. Markup and structure** — semantic elements, correct heading level, accessible names. No styling yet.
   - **7b. Styles** — Tailwind utilities first (the theme-aware classes in `src/index.css`), an SCSS module only for animations and pseudo-elements; every color and spacing value from `src/index.css` or `src/assets/styles/_variables.scss`; responsive rules from the spec. Verify all three themes.
   - **7c. State and data** — local `useState`/`useReducer` first, then React Context (`src/contexts/`) only if the value is genuinely shared; server state through TanStack React Query via `src/hooks/useReactQuery.ts`; data through `src/services/`. Every state the spec names is handled.
   - **7d. Strings** — every user-facing string through `react-i18next`'s `t()`, using the keys named in the spec, added to **both** `public/locales/en/` and `public/locales/jp/` with key parity. Register any new namespace in the root `i18n.ts`.
   - **7e. Tests** — make the step 5 tests pass; add any case the spec names that they missed. React Testing Library + Vitest in a co-located `__tests__/` directory, asserting user-visible behavior rather than implementation detail.

   If the spec turns out to be wrong mid-build, stop and revise the spec — the workflow is iterative, not waterfall. Say what changed; do not silently drift from it.

8. **Find violations** — review your own diff against `.claude/rules/diff-constraints.md` and **list every violation. Change nothing in this step.** Add these feature-specific OpenSpec checks to that list:
   - Every task in `tasks.md` is actually done, or explicitly deferred with a reason
   - Everything the design marked out-of-scope is genuinely absent from the diff
   - Every state the delta spec lists is actually reachable and rendered

9. **Rewrite** — fix exactly the violations listed in step 8, and nothing else.

10. **Verify** — run everything in `.claude/rules/verify.md`; the build is not optional for a feature. Plus, for this pipeline:
    - View the component in the running app (`yarn dev`) at every breakpoint **and every theme** the spec names

11. **Review — both passes, dispatched together.** Both are read-only over the same diff and neither consumes the other's output, so launch them concurrently rather than waiting for the first to finish:
    - **`code-reviewer`** (the OpenSpec stage, never skipped) — holistic review of the diff
    - **`/review-parallel`** — six single-angle reviewers in one message, for the fan-out `code-reviewer` cannot do alone
    - Dedupe across all seven reports before presenting — several angles will land on the same line
    - Any `HIGH` finding → present it, loop back to step 9. **Cap the loop at 2 iterations**
    - If review exposes a **pre-existing** bug, prefer a new change over bundling it into this one

12. **`/opsx:verify`** — validate the implementation against the delta specs: completeness, correctness, coherence. Mandatory for a new page or feature. This is spec conformance; step 10 was tooling.

13. **Branch and commit**:
    - If still on `master`, create `feature/<change-name>` — the kebab suffix should match the OpenSpec change name
    - **Ask the user to commit** the changed files

14. **`/opsx:archive`** — finalize the change.
    - Add the domain detail to `openspec/SPECS-CATALOG.md` (NOT `CLAUDE.md` — the per-domain history was extracted out of it); add a one-line entry to CLAUDE.md's **Existing Specs** index only if the domain is new, and put any constraint that must hold for future work in **Common Gotchas** instead, since the catalogue is only read on demand

15. **Run the `pr` skill** — it owns the PR description format; do not restate it here. Hand it the states the delta spec named, so they reach **How to Test?**, and the step 11 findings that were accepted rather than fixed, so they land as **Known items**. The generated `.md` file is the deliverable.

## Rules

`.claude/rules/hard-gates.md` and `.claude/rules/pipeline-discipline.md` apply in full. Specific to this pipeline:

- **One feature per run** — a bug found along the way gets its own change
- **The delta spec is the contract** — later steps read it instead of re-deriving the work from the original request
- **Build in chained order** (step 7) — markup → styles → state/data → strings → tests, one sub-step finished before the next starts
- **If the spec turns out to be wrong mid-build, revise the spec** — say what changed; never silently drift from it
