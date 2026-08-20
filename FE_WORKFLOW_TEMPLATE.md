# FE Workflow Template — generator for `.claude/commands/` in a frontend repo

This file is **executable instructions**, not background reading. Point Claude Code at it from inside a frontend repository and it produces a working `.claude/commands/` set — a router, a parallel reviewer, and two factories — adapted to that repo's actual stack.

**This file is self-contained.** Copy it into any frontend repo on any machine and it works on its own — it references no sibling document and needs no companion file. Everything the generation depends on is defined below.

It is the frontend counterpart of a backend command set built on the same three workflow patterns:

| Pattern | What it solves | Where it lands |
| --- | --- | --- |
| **Routing** | One prompt can't carry rules for six different kinds of ticket | `route-ticket.md`, step 0 of both factories |
| **Chaining** | Long constraint-heavy prompts reliably drop constraints | Steps 1–7 of both factories, especially the split between *find violations* and *rewrite* |
| **Parallelization** | One review pass can't weigh a11y, performance, correctness, convention and coverage at once | `review-parallel.md` |
| **Evaluator–optimizer** | Producer and evaluator loop until the evaluator is quiet | Step 4 of the reviewer, step 8 of both factories — capped at 2 iterations |

---

## How to use this file

From the root of the target frontend repo:

> Follow `FE_WORKFLOW_TEMPLATE.md`. Detect the stack, fill the placeholders, and generate the four command files.

Claude then works through Parts 1 → 5 below. Parts 1 and 2 are decisions; Part 3 is the material to copy; Parts 4 and 5 write and check the output.

**Do not skip Part 1.** Every `{{PLACEHOLDER}}` in Part 3 must be resolved to a real value from the repo before anything is written. A generated file still containing `{{` is a failed generation.

---

# Part 1 — Detect the stack

Read these files and record what you find. Do not guess; if a value genuinely cannot be determined, mark it `<!-- TODO: confirm -->` and tell the user at the end rather than inventing a plausible answer.

| Source | What to extract |
| --- | --- |
| `package.json` | Framework and version; test runner; testing library; state library; i18n library; styling approach; router; every script under `"scripts"` |
| Lockfile | `package-lock.json` → npm, `yarn.lock` → yarn, `pnpm-lock.yaml` → pnpm |
| `tsconfig.json` | TypeScript or JavaScript; `strict` on or off; path aliases |
| ESLint config | Which ruleset is in force (`airbnb`, `next/core-web-vitals`, `plugin:vue/*`, custom) |
| Framework config | `next.config.*`, `vite.config.*`, `nuxt.config.*`, `angular.json` |
| Directory listing | Where components, pages/routes, state, API clients, styles, and tests actually live |
| `.git` | Default integration branch — `develop` if it exists, else `main`/`master` |
| Existing `CLAUDE.md` / `README.md` | Conventions already written down; reuse them rather than restating |

Fill this table. It is the contract for everything in Part 3.

