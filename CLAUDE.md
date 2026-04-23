# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DashStack is a React 19 + TypeScript dashboard application built with Vite 7, featuring multi-theme support (light/dark/forest), internationalization (en/jp), and a hybrid styling approach combining Tailwind CSS v4 with SCSS modules.

## Development Commands

```bash
yarn dev        # Start development server with HMR
yarn build      # TypeScript compile + Vite build
yarn lint       # ESLint (flat config)
yarn preview    # Preview production build
yarn test       # Run unit tests (single run)
yarn test:watch # Run tests in watch mode
yarn test:coverage # Run tests with coverage report
```

**Package Manager**: Use **Yarn** exclusively (NOT npm).

**Testing**: Vitest with jsdom, React Testing Library, and `@testing-library/jest-dom` matchers. Config in `vitest.config.ts`, setup in `src/test/setup.ts`. Test files use `__tests__/` directories co-located with source. Global `vi`, `describe`, `it`, `expect` are available (no imports needed). `react-i18next` is globally mocked in setup to return translation keys as-is.

## Environment

The primary env var is `VITE_API_BASE_URL` (defaults to `http://localhost:3000/api`). Access via `import.meta.env`. Environment helpers in `src/constants/environment.ts`.

## Architecture

### Build Stack

- **Vite 7** with `@vitejs/plugin-react`
- **React Compiler** enabled via `babel-plugin-react-compiler` in `vite.config.ts` — auto-optimizes components, reducing need for manual `useMemo`/`useCallback`
- **TypeScript 5.9** strict mode with project references (`tsconfig.app.json` for app, `tsconfig.node.json` for config)
- **Tailwind CSS v4** via `@tailwindcss/postcss` PostCSS plugin
- **ESLint** flat config (`eslint.config.js`) with TypeScript ESLint, React Hooks, and React Refresh plugins. Ignores `dist` and `resource` directories.

### Styling: 3-Tier System

1. **Tailwind utilities** (primary, 90% of styling) — theme-aware utility classes defined in `src/index.css` (`.bg-surface`, `.text-primary`, `.card`, `.bg-sidebar`, etc.)
2. **CSS custom properties** — for dynamic/inline styles: `style={{ color: 'var(--color-primary-600)' }}`
3. **SCSS modules** — only for complex components (animations, pseudo-elements). Co-located as `ComponentName.module.scss`

**Class name composition**: Use `classnames` library (NOT `clsx`) via the `cn()` helper at `src/utils/cn.ts`.

### Design Token System

Tokens exist in two parallel formats that **must stay in sync**:

- **SCSS variables** in `src/assets/styles/_variables.scss` (with helper functions `color()`, `spacing()`, `font-size()`)
- **CSS custom properties** in `src/index.css` (`:root` and `[data-theme]` selectors for theme-adaptive values)

SCSS mixins are in `src/assets/styles/_mixins.scss` (layout, theming, responsive, effects).

### Theme System

Three themes: `light` | `dark` | `forest`. Managed via `ThemeContext` + `useTheme()` hook. Theme sets `data-theme` attribute on `<html>`, which drives CSS variable values. Detection order: localStorage (`"theme"` key) → system preference → light default.

### Routing

React Router v7 with lazy-loaded routes. Route constants in `src/routes/routes.ts` (ROUTES object). Route setup in `src/routes/AppRoutes.tsx`. All dashboard routes wrapped in `DashboardLayout`. Login is the only public route. Auth guard available via `withAuth` HOC in `src/hoc/`.

Nested route: `products/:id/edit` → `EditProduct` page.

**Adding a new page**:

1. Create `src/pages/NewPage/index.tsx`
2. Add route constant to `src/routes/routes.ts`
3. Add lazy import + `<Route>` in `src/routes/AppRoutes.tsx` inside DashboardLayout
4. Add sidebar nav item in `src/components/Sidebar/navigationData.ts`

### State Management

- **Local state**: `useState`/`useReducer` for component-scoped UI state
- **Context**: `ThemeContext` (theme), `WishlistContext` (wishlist/favorites)
- **Server state**: TanStack React Query via `src/hooks/useReactQuery.ts` (custom wrapper re-exporting `useQuery`, `useMutation`, `useQueryClient`, `queryClient`). Default config: staleTime 5min, gcTime 10min, retry 1, refetchOnWindowFocus disabled. Domain hooks: `useTodos`, `useDeals`, `useProducts`, `useBanners`. Optimistic updates with rollback in mutation hooks.
- **Persistent state**: `useLocalStorage` hook

