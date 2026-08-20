---
description: End-to-end feature workflow on top of OpenSpec — route, explore, propose, gate, test, chained build, constraint check, verify, parallel review, archive.
argument-hint: <feature description, ticket text, mockup path, or requirements file>
---

End-to-end feature workflow for dashstack-dashboard.

**OpenSpec owns the lifecycle. This command owns execution discipline.** `CLAUDE.md` mandates the OpenSpec pipeline for every change; this command does not replace it, it drives it and adds three things the pipeline does not have on its own:

| Added | Where it slots in | Why |
| --- | --- | --- |
| **Routing** | Step 0, before `requirements-analyst` | Confirms this is net-new work and picks the model for it, instead of one prompt describing every kind of request. |
| **Chained build order** | Step 7, inside `opsx:apply` | markup → styles → state/data → strings → tests. Each sub-step reads the delta spec instead of re-deriving the component from the original request. |
| **Detect/correct split + parallel review** | Steps 8–9 and 11 | *"write this component and **don't** use inline styles, **don't** hardcode text, **don't** forget the aria-label"* almost always drops one of the negatives. Find violations first, then fix exactly those, then fan review out across six angles. |

The component contract is the **delta spec** in `openspec/changes/<name>/specs/`, not a separate JSON blob. Do not create a parallel ticket or spec format.

## Hard gates

These are not suggestions. They come from `CLAUDE.md` and override anything below.

- **`security-reviewer` BLOCKS.** New features are where dependencies get added. If this change runs `yarn add`, fetches an external URL, or uses a web-sourced snippet, pause **all** other work until the verdict is ✅ allow.
- **Never auto-chain `opsx:apply`.** Step 6 is a full stop. Present findings and wait for the user to trigger implementation.
- **Never commit on `master`.** Ask before any git operation.
- **Yarn only** — never `npm`.

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
   - **7e. Tests** — make the step 5 tests pass; add any case the spec names that they missed. React Testing Library + Vitest in a co-located `__tests__/` directory, asserting user-visible behaviour rather than implementation detail.

   If the spec turns out to be wrong mid-build, stop and revise the spec — the workflow is iterative, not waterfall. Say what changed; do not silently drift from it.

8. **Find violations** — review your own diff against the checklist below and **list every violation. Change nothing in this step.**

   General:

   - No inline styles — **except** the documented tier-2 case: a dynamic value referencing a CSS custom property, e.g. `style={{ color: 'var(--color-primary-600)' }}`. Static styling goes through Tailwind utilities or an SCSS module
   - Every interactive element has an accessible name
   - Every image has meaningful `alt`, or `alt=""` if decorative
   - No user-facing string hardcoded — keys go through `react-i18next`'s `t()`, in both `en` and `jp`
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
   - The component renders correctly in **all three** themes (light, dark, forest)
   - Any new page is lazy-loaded in `src/routes/AppRoutes.tsx`, with its constant in `src/routes/routes.ts` and a nav item in `src/components/Sidebar/navigationData.ts`
   - No manual `useMemo` / `useCallback` added without a stated reason — React Compiler is enabled
   - Directory is `src/configs/` (plural); `i18n.ts` lives at the project root, not in `src/`

   OpenSpec:

   - Every task in `tasks.md` is actually done, or explicitly deferred with a reason
   - Everything the design marked out-of-scope is genuinely absent from the diff
   - Every state the delta spec lists is actually reachable and rendered

   Output the violations as a plain numbered list, each with `file:line` and what rule it breaks.

9. **Rewrite** — fix exactly the violations listed in step 8, and nothing else.

10. **Verify**:
    - Lint: `yarn lint`
    - Type check: `yarn tsc -b`
    - Tests: `yarn test`
    - Build: `yarn build`
    - E2E: `yarn test:e2e` — Playwright, currently covering the modal show/hide animation. Run it if this feature touches those modals; **add cases** if it has behaviour jsdom cannot verify — real animation timing, `prefers-reduced-motion`, theme parity, or computed layout (Vitest swaps CSS Modules for a non-scoped proxy, so no unit test can read a computed style). New specs go in `e2e/`, which is excluded from vitest. **Never run `playwright install`** — it drives the system Chrome via `channel: "chrome"`, a security-review condition
    - View the component in the running app (`yarn dev`) at every breakpoint **and every theme** the spec names
    - **Report the actual command output.** Never claim a pass without having run it

11. **Review — both passes:**
    - **`code-reviewer`** (the OpenSpec stage, never skipped) — holistic review of the diff
    - **`/review-parallel`** — six single-angle reviewers in one message, for the fan-out `code-reviewer` cannot do alone
    - Any `HIGH` finding → present it, loop back to step 9. **Cap the loop at 2 iterations**
    - If review exposes a **pre-existing** bug, prefer a new change over bundling it into this one

12. **`/opsx:verify`** — validate the implementation against the delta specs: completeness, correctness, coherence. Mandatory for a new page or feature. This is spec conformance; step 10 was tooling.

13. **Branch and commit**:
    - If still on `master`, create `feature/<change-name>` — the kebab suffix should match the OpenSpec change name
    - **Ask the user to commit** the changed files

14. **`/opsx:archive`** — finalize the change.
    - Add the domain detail to `openspec/SPECS-CATALOG.md` (NOT `CLAUDE.md` — the per-domain history was extracted out of it); add a one-line entry to CLAUDE.md's **Existing Specs** index only if the domain is new, and put any constraint that must hold for future work in **Common Gotchas** instead, since the catalogue is only read on demand
    - Generate the **PR description file**: summary, screenshots placeholder, states covered, accepted findings from step 11
    - The generated `.md` file is the deliverable — do NOT push or open a PR

## Rules

- OpenSpec owns the artifacts; this command owns the order and the gates
- One feature per run — a bug found along the way gets its own change
- The delta spec is the contract — later steps read it instead of re-deriving the work
- Steps 8 and 9 stay separate — never merge "find violations" into "fix"
- `requirements-analyst` and `code-reviewer` are never skipped
- `security-reviewer` blocks everything when it runs
- Step 6 is a hard stop — never auto-chain `opsx:apply`
- Review agents are read-only; every edit happens in the main session
- The evaluator–optimizer loop in step 11 is capped at 2 iterations
- Never commit directly on `master`; ask before any git operation
- Never delete an archived change — the archive is the audit trail