| Placeholder | Meaning | Example values |
| --- | --- | --- |
| `{{REPO_NAME}}` | Repo directory name | `efcmc-storefront` |
| `{{FRAMEWORK}}` | UI framework | `React`, `Vue 3`, `Next.js (App Router)`, `Svelte` |
| `{{LANG}}` | Language | `TypeScript`, `JavaScript` |
| `{{COMPONENT_EXT}}` | Component file extension | `.tsx`, `.vue`, `.jsx` |
| `{{DEV_CMD}}` | Dev server | `yarn dev` |
| `{{LINT_CMD}}` | Lint | `yarn lint` |
| `{{TYPECHECK_CMD}}` | Type check, or `n/a` for plain JS | `yarn tsc --noEmit` |
| `{{TEST_CMD}}` | Unit/component tests | `yarn test` |
| `{{BUILD_CMD}}` | Production build | `yarn build` |
| `{{E2E_CMD}}` | E2E tests, or `n/a` | `yarn playwright test` |
| `{{COMPONENT_DIR}}` | Components | `src/components/` |
| `{{PAGE_DIR}}` | Pages / routes | `app/`, `src/pages/` |
| `{{STATE_DIR}}` | Global state | `src/store/`, `src/context/` |
| `{{API_DIR}}` | API clients / data fetching | `src/api/`, `configs/api.ts` |
| `{{STYLE_SYSTEM}}` | Styling approach | `Tailwind`, `CSS Modules`, `styled-components`, `SCSS` |
| `{{TOKEN_SOURCE}}` | Where design tokens live | `tailwind.config.js`, `src/styles/tokens.css` |
| `{{I18N_LIB}}` | i18n library and key location, or `none` | `react-i18next`, keys in `src/locales/` |
| `{{STATE_LIB}}` | State library | `Zustand`, `Redux Toolkit`, `Pinia`, `React Context` |
| `{{TEST_LIB}}` | Component test library | `React Testing Library`, `Vue Test Utils` |
| `{{LINT_RULESET}}` | Lint ruleset in force | `airbnb`, `next/core-web-vitals` |
| `{{BASE_BRANCH}}` | Integration branch | `develop`, `main` |
| `{{TICKET_PREFIX}}` | Issue key prefix, or `n/a` | `WEB`, `FE` |

Also record, for the reviewer's constraint list:

- **A11y baseline** — is there an `eslint-plugin-jsx-a11y` / `vuejs-accessibility` config, or a stated WCAG target?
- **Performance budget** — any bundle-size limit, Lighthouse CI config, or Core Web Vitals target already in the repo?
- **Design tokens** — are colors and spacing centralized, or scattered? This decides whether "no hardcoded color" is enforceable.

---

# Part 2 — Decide the categories, angles, and constraints

## 2a. Routing categories

A router classifies the incoming ticket, then hands it to a pipeline whose prompt, tools and model are tuned for that one category. The benefit is what each pipeline can *force*: the `PERFORMANCE` prompt can require a profile before any fix is proposed, while the `CONFIG_BUILD` prompt never needs to open a component at all. Merge them into one "fix this bug" prompt and you must describe all eight situations in one place — quality drops measurably. The router is also the cheapest place to pick the model for the work that follows.

Eight is the working default below. **Keep six to eight.** Fewer and the router stops earning its keep; more and the boundaries blur.

| Category | Focus | Model | Gate the pipeline must honour |
| --- | --- | --- | --- |
| `UI_BUG` | Render output, CSS, layout, visual regression in `{{COMPONENT_DIR}}` or `{{PAGE_DIR}}` | sonnet | Reproduce visually in `{{DEV_CMD}}` before editing — screenshot or exact DOM/CSS at fault |
| `STATE_BUG` | Stale state, wrong derived value, effect loop, cache invalidation in `{{STATE_DIR}}` | sonnet | Trace the full state path (write → store → select → render) before changing one step |
| `API_INTEGRATION` | Fetch, error/loading states, response shape, auth headers | sonnet | Confirm the real response shape against the network payload or API contract, not the type alone |
| `A11Y` | Keyboard, screen reader, focus, contrast, semantics | opus | Name the WCAG criterion; test with keyboard only before claiming a fix |
| `PERFORMANCE` | Re-renders, bundle size, LCP/INP/CLS | sonnet | **Measure first, fix second** — profile or bundle-analyze before proposing any change |
| `RESPONSIVE` | Breakpoints, overflow, touch targets | sonnet | Check every breakpoint the design defines, not just the one that was reported |
| `NEW_COMPONENT` | Net-new component, page, or feature | opus | Hand off to the task factory |
| `CONFIG_BUILD` | Env vars, build config, bundler, deploy target | haiku | Diff the environment configs; do not change component code |

Adjust to the repo: drop `RESPONSIVE` if the app is desktop-only; add `FORM_VALIDATION` if forms dominate; add `SEO` if it is a marketing or content site.

## 2b. Review angles