### Two API Clients

1. **Fetch-based** (`src/services/api.ts`) — lightweight `apiService` object with `get/post/put/patch/delete`. Used by most domain services.
2. **Axios** (`src/configs/api.ts`) — `apiClient` with request/response interceptors, auto-injects Bearer token, handles 401 (redirect to login), development logging. Use for authenticated calls.

Domain services follow pattern: `src/services/{domain}.ts` → maps API DTOs to internal types.

### App Configuration

`src/configs/app-config.ts` exports `appConfig` — centralized settings for API (base URL, timeout), auth (token keys), pagination defaults, and feature flags.

### Internationalization

i18next + react-i18next. Config at **project root** `i18n.ts` (not in `src/`). Translation files at `public/locales/{en|jp}/{namespace}.json`. Registered namespaces in `i18n.ts`: common, navigation, auth, dashboard, products, orders, settings, todo, theme, errors, messages, calendar, contact, team, invoice, inbox. Additional locale files exist for: pricing, favorites (loaded on-demand by components). All UI text should use the `t()` function.

### Notable Libraries

- **recharts** — chart components (dashboard widgets, revenue charts)
- **react-pro-sidebar** — sidebar navigation
- **react-paginate** — pagination controls
- **react-slick** + **slick-carousel** — carousels/sliders
- **react-tooltip** — tooltips
- **lodash** — utility functions
- **lucide-react** — icons (standard sizes: `w-4 h-4` small, `w-5 h-5` default, `w-6 h-6` large)

### Component Conventions

- Functional components with TypeScript, `type` for props (not `interface`), explicit `React.JSX.Element` return type
- Component folders: `ComponentName/index.tsx` + optional `ComponentName.module.scss` + sub-components
- No path aliases — use relative imports throughout

### App Provider Structure

`ThemeProvider` → `QueryClientProvider` → `WishlistProvider` → `AppRoutes` (see `src/App.tsx`)

## Workflow

### Principles

The workflow follows four OpenSpec principles:

- **Fluid not rigid** — Artifacts can be created in any order. Don't force a linear phase gate when a different sequence makes more sense for the change at hand.
- **Iterative not waterfall** — Requirements change as understanding deepens. Revisit and revise artifacts at any point — a proposal written before reading the code may need to change after.
- **Easy not complex** — Scale process to the change. Every change gets a proposal, but a one-line fix gets a one-line proposal — not the same ceremony as a new feature.
- **Brownfield-first** — This is an existing codebase. Read the code, understand what's there, then specify _deltas_ — not green-field descriptions.

### Right-Sizing the Process

Every change runs the same OpenSpec pipeline. Subagents are **mandatory at their stage** — size only affects how deep each agent goes, never whether the agent runs.

**The pipeline (every change):**

1. `requirements-analyst` — check the user's requirements, ask clarifying questions, and resolve all ambiguities **before** generating artifacts. Only proceed to step 2 when requirements are clear.
2. `opsx:propose` — create proposal + design + specs + tasks (from clarified requirements)
3. `security-reviewer` — run **before** any `yarn add` / external URL / web-sourced snippet in the change (skip only if the change adds no dependencies or external code). **⛔ BLOCKING: pause ALL other work until the security-reviewer reports safe. Do not proceed with unit-test-writer, opsx:apply, or any install/fetch commands until the verdict is ✅ allow.**
4. `unit-test-writer` — write tests from specs **before** `opsx:apply` when the change produces testable units (components, hooks, utilities); skip only for pure config, routing, docs, or cosmetic styling changes
5. **⏸ WAIT for user** — present findings from steps 3–4 and wait for the user to explicitly trigger `opsx:apply`. Never auto-chain implementation.
6. `opsx:apply` via `react-frontend-specialist` — implementation (user-triggered)
7. `code-reviewer` — review the diff after implementation
8. `opsx:verify` — validate implementation matches specs (completeness, correctness, coherence)
9. `opsx:archive` — finalize; update the "Existing specs" list below

**Small changes** (typos, renames, one-line fixes, simple styling tweaks):

- `requirements-analyst` and `code-reviewer` are never skipped — quick pass (may need zero questions for trivial changes), a one-line proposal, a short code-reviewer pass.
- Skip `unit-test-writer` only if no testable unit is produced (pure styling, routing constants, config tweaks).
- Skip `security-reviewer` only if the change touches no dependencies or external code.

**Medium changes** (new component, bug fix spanning multiple files, refactor):

