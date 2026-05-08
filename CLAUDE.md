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

i18next + react-i18next. Config at **project root** `i18n.ts` (not in `src/`). Translation files at `public/locales/{en|jp}/{namespace}.json`. Registered namespaces in `i18n.ts`: common, navigation, auth, dashboard, products, orders, settings, todo, theme, errors, messages, calendar, contact, team, invoice, inbox, uiElements. Additional locale files exist for: pricing, favorites (loaded on-demand by components). All UI text should use the `t()` function.

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
- **Brownfield-first** — This is an existing codebase. Read existing specs first (`openspec/specs/`), then code only for details not in specs, understand what's there, then specify _deltas_ — not green-field descriptions.

### Right-Sizing the Process

Every change runs the same OpenSpec pipeline. Subagents are **mandatory at their stage** — size only affects how deep each agent goes, never whether the agent runs.

**The pipeline (every change):**

0. `opsx:explore` (**optional**) — read-only thinking partner that runs **before** `requirements-analyst` when scope is fuzzy, design is open-ended (no Figma, no anchoring spec), or the user says "brainstorm / think / explore". Produces no artifacts; the output (decisions, sketches, open threads) becomes input for step 1. Skip when the request is concrete and bounded (e.g., "rename X to Y", "fix bug in Z").
1. `requirements-analyst` — **read existing OpenSpec specs first** (`openspec/specs/`) for the relevant domain before exploring the codebase, then check the user's requirements, ask clarifying questions, and resolve all ambiguities **before** generating artifacts. Specs are the source of truth for what's been built; only dive into code for details not covered by specs. Only proceed to step 2 when requirements are clear.
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

> **Note:** `opsx:explore` is a **skill**, not a subagent — it runs in the main conversation as a thinking partner _before_ the pipeline starts. Use it when scope or design is open-ended; skip when the request is concrete. Its output (decisions, sketches, open threads) feeds `requirements-analyst`.

| Agent                       | OpenSpec Stage                                                       | Purpose                                                                                                                                                                                    | Skip when                                                                                         |
| --------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `requirements-analyst`      | **Before** `opsx:propose`                                            | **Reads existing specs first** (`openspec/specs/`), then checks requirements, asks clarifying questions, resolves ambiguities so `opsx:propose` generates correct artifacts the first time | Never skip — even "obvious" requests have hidden assumptions                                      |
| `security-reviewer`         | Before `yarn add` / fetching external URLs / using web-searched code | **⛔ BLOCKING** — reviews packages, URLs, and external snippets for typosquatting, CVEs, malicious code. Pause all work until verdict is ✅ allow.                                         | The change adds no dependencies and pulls in no external code                                     |
| `unit-test-writer`          | Before `opsx:apply` (TDD)                                            | Writes tests from specs before implementation so tests drive the diff                                                                                                                      | The change produces no testable units — pure config, routing constants, styling-only tweaks, docs |
| `react-frontend-specialist` | During `opsx:apply`                                                  | Implements UI components, layouts, state, API integration, bug fixes, refactoring, accessibility                                                                                           | The change has no UI surface (e.g., pure config)                                                  |
| `code-reviewer`             | After `opsx:apply`, before `opsx:verify`                             | Reviews the diff for quality, correctness, security, and best practices                                                                                                                    | Never skip                                                                                        |

**Canonical sequence (every change):**