Five to six parallel branches. Security matters less for a pure frontend than for an API, but it does not vanish — it shifts to XSS, secrets in the client bundle, and unsafe HTML injection.

| # | Angle | Model | Looks for |
| --- | --- | --- | --- |
| A | Accessibility | opus | Missing labels on interactive elements; non-semantic elements carrying click handlers; keyboard traps and lost focus; missing `alt`; contrast below AA; ARIA that contradicts the role |
| B | Performance | sonnet | Unnecessary re-renders (unstable props, unmemoized callbacks, effect dependency churn); barrel imports pulling in the world; missing code-splitting; unvirtualized long lists; layout thrash and CLS sources |
| C | Correctness | sonnet | Unhandled loading and error states; race conditions between requests; null/undefined on optional data; stale closures; missing list keys; off-by-one at boundaries |
| D | Convention | sonnet | `{{LINT_RULESET}}` violations; inline styles where `{{STYLE_SYSTEM}}` is the convention; hardcoded strings that belong in `{{I18N_LIB}}`; hardcoded colors and spacing outside `{{TOKEN_SOURCE}}`; component/prop naming; business logic sitting in a presentational component |
| E | Test coverage | sonnet | Missing `{{TEST_LIB}}` cases for changed behaviour; untested error and empty states; whether a bug fix has a regression test that fails without the fix; queries that assert implementation detail instead of user-visible behaviour |
| F | Client security | opus | `dangerouslySetInnerHTML` / `v-html` on unsanitized input; secrets or API keys reaching the client bundle; user input interpolated into URLs or `href`; token storage choice; overly broad CORS or CSP assumptions |

Optional extra branches for a content or marketing site: **SEO / meta tags** and **Core Web Vitals** as their own angles rather than folded into Performance. Auditing a page across four independent lenses at once — SEO, WCAG, responsive breakpoints, Core Web Vitals — is the case this pattern was built for.

**Rule that keeps this working:** to add an angle, add a branch. Never widen an existing branch's prompt — that is exactly the merge this pattern exists to prevent.

## 2c. Constraint checklist

This is the list the *find violations* step checks against. Build it from what the repo actually enforces — a constraint nobody enforces is noise. Defaults:

- No inline styles where `{{STYLE_SYSTEM}}` is the convention
- Every interactive element has an accessible name
- Every image has meaningful `alt`, or `alt=""` if decorative
- No user-facing string hardcoded — keys go through `{{I18N_LIB}}`
- No hardcoded color or spacing value outside `{{TOKEN_SOURCE}}`
- No `console.log` left behind
- No `any` / `@ts-ignore` added *(TypeScript repos only)*
- Every list render has a stable `key` — not the array index
- No direct DOM manipulation where the framework owns the node
- Loading and error states are handled for every new data fetch
- No secret, API key, or internal URL added to client-side code
- Only files related to this one ticket are touched

---

# Part 3 — The four command files

Copy each body verbatim, substituting every `{{PLACEHOLDER}}` from Part 1 and every table from Part 2. Write them to `.claude/commands/` in the target repo.

Where the body says "adapt", replace the example with something true of this repo.

## 3a. `.claude/commands/route-ticket.md`

````markdown
---
description: Classify one incoming bug report or task request into exactly one pipeline category, and emit the routing decision as JSON.
argument-hint: <bug report, ticket text, Sentry excerpt, or path to a report file>
model: haiku
---

Routing step for frontend work on {{REPO_NAME}} ({{FRAMEWORK}} / {{LANG}}).

This command classifies the request and nothing else. It does not investigate, does not read the whole codebase, and never edits a file. Its output is the pipeline configuration that `/bug-fix-factory` and `/feature-build-factory` consume.

Why it exists: a single "fix this bug" prompt has to describe all eight situations below at once, and quality drops. Splitting the classification out lets each pipeline carry rules that apply only to it — `PERFORMANCE` can be forced to profile before proposing a memo, while `CONFIG_BUILD` never needs to open a component. The router is also the right place to pick the model for the work that follows.

## Input