- Full pipeline, normal depth. Do not skip `requirements-analyst` even if the request feels unambiguous — it catches gaps before artifacts are generated.
- `unit-test-writer` is required whenever the diff includes components, hooks, or utilities.

**Large changes** (new page, new feature, cross-cutting refactor):

- Full pipeline, deep depth. `requirements-analyst` does thorough requirements gathering — **present questions and wait for user answers** before running `opsx:propose`.
- After pre-implementation stages complete, **always wait for user to trigger `opsx:apply`**.
- `opsx:verify` is mandatory before `opsx:archive`.

### When to Use OpenSpec

Always use `opsx:propose` before implementing any change. The proposal scales to the change — a simple fix gets a brief proposal, a new feature gets a thorough one.

**Core commands (every change):**

- `/opsx:propose "description"` — Plan a change (proposal, design, specs, tasks — creates all artifacts at once)
- `/opsx:apply [change-name]` — Implement tasks from a change
- `/opsx:archive [change-name]` — Archive a completed change
- `/opsx:explore [topic]` — Think through ideas (read-only)

**Expanded commands (available for finer control):**

- `/opsx:new [change-name]` — Scaffold a change directory without creating artifacts (separate from artifact creation)
- `/opsx:ff [change-name]` — Fast-forward: create all remaining planning artifacts at once (like `propose` but for an existing scaffold)
- `/opsx:continue [change-name]` — Create the next artifact one step at a time, reviewing each before proceeding
- `/opsx:verify [change-name]` — Validate implementation against specs (completeness, correctness, coherence)
- `/opsx:sync [change-name]` — Merge delta specs from a change into main `openspec/specs/`
- `/opsx:bulk-archive` — Archive multiple completed changes at once with conflict detection
- `/opsx:onboard` — Onboard to the project by reading existing specs and architecture

**When to use `ff` vs `continue`:**

| Situation                                   | Use                           |
| ------------------------------------------- | ----------------------------- |
| Clear requirements, ready to build          | `/opsx:ff` or `/opsx:propose` |
| Exploring, want to review each artifact     | `/opsx:continue`              |
| Want to iterate on proposal before specs    | `/opsx:continue`              |
| Time pressure, need to move fast            | `/opsx:ff`                    |
| Complex change, want control over each step | `/opsx:continue`              |

**Rule of thumb:** If you can describe the full scope upfront, use `propose` or `ff`. If you're figuring it out as you go (after `/opsx:explore`), use `new` + `continue`.