```
[opsx:explore]                    (OPTIONAL — when scope/design is open-ended; read-only, no artifacts)
  → requirements-analyst         (read specs FIRST, then clarify requirements with the user)
  → opsx:propose                 (generate artifacts from clarified requirements)
  → security-reviewer            (if yarn add / external code — ⛔ BLOCKS until safe)
  → unit-test-writer             (if testable units; tests land first)
  ⏸ WAIT — present findings, wait for user to trigger apply
  → opsx:apply via react-frontend-specialist   (user-triggered only)
  → code-reviewer                (address findings before continuing)
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

**Calendar** — month/day/week views with time grids, add/edit/delete events, confirmation modal, image upload, participants input, popover viewport clamping, guest avatar row, today highlight, paginated event sidebar, AddEventModal viewport-bound height (`max-height: 90vh`) with sticky header + sticky footer (theme-aware `var(--color-border)` dividers) and scrollable body so action buttons stay reachable on short viewports; Day/Week time-grid event overlays carry `pointer-events: none` (children opt back in with `pointer-events: auto`) so empty-slot clicks reach the underlying `onTimeSlotClick` handlers; timed event block titles wrap multi-line with `-webkit-line-clamp` set per-block via inline style from a shared `calculateTitleLineClamp(heightPercent)` helper in `calendarUtils.ts` (constants tied to SCSS at `.timedEventTitle` font/line-height + `.timedEventBlock` padding + grid `min-height` 1440px), so taller blocks show more lines and the last visible line ends with "…" when the title was truncated; month-view `.eventBar` and all-day `.allDayEventBar` use `display: block + line-height: <height>px` (not flex) so `text-overflow: ellipsis` triggers on direct text nodes, with `min-width: 0; max-width: 100%` on `.allDayEventBar` AND `min-width: 0` on its `.allDayContent` flex parent to break the `min-width: auto` chain in Day view; new `calendar-month-view` capability spec home for month-grid behavior (was previously specified only in archived `2026-04-14-calendar-page`); dark/forest contrast fixes — `.datePickerLabel` drops `color: inherit` so the JSX-supplied `text-primary` (`var(--color-text-primary)`) applies cleanly per theme; `.outOfMonth` keeps its light-mode pale-blue stripe but adds nested `[data-theme="dark"] &` and `[data-theme="forest"] &` overrides using `rgba(255, 255, 255, 0.04)` so day numbers stay the highest-contrast element on dark surfaces; Week view all-day strip stacks overlapping events into vertical rows via greedy row-packing helper `packAllDayRows` in `calendarUtils.ts` (transposed sibling of `groupOverlappingEvents`; sort key `(startCol asc, span desc, event.id asc)`; greedy strict-less `endCol < startCol` check; pure / deterministic / unbounded — no row cap, no "+N more"); each bar gets `top: ${rowIdx * 24}px` inline at the WeekView render site (24px = `.allDayEventBar` 22px height + `.allDayContent` 2px gap, documented in a SCSS-binding comment above the helper); `.weekAllDayGrid` carries inline `minHeight: ${rowCount * 24 + 4}px` (the +4 covers 2px top + 2px bottom padding) and the SCSS floor was relaxed `28px → 24px` so the inline value always wins; n=1 case stays byte-identical (rowIdx 0 → top 0px, minHeight 28px); auto-scroll-to-current-time is structurally insulated because `[data-hour]` lookup runs inside `timeGridScroll`, a sibling of `.weekAllDayRow`, so growing the strip shifts the scroll container down but doesn't change scroll-target offsets within it; Day view extends the same pattern — `dayAllDaySpans = events.map(ev => ({ event: ev, startCol: 0, span: 1 }))` piped through `packAllDayRows` (algorithm degenerates to "every event takes the next free row" since all spans tie on startCol/span and fall to the `event.id asc` tiebreaker); `.allDayContent` switched from `display: flex; flex-wrap: wrap; gap: 2px` to `position: relative` so absolutely-positioned bars use it as the containing block; `.allDayContent` carries inline `minHeight: ${rowCount * 24 + 4}px`; `.allDayRow`'s outer `min-height: 40px` floor is unchanged so empty + n=1 rendering is visually identical to before (the bar's y-offset within the row may shift a few pixels because absolute `top: 0` anchors to the content-box top instead of the prior flex-flow centerline, indistinguishable in practice); 2px stride gap is now implicit (no class carries `gap: 2px` anymore — bars are 22px tall, stacked at 24px → visual gap is 2px regardless), so the binding comment above `packAllDayRows` documents this as `.allDayEventBar { height: 22px }` + 2px inter-row gap rather than naming a specific `gap` rule

**Todo** — per-card row layout, starred yellow background, completed row styling (checkbox, strikethrough, star/delete on every row), forest-theme warning-light override

**Contact** — 3-col card grid, avatar photos, Message button navigates to Inbox, Add New Contact form page (photo upload, 6-field form, validation)

**Team** — 3-col card grid, avatar photos, Add New Member form page, shared AddPersonForm component extracted from Contact/Team

**Inbox** — two-panel layout, folder sidebar, message list with search/pagination, chat view, label dropdown, star-toggle with Starred folder, bin folder (soft-delete/restore/bulk-delete), select-all checkbox, compose view (removed redundant Cancel and Save as Draft buttons), spam folder (14 pre-seeded mock spam, per-row/bulk Not Spam restore, move-to-spam from inbox/starred/sent, SpammedMessage type with source folder restore, dual-path Not Spam handler, dynamic inbox/spam sidebar counts, ChatView Not Spam + Archive buttons on spam)

**Invoice** — sender/recipient header, items table, total, Print/Send buttons

**Settings** — general settings form (logo upload with drag & drop, 5-field form, validation, save with toast), required field asterisks across pages

**Manage Account** — user-scoped profile page at `/manage-account` reachable only via the TopNav UserMenu's "Manage Account" item (which now navigates instead of firing the legacy "Coming Soon" toast — Change Password and Activity Log remain placeholders); page mirrors Settings idiom (drag-drop circular avatar uploader at top → 2-col card body → centered Save button) with editable Display Name (required, trimmed, 1–60 chars) + Phone (optional, no format check) + Bio (optional, soft cap 200 with live `n / 200` counter and hard submit-block over cap), read-only Email + Role rendered as `<input readOnly>` (proper form semantics + label/htmlFor linkage), and a "Member since {formatted createdAt}" line; avatar persisted as a 2 MB-capped data URL via `FileReader.readAsDataURL` (NOT `URL.createObjectURL` like Settings — survives reload) with the same MIME whitelist (`png/jpeg/gif/svg+xml/webp`), input value cleared after each select so re-uploading the same file fires `change` again, and `alt` falls back to `""` rather than the page title when the display name is empty; persistence flows through a new `updateStoredUser(patch: Partial<User>): boolean` helper in `src/services/auth.ts` that detects whether the existing `auth_user` record lives in localStorage or sessionStorage (respecting `rememberMe`), merges the patch, writes back to the same storage with try/catch around `setItem` so quota errors return `false`, and dispatches `window.dispatchEvent(new CustomEvent("auth-user-changed"))` only on successful writes (login's `storeUser` is unchanged — no event on login); `User` type extended with `phone?` + `bio?` (`getStoredUser()` return type widened from `{name,email,role}` to `User | null`); save flow uses `setTimeout(...,800)` simulated delay matching Settings precedent, then a top-right toast (3 s auto-dismiss) keyed via the new `manageAccount` i18n namespace (registered in `i18n.ts` → 18 namespaces total, en + jp parity at 22 keys); date locale maps `i18n.language === "jp" ? "ja" : i18n.language` for `Intl.DateTimeFormat` BCP47 compatibility; bio textarea `aria-describedby` references both `"bio-error bio-counter"` over cap so screen readers keep the live count context

**UI Elements** — charts gallery page at `/ui-elements` (Layers icon header, Filter By Charts dropdown, 3 sections × 4 chart variants each: Bar / Pie / Donut), per-theme palettes, plural rename (`UI_ELEMENT` → `UI_ELEMENTS`), `uiElements` i18n namespace, custom `ChartTooltip`; chart-shells refactor extracts shared `BarShell`, `PieShell` (optional `innerRadius`), and `ChartSection` so each variant collapses to a config-only declaration; FilterByDropdown active-option contrast fix — `isActive ? bg-sidebar-menu-active text-sidebar-menu-active : text-primary hover-bg-muted` (the unconditional `text-primary` previously won the cascade over `text-sidebar-menu-active` because `.text-primary` is declared later in `src/index.css`, and unconditional `hover-bg-muted` overrode the active blue background on hover)

**Tables Gallery** — Tables showcase page at `/table` mirroring UiElements' shape (Table icon header, Filter By Tables dropdown with `all`/`basic`/`cellContent`/`statesAndInteraction`, 3 sections × 4 variants = 12 variant cards, 1-col/`lg:`-2-col responsive grid, local non-persisted filter state, page-lifted toast `useState<{text, variant: "success"} | null>` with `setTimeout` cleanup); `tables` i18n namespace (en + jp, 35 keys with parity); shared `Section` + `VariantCard` shells local to `src/pages/Table/components/` (`VariantCard` accepts an optional `title` and renders no `<h3>` when omitted); FilterByDropdown copied with the same active-contrast fix; mock data English-only in `src/pages/Table/mockData.ts` (4 generic rows, 5 users, 5 orders, 5 products-with-colors, 5 products-with-actions, 25 paginated rows, 4 clickable rows); the same FilterByDropdown contrast fix backported to UiElements; post-archive refinements — Loading variant uses `data={[]}` so the variant card collapses to the empty-state height (centered spinner instead of floating above hidden rows), AND renders WITHOUT a variant subtitle (a top-left "Loading" h3 conflicts visually with the centered spinner overlay; the card's bordered shell still bounds the variant in the 2×2 grid)

**Shared Components** — `TableCommon` extended with three optional boolean visual modifier props (`striped` / `bordered` / `compact`, all default `false`, applied as CSS modifier classes on `<table>`): `.striped` reuses `--color-table-row-hover-secondary` (hover wins via cascade); `.bordered` adds `1px solid var(--color-border)` to outer + every `<th>`/`<td>` (container's existing `overflow: hidden` preserves rounded corners); `.compact` halves vertical cell padding only (`--spacing-2` instead of `--spacing-4`, horizontal unchanged); modifiers are combinable and theme-aware; `ColorDots` promoted from inline helper in `ProductStock` to shared `src/components/ColorDots/index.tsx` (used by both `ProductStock` and the Tables gallery's With Color Dots variant)

**TopNav** — user profile dropdown menu, language switcher dropdown, notification dropdown, 3-way dropdown coordination, toast system; user-profile avatar now prefers `getStoredUser()?.avatar` (the data URL stored by Manage Account) and falls back to the existing `ui-avatars.com` initials URL only when the avatar field is empty/missing; subscribes to the `auth-user-changed` `CustomEvent` on `window` via a `useState<User | null>` mirror updated synchronously inside the listener (the originally-prescribed `useReducer` bump pattern was defeated by React Compiler memoization — see archived `manage-account-page` design.md §2 for the full deviation note; the `useState`-mirror form is the recommended pattern for any future event-driven re-render in this React Compiler-enabled project), with paired `removeEventListener` cleanup on unmount, so name/avatar updates from Manage Account propagate to the header in the same tab without a route navigation

**i18n** — Korean language added then removed (net: en/jp only); `uiElements`, `tables`, and `manageAccount` namespaces added (19 registered total)

**Products** — Products listing card grid with promotional banner carousel, ProductCard with `<Link>`-wrapped body for card-click navigation (heart + Edit are non-propagating sibling controls), ProductDetail read-only page at `/products/:id` (breadcrumb / hero gallery / specs section / about section / not-found empty state), Edit control rendered as `<Link>` for native open-in-new-tab, ProductDetail Wishlist toggle is icon-only and rendered as a top-right gallery-corner overlay (32×32 circular shell mirroring `.galleryArrow`'s pattern with dark/forest theme overrides; `aria-label` + `title` from existing i18n keys; inset focus ring via `outline-offset: -2px` to survive the gallery's `overflow: hidden`); ProductCard wishlist toggle remains an action-bar button with icon + label, ProductStock admin page, Favorites filtered listing, WishlistContext (Set in memory, Array in localStorage), `useProduct(id)` React Query hook, extended `Product` type with optional detail fields (description / longDescription / category / sku / stock / status), `dashboard.products.detail.*` i18n keys (en + jp) including shared gallery a11y keys; Edit button contrast fix — ProductCard uses Tailwind `!text-on-primary` and ProductDetail's `.actionButtonPrimary:hover` restates `color: var(--color-white)` to defeat the unlayered global `a:hover { color: var(--color-primary-600) }` rule (different idiom per styling layer; same root cause); ProductStock action buttons fully wired — Edit navigates to `/products/:id/edit` (re-purposes the placeholder route to operate on ProductStock data, naming smell accepted per design), Delete opens shared `ConfirmModal` (promoted from `src/pages/Calendar/` to `src/components/ConfirmModal/`) → optimistic delete via new `useProductStock` hook (read + delete + update with `onMutate` snapshot/rollback per the `useTodos` pattern) → success/error toast (local `useState` `{ text, variant }` pattern, success-green/error-red, `aria-live="polite"`) → page-clamp effect drops `currentPage` whenever the active page goes empty (covers both "deleted last row on last page" and search-filter-narrowed-empty cases); EditProduct page rebuilt from placeholder into a real form (drag-drop image upload via HTML5 File API → data URL with 2 MB size guard + MIME type guard + `FileReader.onerror`; labelled name/category/price/amount inputs with `valueAsNumber` NaN-fallback; colors editor with add/remove rows, hex normalized to uppercase to match seed data; minimum-validation surfaces `aria-invalid` + `aria-describedby` inline messages; Save → optimistic update + toast + 600ms-then-navigate via cleanup-tracked `navigateTimerRef`; Cancel → `navigate("/product-stock")`; not-found state when `:id` does not resolve); persistence: `productStockService` extended with `updateProduct(id, patch)` and schema-versioned localStorage write-through (`{ version: 1, data: ProductStock[] }` under key `"dashstack-product-stock"`; missing/malformed/version-mismatch falls back to seed and re-writes)

**Shared UI** — TableCommon, StatusBadge, Buttons

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
- **Branch naming**: use `bugfix/<kebab-name>` for fixes, `feature/<kebab-name>` for new capabilities; the suffix usually matches the OpenSpec change name