`$ARGUMENTS` — the bug report, ticket text, or a path to a file containing it. If `$ARGUMENTS` is empty, ask the user for the report and stop.

## Steps

1. **Read the request.** If `$ARGUMENTS` is a file path, read that file. Read at most a handful of files needed to disambiguate the category — do not start investigating.
2. **Pick exactly one category** from the table below.
3. **Emit the routing decision** as a single fenced ```json block, with no prose before or after it.

## Categories

<!-- Paste the Part 2a table here, with the repo's adjustments applied. -->

## Category gates

Each category carries rules the downstream pipeline **must** honour. Put them in `must_do`.

<!-- Paste the "Gate the pipeline must honour" column here as a bullet per category. -->

## Output format

Exactly one fenced ```json block, nothing else:

```json
{
  "category": "A11Y",
  "area": "{{COMPONENT_DIR}}forms/",
  "confidence": "high",
  "model": "opus",
  "next_command": "/bug-fix-factory",
  "focus": "Keyboard focus is lost when the date picker closes",
  "must_do": [
    "name the WCAG criterion",
    "verify with keyboard only before claiming a fix"
  ],
  "skip": ["bundle size", "API integration"]
}
```

Field notes:

- `area` — the directory or route most likely to own the root cause
- `confidence` — `high`, `medium`, or `low`
- `next_command` — `/bug-fix-factory` for defects, `/feature-build-factory` for new work
- `skip` — what the pipeline should deliberately not spend effort on; this is what keeps the downstream prompt short

> Porting note: in a script that calls the API directly, get this JSON cleanly by prefilling the assistant message with ` ```json ` and setting ` ``` ` as the stop sequence, rather than asking for a fence in the prompt.

## Rules

- **One category only.** If two fit, pick the one that owns the root cause, not the one where the symptom shows.
- **No explanation.** The JSON is the entire response.
- **Never edit code**, never create a branch, never write a ticket. Routing is a read-only classification step.
- **When confidence is `low`, or two categories genuinely tie, ask the user instead of guessing.** Report both candidates and what would distinguish them.
- **Do not re-run the router mid-pipeline.** One classification per request; if the category turns out wrong, stop and tell the user rather than silently switching.
````

## 3b. `.claude/commands/review-parallel.md`

````markdown
---
description: Review the current branch diff from six independent angles in parallel, then aggregate deduplicated findings ranked by severity.
argument-hint: "[base-ref] — defaults to {{BASE_BRANCH}}"
---

Parallel review for frontend changes in {{REPO_NAME}}.

Six reviewers run at the same time, each with exactly one job, then an aggregator merges their output. Each reviewer's prompt stays short and focused instead of one prompt juggling accessibility, performance, correctness, convention, coverage and client security at once. Angles can be tuned independently, and a new angle is added as a new branch — never by widening an existing one.

## Step 1 — Build the shared input once

Every reviewer must read the **same bytes**. Build the input once, then hand all reviewers the same path.

1. Resolve the base ref: `$ARGUMENTS` if given, otherwise `{{BASE_BRANCH}}`.
2. Write the diff to a scratch file:
   - `git diff <base>...HEAD` → full diff
   - `git diff <base>...HEAD --stat` → file summary
3. Note the shared context paths every reviewer will be told to read:
   - `CLAUDE.md` (if present)
   - the lint config and `{{TOKEN_SOURCE}}`
   - any design-system or component-convention doc in the repo

If the diff is empty, stop and report that there is nothing to review.

> Cost note: the diff file plus those context paths are the prefix repeated across all six reviewers. Keeping it byte-identical is what makes the repeated context cheap. In an API implementation this is where the cache breakpoint goes — after tools and system prompt, before the per-angle instruction.

## Step 2 — Dispatch all reviewers in ONE message

**Launch every reviewer in a single message with multiple Agent calls.** Sequential calls give up the entire benefit of this command.

Give each reviewer: the scratch diff path, the shared context paths, and its own single-angle instruction. Every reviewer is **read-only** — it reports, it does not edit.