[OpenSpec](https://github.com/Fission-AI/OpenSpec) specs live in `openspec/`.

### Available Subagents

Each agent maps to a specific stage of the OpenSpec workflow. The agent is required at its stage unless its explicit "Skip when" condition is met.

| Agent                       | OpenSpec Stage                                                       | Purpose                                                                                                                                            | Skip when                                                                                         |
| --------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `requirements-analyst`      | **Before** `opsx:propose`                                            | Checks requirements, asks clarifying questions, resolves ambiguities so `opsx:propose` generates correct artifacts the first time                  | Never skip — even "obvious" requests have hidden assumptions                                      |
| `security-reviewer`         | Before `yarn add` / fetching external URLs / using web-searched code | **⛔ BLOCKING** — reviews packages, URLs, and external snippets for typosquatting, CVEs, malicious code. Pause all work until verdict is ✅ allow. | The change adds no dependencies and pulls in no external code                                     |
| `unit-test-writer`          | Before `opsx:apply` (TDD)                                            | Writes tests from specs before implementation so tests drive the diff                                                                              | The change produces no testable units — pure config, routing constants, styling-only tweaks, docs |
| `react-frontend-specialist` | During `opsx:apply`                                                  | Implements UI components, layouts, state, API integration, bug fixes, refactoring, accessibility                                                   | The change has no UI surface (e.g., pure config)                                                  |
| `code-reviewer`             | After `opsx:apply`, before `opsx:verify`                             | Reviews the diff for quality, correctness, security, and best practices                                                                            | Never skip                                                                                        |

**Canonical sequence (every change):**

```
requirements-analyst              (clarify requirements with the user FIRST)
  → opsx:propose               (generate artifacts from clarified requirements)
  → security-reviewer          (if yarn add / external code — ⛔ BLOCKS until safe)
  → unit-test-writer           (if testable units; tests land first)
  ⏸ WAIT — present findings, wait for user to trigger apply
  → opsx:apply via react-frontend-specialist   (user-triggered only)
  → code-reviewer              (address findings before continuing)
  → opsx:verify
  → opsx:archive
```

Right-size within this sequence by shortening each stage — not by removing stages. A trivial request still gets a fast `requirements-analyst` pass (may need zero questions); a styling tweak still gets `code-reviewer`. Skipping an agent requires its "Skip when" condition to be true.

### Parallel Changes

Work on multiple changes concurrently. Each change lives in its own `openspec/changes/` directory, so context-switching is straightforward:

```
Change A: propose → apply (in progress)
                        │
                   context switch
                        │
Change B: propose → apply → archive
                        │
                   context switch back
                        │
Change A:          → resume apply → archive
```

- Use `/opsx:apply [change-name]` to resume a specific change
- Use `/opsx:bulk-archive` to archive multiple completed changes at once (detects spec conflicts automatically)
- Each change's artifacts are independent — no cross-contamination

### Update vs. New Change

When requirements shift during a change, decide whether to update the existing change or start a new one:

**Update the existing change when:**

- Same intent, refined execution (e.g., "dark mode toggle" → "dark mode toggle with system preference detection")
- Scope narrows (shipping MVP first, rest later)
- Learning-driven corrections (codebase isn't what you expected)
- Design tweaks based on implementation discoveries

**Start a new change when:**

- Intent fundamentally changed (e.g., "add dark mode" → "add custom theme engine")
- Scope exploded to different work entirely
- Original change can be marked "done" standalone
- Patches would confuse more than clarify

**Quick test:** Can the original change be archived as a complete, coherent unit without these new changes? If yes → new change. If no → update.

### Archive Maintenance

Never delete archived changes — they are the audit trail (proposal, design, tasks, specs) that doesn't exist in structured form anywhere else. Let the archive grow; it's markdown and has negligible cost.

When the **Existing specs** list below grows unwieldy, reorganize it by domain rather than listing every change individually. When spec files grow too large from accumulated deltas, split them by subdomain (e.g., `inbox/compose/spec.md`, `inbox/folders/spec.md`).

### Non-Code Actions (No Workflow Needed)

- Pure questions or explanations ("what does X do?", "explain this code")
- Git operations, running dev server, config lookups, reading files
- When the user explicitly invokes a specific `/opsx:` command directly (follow that command instead)

**Existing specs** (archived in `openspec/changes/archive/`, organized by domain):

**Core Infrastructure** — build pipeline, TypeScript config, app bootstrap, design tokens, theme switching, SCSS mixins, routing, lazy loading, sidebar navigation, dual API clients, React Query config, domain services/hooks, i18n config, unit testing setup, pinned package versions

**Dashboard** — dashboard composition, recharts widgets, DealDetailsTable

**Calendar** — month/day/week views with time grids, add/edit/delete events, confirmation modal, image upload, participants input, popover viewport clamping, guest avatar row, today highlight, paginated event sidebar

**Todo** — per-card row layout, starred yellow background, completed row styling (checkbox, strikethrough, star/delete on every row), forest-theme warning-light override

**Contact** — 3-col card grid, avatar photos, Message button navigates to Inbox, Add New Contact form page (photo upload, 6-field form, validation)

**Team** — 3-col card grid, avatar photos, Add New Member form page, shared AddPersonForm component extracted from Contact/Team

**Inbox** — two-panel layout, folder sidebar, message list with search/pagination, chat view, label dropdown, star-toggle with Starred folder, bin folder (soft-delete/restore/bulk-delete), select-all checkbox, compose view (removed redundant Cancel and Save as Draft buttons)

**Invoice** — sender/recipient header, items table, total, Print/Send buttons

**Settings** — general settings form (logo upload with drag & drop, 5-field form, validation, save with toast), required field asterisks across pages

**TopNav** — user profile dropdown menu, language switcher dropdown, notification dropdown, 3-way dropdown coordination, toast system

**i18n** — Korean language added then removed (net: en/jp only)

**Shared UI** — TableCommon, StatusBadge, Buttons, product management (Products, Favorites, ProductStock, WishlistContext)

## Common Gotchas

- **Yarn only** — never use `npm`
- **`classnames` not `clsx`** — use the `cn()` helper
- **Two API clients** — most services use the fetch-based one despite axios being installed
- **No path aliases** — all imports are relative
- **`configs/` is plural** — not `config/`
- **`i18n.ts` is in project root** — not in `src/`
- **All pages must be lazy-loaded** in `AppRoutes.tsx`
- **All components must support all 3 themes** — no hardcoded colors
- **React Compiler handles memoization** — manual `useMemo`/`useCallback` rarely needed
