# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DashStack is a React 19 + TypeScript dashboard application built with Vite 7, featuring multi-theme support (light/dark/forest), internationalization (en/jp/ko), and a hybrid styling approach combining Tailwind CSS v4 with SCSS modules.

## Development Commands

```bash
yarn dev        # Start development server with HMR
yarn build      # TypeScript compile + Vite build
yarn lint       # ESLint (flat config)
yarn preview    # Preview production build
```

**Package Manager**: Use **Yarn** exclusively (NOT npm).

**No test framework is configured.** There are no test files in the codebase.

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

i18next + react-i18next. Config at **project root** `i18n.ts` (not in `src/`). Translation files at `public/locales/{en|jp|ko}/{namespace}.json`. Registered namespaces in `i18n.ts`: common, navigation, auth, dashboard, products, orders, settings, todo, theme, errors, messages. Additional locale files exist for: pricing, favorites (loaded on-demand by components). All UI text should use the `t()` function.

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

### Auto-Trigger Rules

**MANDATORY**: When the user prompts with ANY action that implies a code change — including but not limited to "implement", "fix", "handle", "build", "add", "create", "update", "refactor", "resolve", "change", "remove", "delete", "move", "rename", "optimize", "improve" — you MUST follow this workflow automatically:

1. **Context first** — Before anything else, review existing specs (`openspec/specs/`) and archived changes (`openspec/changes/archive/`) relevant to the area being changed. Summarize findings (data models, component contracts, patterns, edge cases, prior decisions) to inform the proposal. Also check active changes (`openspec/changes/`) for overlap.
2. **Propose** — Invoke the `opsx:propose` skill with the user's description plus context findings to generate proposal, design, specs, and tasks before writing any code.
3. **Review proposal** — Launch the `proposal-reviewer` subagent to validate artifacts, identify gaps, ask clarifying questions, and refine the proposal before implementation.
4. **STOP and wait for user** — After the proposal review completes, present a summary of the artifacts (proposal, design, specs, tasks) and **stop**. Do NOT proceed to implementation automatically. Tell the user: "Run `/opsx:apply` when you're ready to implement." The user must explicitly type `/opsx:apply` to start the apply phase. This gives the user a chance to review, adjust, or reject the proposal before any code is written.
5. **Apply with agent pipeline** — Only when the user invokes `/opsx:apply`, implement tasks. During apply, you MUST use the specialized subagents defined below (see **Mandatory Subagent Usage**). Never implement tasks inline — always dispatch to the appropriate Agent.
6. **Archive when done** — Suggest `opsx:archive` once all tasks are complete. **When archiving, always update the "Existing specs" list in this file** — append a new numbered entry with the change name and a brief description.

**No exceptions for small changes.** Even trivial fixes (typos, renames, one-line changes) go through the full propose → apply → archive cycle.

**Only skip the workflow for non-code actions:**
- Pure questions or explanations ("what does X do?", "explain this code")
- Non-code tasks (git operations, running dev server, config lookups, reading files)
- When the user explicitly invokes a specific `/opsx:` command directly (follow that command instead)

### Mandatory Subagent Usage

During the **apply** phase, you MUST use the Agent tool with these specialized `subagent_type` values — do NOT implement code changes yourself:

1. **`proposal-reviewer`** (Proposal quality gate) — Launch AFTER `opsx:propose` completes. Reviews all artifacts for completeness, identifies gaps, asks the user clarifying questions, suggests improvements, and updates artifacts. Do not proceed to implementation until the reviewer confirms the proposal is ready.

2. **`react-frontend-specialist`** (Implementation) — Launch FIRST during apply for all code implementation tasks: UI components, layouts, state management, API integration, bug fixes, refactoring, accessibility, and any code writing. Provide the agent with full task context from the OpenSpec specs.

3. **`security-reviewer`** (Security gate) — Launch BEFORE any external trust action: installing packages (`yarn add`), fetching URLs, using web-searched code, or upgrading dependencies. Block implementation until verdict is `✅ allow` or user accepts `⚠️ ask`.

4. **`code-reviewer`** (Final quality gate) — Launch LAST after implementation is complete. Provide the agent with the diff or list of changed files for review. Do not consider the task done until code review passes.

**Sequencing rules:**
- Simple feature/fix: `proposal-reviewer` → `react-frontend-specialist` → `code-reviewer`
- Feature/fix needing new dependency: `proposal-reviewer` → `react-frontend-specialist` (plan) → `security-reviewer` → `react-frontend-specialist` (implement) → `code-reviewer`
- Dependency-only change: `proposal-reviewer` → `security-reviewer` → `code-reviewer`

**Never skip subagents.** Even for one-line changes, at minimum use `react-frontend-specialist` for implementation and `code-reviewer` for review.

All code changes follow the spec-driven workflow defined in `.claude/workflow.md`, which combines OpenSpec planning with agent-based execution.

**OpenSpec commands:**
- `/opsx:propose "description"` — Plan a change (proposal, design, specs, tasks)
- `/opsx:apply [change-name]` — Implement tasks from a change
- `/opsx:archive [change-name]` — Archive a completed change
- `/opsx:explore [topic]` — Think through ideas (read-only)

[OpenSpec](https://github.com/Fission-AI/OpenSpec) specs live in `openspec/`.

**Agent mapping for this project:**
- **Proposal reviewer** → `proposal-reviewer`
- **Implementation specialist** → `react-frontend-specialist`
- **Security reviewer** → `security-reviewer`
- **Code reviewer** → `code-reviewer`

**Existing specs** (archived in `openspec/changes/archive/`):
1. `core-architecture-build-system` — Vite 7 pipeline, React Compiler, TypeScript config, app bootstrap
2. `design-token-theme-system` — 3-tier styling, CSS/SCSS tokens, theme switching, SCSS mixins
3. `routing-navigation` — React Router v7, lazy loading, DashboardLayout, sidebar navigation
4. `data-layer-api-react-query` — Dual API clients, React Query config, domain services/hooks
5. `internationalization` — i18next config, namespaces, LanguageSwitcher
6. `dashboard-data-visualization` — Dashboard composition, recharts, DealDetailsTable
7. `product-management-features` — Products, Favorites, ProductStock, WishlistContext
8. `shared-ui-components-remaining-pages` — TableCommon, StatusBadge, Buttons, TopNav, Sidebar, remaining pages
9. `add-korean-language` — Korean (ko) language support: i18n config, LanguageSwitcher, 13 translation files
10. `calendar-page` — Calendar page: grid, events sidebar, month navigation
11. `calendar-add-event` — Add event modal with form fields and save flow
12. `calendar-edit-delete-event` — Edit/delete events via popover actions
13. `calendar-delete-confirm-modal` — Confirmation modal for event deletion
14. `calendar-modal-image-participants` — Image upload, participants input, popover image display, sidebar avatar
15. `fix-popover-viewport-overflow` — Popover viewport boundary clamping (top/bottom/left/right)
16. `popover-guests-avatar-row` — Horizontal avatar row for popover guests section

**Project notes:**
- Most tasks start with `react-frontend-specialist`
- Package recommendations from web search go through `security-reviewer` first
- Final sign-off goes through `code-reviewer`

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