<!-- Paste the Part 2b table here. -->

Each reviewer returns **only** a fenced ```json block:

```json
[
  {
    "file": "{{COMPONENT_DIR}}forms/DatePicker{{COMPONENT_EXT}}",
    "line": 42,
    "severity": "HIGH",
    "issue": "The close handler moves focus to document.body, so keyboard users lose their place in the form.",
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

1. Write the merged findings, plus a one-line note per angle that came back clean, to `review-<slug>.md` in the repo root.
2. Report the file path, the count by severity, and anything an angle could not determine from the diff alone.

## Rules

- **Dispatch in one message.** Six Agent calls in one block; anything else is sequential and defeats the pattern.
- **One job per reviewer.** To add an angle (SEO, Core Web Vitals, backward compatibility), add a seventh branch — do not extend an existing prompt.
- **Reviewers never write.** All edits happen in the main session, after the user has seen the findings.
- **Loop cap is 2.** Then stop and hand off.
- **Empty is a result.** Do not pad a clean angle with speculative findings.
````

## 3c. `.claude/commands/bug-fix-factory.md`

````markdown
---
description: End-to-end bug-fix workflow — route, investigate, ticket, fix, check constraints, verify, parallel review, branch, commit, PR description.
argument-hint: <bug report, ticket text, Sentry excerpt, or path to a report file>
---

End-to-end bug-fix workflow for {{REPO_NAME}}: from the bug report to the fix, the branch, the commit and the PR description.

The flow is a chain: each step consumes the previous step's output. Two properties matter and are easy to lose:

- **Detection and correction are separate steps** (5 and 6). A single prompt carrying "fix the bug and don't use inline styles and don't forget the aria-label and don't hardcode the string" reliably drops a constraint or two. Listing violations first, then fixing exactly those, is far more stable.
- **Review fans out** (step 8) instead of asking one pass to weigh accessibility, performance, correctness, convention, coverage and client security simultaneously.

## Steps

0. **Route the report** — run `/route-ticket` on the bug report.
   - Adopt the returned `category`, `area`, `focus`, `must_do` and `skip` for the rest of this run
   - `must_do` entries are gates, not suggestions — e.g. `PERFORMANCE` profiles before proposing a fix, `A11Y` names the WCAG criterion
   - If the category is `NEW_COMPONENT`, stop here and hand off to `/feature-build-factory`
   - Do not re-classify later in the run

1. **Investigate** the bug and report the **root cause** before changing anything. Report it in these sections:

   ```
   <symptom>          What the user actually sees, and on which route/breakpoint/browser
   <repro>            Exact steps, state, and data needed to trigger it
   <affected_layers>  page / component / hook / state / API client / style / config
   <broken_code>      file:line and the specific logic at fault
   <why_broken>       Why this code produces the symptom
   <correct_behavior> What should happen instead
   <related>          Related bugs found while looking (do NOT fix them here)
   ```

   Stay inside the routed `focus`; skip what the router listed under `skip`.

2. **Create the bug ticket** — one bug per ticket, written in simple words. Describe the symptom, not the fix.

3. **Ask the user** whether to fix the bug now or keep the ticket as a plan only.
   - If "keep as plan" → stop here and report the ticket path.

4. **Fix the one root cause** — code changes only.
   - Target exactly the cause identified in step 1
   - Do not fix anything listed under `<related>`; those get their own tickets
   - Do not clean up adjacent code, rename things, or reformat untouched lines

5. **Find violations** — review your own diff against the checklist below and **list every violation. Change nothing in this step.**

   <!-- Paste the Part 2c constraint checklist here. -->

   Output the violations as a plain numbered list, each with `file:line` and what rule it breaks. If there are none, say so explicitly and continue.

6. **Rewrite** — fix exactly the violations listed in step 5, and nothing else.
   - Do not re-open the root-cause fix in this step
   - Do not introduce new behaviour while clearing violations

7. **Verify**:
   - Lint: `{{LINT_CMD}}`
   - Type check: `{{TYPECHECK_CMD}}`
   - Tests: `{{TEST_CMD}}`
   - Build, if the change touches config or imports: `{{BUILD_CMD}}`
   - E2E, if the change touches a user-facing flow: `{{E2E_CMD}}`
   - Check the fix in the running app (`{{DEV_CMD}}`) for `UI_BUG`, `A11Y`, and `RESPONSIVE` categories — a passing test suite does not prove a visual fix
   - **Report the actual command output.** Never claim lint, types, or tests pass without having run them; if something fails, say so and show the failure

8. **Parallel review** — run `/review-parallel`.
   - Any `HIGH` finding → present it, then loop back to step 6 and clear it
   - **Cap the loop at 2 iterations**; after that, report what remains and let the user decide
   - `MEDIUM` and `LOW` findings go into the PR description as known items unless the user asks for them to be fixed

9. **Branch**:
   - Check the current branch: `git branch --show-current`
   - If already on a feature branch (not `{{BASE_BRANCH}}`) → go to step 11
   - If still on `{{BASE_BRANCH}}` → **ask the user for context**: a brief description of the bug and fix, plus an optional ticket reference

10. **Create the branch**, named `bugfix/{description}` or `bugfix/{{TICKET_PREFIX}}-{id}-{description}`.

11. **Ask the user to commit** the changed files.

12. **After the commit succeeds**, generate the **PR description file**:
    - Summary, before/after behaviour, screenshots placeholder for visual changes
    - Include the step 8 findings that were accepted rather than fixed
    - The generated `.md` file is the deliverable — do NOT push or open a PR

## Rules

- Always confirm the root cause before fixing (step 3 asks the user)
- One bug per fix — don't bundle multiple unrelated bugs
- The router picks the pipeline — do not re-classify mid-run
- Steps 5 and 6 stay separate — never merge "find violations" into "fix"
- Review agents are read-only; every edit happens in the main session
- The evaluator–optimizer loop in step 8 is capped at 2 iterations
- Never commit directly on `{{BASE_BRANCH}}`; ask before any git operation
````

## 3d. `.claude/commands/feature-build-factory.md`

This is the classic frontend chain — extract spec → generate code → find violations → rewrite → generate tests — with routing and parallel review wrapped around it. Steps 5 and 6 exist because a prompt of the form *"write this component and **don't** use inline styles, **don't** hardcode text, **don't** forget the aria-label"* almost always drops one of the negatives. Splitting into a *find the violations* pass and then a *fix these specific violations* pass is markedly more reliable than repeating the constraints harder.

````markdown
---
description: End-to-end feature workflow — route, spec, ticket, chained build, constraint check, verify, parallel review, branch, commit, PR description.
argument-hint: <feature description, ticket text, mockup path, or requirements file>
---

End-to-end feature workflow for {{REPO_NAME}}: from the request or mockup to the component, the branch, the commit and the PR description.

The flow is a chain: request → spec → markup and styles → state and data → tests. Each step consumes the previous step's output, so no single prompt has to hold the whole feature at once. Two properties matter and are easy to lose:

- **The step 1 spec is the contract.** Every later step reads it rather than re-deriving the component's shape from the original request or mockup.
- **Detection and correction are separate steps** (5 and 6).

## Steps

0. **Route the request** — run `/route-ticket` on the feature description.
   - Expect `NEW_COMPONENT`; if it comes back as a defect category, hand off to `/bug-fix-factory`
   - Adopt the returned `area`, `focus`, `must_do` and `skip`
   - Do not re-classify later in the run

1. **Extract the spec** before writing any code. If a mockup image or design link is supplied, read it here. Emit a single fenced ```json block:

   ```json
   {
     "componentName": "OrderSummaryCard",
     "location": "{{COMPONENT_DIR}}orders/",
     "props": [
       { "name": "order", "type": "Order", "required": true },
       { "name": "onCancel", "type": "() => void", "required": false }
     ],
     "states": ["loading", "empty", "error", "loaded"],
     "events": ["cancel clicked", "row expanded"],
     "data": { "source": "{{API_DIR}}orders", "fetched_by": "parent" },
     "a11y": ["cancel button needs an accessible name", "expanded state needs aria-expanded"],
     "responsive": ["stacks below 768px"],
     "i18n_keys": ["orders.summary.title", "orders.summary.cancel"],
     "tests": ["renders each state", "cancel fires once", "keyboard reaches every control"],
     "out_of_scope": ["order editing", "print view"]
   }
   ```

   Every state in `states` must have a defined visual — if the design does not cover `empty` or `error`, ask rather than inventing one.

2. **Create the task ticket** — one feature per ticket, written in simple words.

3. **Ask the user** whether to build now or keep the ticket as a plan only.
   - If "keep as plan" → stop here and report the ticket path.

4. **Build in chained order.** Each sub-step reads the step 1 spec; complete one before starting the next.

   - **4a. Markup and structure** — semantic elements, correct heading level, accessible names. No styling yet.
   - **4b. Styles** — via `{{STYLE_SYSTEM}}`, values from `{{TOKEN_SOURCE}}`, responsive rules from the spec.
   - **4c. State and data** — local state, then `{{STATE_LIB}}` only if the value is genuinely shared; data through `{{API_DIR}}`. Every state in the spec's `states` is handled.
   - **4d. Strings** — every user-facing string through `{{I18N_LIB}}`, using the keys named in the spec.
   - **4e. Tests** — the cases named in the spec's `tests` field, with `{{TEST_LIB}}`, asserting user-visible behaviour rather than implementation detail.

   If the spec turns out to be wrong mid-build, stop, correct the spec, and say what changed — do not silently drift from it.

5. **Find violations** — review your own diff against the checklist below and **list every violation. Change nothing in this step.**

   <!-- Paste the Part 2c constraint checklist here, plus: -->
   - Everything in the spec's `out_of_scope` is genuinely absent from the diff
   - Every state listed in the spec's `states` is actually reachable and rendered

   Output the violations as a plain numbered list, each with `file:line` and what rule it breaks.

6. **Rewrite** — fix exactly the violations listed in step 5, and nothing else.

7. **Verify**:
   - Lint: `{{LINT_CMD}}`
   - Type check: `{{TYPECHECK_CMD}}`
   - Tests: `{{TEST_CMD}}`
   - Build: `{{BUILD_CMD}}`
   - E2E, if the feature adds or changes a user-facing flow: `{{E2E_CMD}}`
   - View the component in the running app (`{{DEV_CMD}}`) at every breakpoint the spec names
   - **Report the actual command output.** Never claim a pass without having run it

8. **Parallel review** — run `/review-parallel`.
   - Any `HIGH` finding → present it, then loop back to step 6
   - **Cap the loop at 2 iterations**

9. **Branch** — as in `/bug-fix-factory`, named `feature/{description}`.

10. **Ask the user to commit.**

11. **Generate the PR description file** — summary, screenshots placeholder, states covered, accepted findings from step 8. Do NOT push or open a PR.

## Rules

- One feature per run — a new bug found along the way gets its own ticket
- The step 1 spec is the contract — later steps read it instead of re-deriving the work
- Steps 5 and 6 stay separate — never merge "find violations" into "fix"
- Review agents are read-only; every edit happens in the main session
- The evaluator–optimizer loop in step 8 is capped at 2 iterations
- Never commit directly on `{{BASE_BRANCH}}`; ask before any git operation
````

---

# Part 4 — Write the files

1. Create `.claude/commands/` in the target repo if it does not exist.
2. Write all four files with every placeholder resolved.
3. If the repo has no `CLAUDE.md`, note that the commands reference one and offer to run `/init`.
4. If the repo is a monorepo with several frontend packages, write the set **once per package** and keep the copies byte-identical, as the backend services do — or write once at the root if the packages share a stack.

Optional, and worth doing if the repo will accumulate more of this configuration: add a `.claude/rules/` set and reference it from the commands instead of restating rules inline. Three files carry most of the weight:

- `accuracy.md` — name real components, props, hooks and routes; never invent an API shape or claim a test passes without running it; use placeholders for anything the user must supply
- `writing-style.md` — one idea per bullet; state behaviour before and after, not just the code change; write for a reader who has not seen the diff
- `git-safety.md` — never commit on `{{BASE_BRANCH}}`; ask before any git operation; show what will be staged; never `git add -A` blindly

---

# Part 5 — Verify the generation

Run every check. Report the result of each; do not claim a pass without running it.

1. **No unresolved placeholders** — `grep -rn '{{' .claude/commands/` returns nothing.
2. **Frontmatter** — each file opens with `---` and carries `description` and `argument-hint`; `route-ticket.md` also carries `model: haiku`.
3. **Commands resolve** — every command referenced inside another (`/route-ticket`, `/review-parallel`, `/bug-fix-factory`, `/feature-build-factory`) exists as a file.
4. **Paths resolve** — every directory named in the placeholders actually exists in the repo.
5. **Commands are real** — `{{LINT_CMD}}`, `{{TEST_CMD}}`, `{{TYPECHECK_CMD}}`, `{{BUILD_CMD}}` all appear in `package.json` scripts, or are marked `n/a`.
6. **Registration** — restart Claude Code and confirm all four appear with their descriptions.
7. **Router smoke test** — run `/route-ticket` on a real past bug from the repo's issue tracker. Expect a single JSON block, one category, no prose.
8. **Parallel smoke test** — on a scratch branch, introduce one deliberate violation (a hardcoded color, or a button with no accessible name), run `/review-parallel`, and confirm: reviewers launch as multiple Agent calls in **one** message; the aggregator returns JSON containing that finding at `file:line`; no reviewer modified a file.
9. **Report what could not be determined** — every `<!-- TODO: confirm -->` left in Part 1, so the user can fill it in.

---

## Adapting further

The three patterns are the stable part; the tables are not. When the workflow starts to feel wrong:

- **A category keeps getting misrouted** → its boundary overlaps a neighbour. Merge the two, or sharpen the focus column.
- **One reviewer produces most of the noise** → its prompt is carrying more than one job. Split it into two branches.
- **The same violation keeps reaching review** → promote it from the review angle into the Part 2c checklist, so step 5 catches it earlier and cheaper.
- **The loop keeps hitting the cap of 2** → the fix step is under-specified, not the reviewer. Tighten step 1's spec or the root-cause report.

## Techniques this template relies on

Stated here so nothing has to be looked up elsewhere:

- **Model selection per subtask** — Opus for deep reasoning (a11y semantics, client security), Sonnet for balanced coding work, Haiku for fast classification. Using several models in one system is normal and is where most of the cost saving comes from.
- **Structured output** — to get clean JSON out of a model, prefill the assistant message with an opening delimiter and set the closing delimiter as the stop sequence. The model then emits only the payload, with no preamble to strip. In a slash command, the equivalent is "output exactly one fenced block and nothing else."
- **XML tags for structure** — wrap distinct sections of a prompt in descriptive tags (`<symptom>`, `<repro>`) so boundaries are unambiguous. Specific tag names beat generic ones.
- **Be clear, direct, and specific** — lead with an action verb and the exact task; add both output attributes (length, format, structure) and reasoning steps. This alone moves quality more than any other single change.
- **Prompt caching** — the repeated prefix across parallel branches (tools → system prompt → messages) can be cached at a breakpoint. Content must be identical to hit, which is why the reviewer writes the diff to one shared file. Roughly 1024 tokens minimum to cache, up to 4 breakpoints, and the cache is short-lived.
- **Workflows over agents** — when the steps are known in advance, a fixed chain beats a free-roaming agent: easier to test, higher completion rate. Reach for an agent only when the steps genuinely cannot be known ahead of time.
