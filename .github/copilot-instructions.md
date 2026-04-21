# Copilot Instructions

This file provides guidance to GitHub Copilot when working with code in this repository.

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

i18next + react-i18next. Config at **project root** `i18n.ts` (not in `src/`). Translation files at `public/locales/{en|jp}/{namespace}.json`. Registered namespaces in `i18n.ts`: common, navigation, auth, dashboard, products, orders, settings, todo, theme, errors, messages. Additional locale files exist for: pricing, favorites (loaded on-demand by components). All UI text should use the `t()` function.

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

Match the process to the change. Use judgment, not a checklist.

**Small changes** (typos, renames, one-line fixes, simple styling tweaks):

- Use `opsx:propose` to create a brief proposal (can be minimal for obvious changes).
- Read the relevant code, make the change, verify it works (`yarn build`, `yarn test`).

**Medium changes** (new component, bug fix spanning multiple files, refactor):

- Review existing specs and code first to understand context.
- Use `opsx:propose` to plan the change. Review the proposal yourself.
- Implement and write tests where appropriate.

**Large changes** (new page, new feature, cross-cutting refactor):

- Full workflow: context review → `opsx:propose` → review proposal → implement → `opsx:verify` → `opsx:archive`.
- Use `opsx:verify` before archiving to validate implementation matches specs.
- Update the "Existing specs" list below when archiving.

### When to Use OpenSpec

Always use `opsx:propose` before implementing any change. The proposal scales to the change — a simple fix gets a brief proposal, a new feature gets a thorough one.

**OpenSpec commands** (invoke via `#opsx-{command}` in Copilot Chat):

- `#opsx-propose` — Plan a change (proposal, design, specs, tasks)
- `#opsx-apply` — Implement tasks from a change
- `#opsx-archive` — Archive a completed change
- `#opsx-explore` — Think through ideas (read-only)
- `#opsx-verify` — Verify implementation matches change artifacts
- `#opsx-ff` — Fast-forward: create all artifacts at once
- `#opsx-new` — Start a new change, step through artifacts one at a time
- `#opsx-continue` — Continue working on an existing change
- `#opsx-sync` — Sync delta specs to main specs
- `#opsx-onboard` — Guided tutorial walkthrough
- `#opsx-bulk-archive` — Archive multiple changes at once

[OpenSpec](https://github.com/Fission-AI/OpenSpec) specs live in `openspec/`.

### When Requirements Change Mid-Implementation

Requirements change — this is normal. The change directory (`openspec/changes/{change-name}/`) and all its artifacts must be preserved and updated in place. Never delete a change and start over unless the direction fundamentally changed.

**Before implementation starts**: Update existing artifacts in place.
**During implementation**: Pause, assess impact, update specs/tasks/design, continue.
**After implementation**: Small adjustment → edit directly; bigger rework → revise specs first.

**Key rule**: Always update artifacts to match the current truth.

### Archive Maintenance

When archive exceeds ~50 changes, sync all to main specs (`opsx:sync`), keep the 20 most recent archives, delete the rest. Git preserves the full history.

### Non-Code Actions (No Workflow Needed)

- Pure questions or explanations
- Git operations, running dev server, config lookups, reading files

**Existing specs** (archived in `openspec/changes/archive/`):

1. `core-architecture-build-system` — Vite 7 pipeline, React Compiler, TypeScript config, app bootstrap
2. `design-token-theme-system` — 3-tier styling, CSS/SCSS tokens, theme switching, SCSS mixins
3. `routing-navigation` — React Router v7, lazy loading, DashboardLayout, sidebar navigation
4. `data-layer-api-react-query` — Dual API clients, React Query config, domain services/hooks
5. `internationalization` — i18next config, namespaces, LanguageSwitcher
6. `dashboard-data-visualization` — Dashboard composition, recharts, DealDetailsTable
7. `product-management-features` — Products, Favorites, ProductStock, WishlistContext
8. `shared-ui-components-remaining-pages` — TableCommon, StatusBadge, Buttons, TopNav, Sidebar, remaining pages
9. `add-korean-language` — (Removed) Korean (ko) language support was added then removed
10. `calendar-page` — Calendar page: grid, events sidebar, month navigation
11. `calendar-add-event` — Add event modal with form fields and save flow
12. `calendar-edit-delete-event` — Edit/delete events via popover actions
13. `calendar-delete-confirm-modal` — Confirmation modal for event deletion
14. `calendar-modal-image-participants` — Image upload, participants input, popover image display
15. `fix-popover-viewport-overflow` — Popover viewport boundary clamping
16. `popover-guests-avatar-row` — Horizontal avatar row for popover guests
17. `setup-unit-testing` — Vitest + React Testing Library setup
18. `pin-package-versions` — Pin all dependency versions to exact
19. `remove-korean-language` — Removed Korean (ko) language support
20. `calendar-today-highlight` — Visual highlight for today's date
21. `calendar-day-week-views` — Day and Week views with 24-hour time grids
22. `sidebar-paginated-events` — Paginated event sidebar
23. `settings-page` — General Settings page
24. `settings-page-enhancements` — Drag & drop logo upload, placeholder text
25. `settings-logo-upload-toast` — Toast notification system
26. `user-menu-header` — User profile dropdown menu in TopNav
27. `update-language-dropdown` — Redesigned LanguageSwitcher
28. `notification-dropdown` — Notification dropdown panel in TopNav
29. `style-completed-todo-rows` — Completed-row styling (superseded)
30. `redesign-todo-row-cards` — Per-card row layout for Todo list
31. `starred-todo-yellow-background` — Yellow background for starred todos (superseded)
32. `simplify-completed-todo-styling` — Simplified completed todo styling
33. `contact-page` — Contact page with card grid
34. `contact-message-navigate-inbox` — Contact Message button navigation
35. `add-new-contact-page` — Add New Contact form page
36. `required-field-asterisks` — Red asterisk on required fields
37. `team-page` — Team page with card grid and Add New Member form
38. `refactor-add-person-form` — Shared AddPersonForm component
39. `invoice-page` — Invoice page with sender/recipient header, items table, total, Print/Send buttons, i18n

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
