# Dashstack React Dashboard

A modern, production-ready React 19 + TypeScript dashboard built with Vite, Tailwind CSS 4, SCSS Modules, React Router v7, React Query, and i18next. Includes a fully structured layout, theming, lazy loaded routes, internationalization, API service abstractions, and optimistic UI updates.

## Features

- ⚡ Vite 7 for fast HMR, TS build integration
- ⚛ React 19 with React Compiler (experimental performance optimizations)
- 🧠 React Query (data fetching, caching, optimistic updates)
- 🌐 i18next internationalization (English, Japanese) with language detection
- 🧭 React Router v7 with code-split lazy routes
- 🌓 Multi-theme support (Light / Dark / Forest) with system preference detection
- 🎨 Tailwind CSS 4 + SCSS Modules (utility + component scope styling)
- 🧩 Modular architecture (services, hooks, types, contexts)
- 📦 API abstraction layer (`src/services/api.ts`)
- ✅ ESLint + TypeScript + recommended configs
- 📊 Example chart (Recharts) + dashboard widgets
- ⭐ Todos module with optimistic mutations

## Tech Stack

React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, SCSS Modules, React Router v7, React Query, i18next (en/jp), Lucide Icons, Recharts.

## Project Structure

```
src/
├── assets/              # Static assets + global styles (SCSS)
├── components/          # Reusable UI pieces (Sidebar, TopNav, Charts, etc.)
├── configs/             # App level config (api, app-config)
├── constants/           # Static values / environment helpers
├── contexts/            # React contexts (ThemeContext, WishlistContext)
├── hoc/                 # Higher-order components (withAuth)
├── hooks/               # Custom hooks (useTheme, useTodos, useDeals, useProducts, useBanners, useReactQuery)
├── layouts/             # Layout wrappers (DashboardLayout)
├── pages/               # Route pages (Dashboard, Products, Todo, ...)
├── routes/              # Centralized routing (`AppRoutes.tsx`, `routes.ts`)
├── services/            # API & domain service layers (api, todos, deals, products, productStock)
├── types/               # TypeScript type definitions per domain
└── utils/               # Small pure utility helpers (formatters, cn)
```

## Available Pages / Routes

| Route            | Description                        |
| ---------------- | ---------------------------------- |
| `/dashboard`     | Main dashboard overview            |
| `/products`      | Products listing UI                |
| `/favorites`     | Favorites module                   |
| `/inbox`         | Inbox / messaging placeholder      |
| `/orders`        | Order list with status management   |
| `/product-stock` | Inventory / stock view             |
| `/pricing`       | Pricing tables                     |
| `/calendar`      | Calendar with event CRUD & popover  |
| `/todo`          | Todos CRUD with optimistic updates |
| `/contact`       | Contact form page                  |
| `/invoice`       | Invoice layout example             |
| `/ui-element`    | UI elements showcase               |
| `/team`          | Team members listing               |
| `/table`         | Generic data table page            |
| `/settings`      | User / app settings                |
| `/login`         | Auth entry point (public)          |

Route constants: `src/routes/routes.ts` • Configuration + lazy loading: `src/routes/AppRoutes.tsx`.

## Getting Started

### Prerequisites

Node.js 18+ (LTS recommended).

### Installation & Scripts

This project uses **Yarn** as its package manager (yarn.lock is tracked).

```bash
# Install deps
yarn

# Dev server
yarn dev

# Type check + build
yarn build

# Preview production build
yarn preview

# Lint all sources
yarn lint
```

## Environment Setup

Configure runtime values via `.env` files (e.g. API base URL) without listing actual secrets or endpoints here. Reference patterns in `src/constants/environment.ts` and access them with `import.meta.env`.

### Create your local .env file

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and provide the required values (leave empty only if intentionally unused).
3. Restart the dev server if it was running so Vite reloads env variables.
4. Never commit your populated `.env` (the example remains tracked).

`.env.example` documents required keys; keep it updated when introducing new env variables.

## Internationalization (i18n)

Configuration: `i18n.ts` (language detector + HTTP backend loading from `public/locales`).
Supported languages: `en`, `jp`.
Switching UI: `LanguageSwitcher` component.
Translation namespaces: common, navigation, auth, calendar, dashboard, products, orders, settings, todo, theme, errors, messages, pricing, favorites.
Add a new namespace: add JSON file under `public/locales/<lng>/<namespace>.json` and extend `ns` array in `i18n.ts` if needed.

## Theming

DashStack features a comprehensive multi-theme design system with three built-in themes: **Light**, **Dark**, and **Forest**. The theming architecture combines SCSS variables with CSS custom properties for maximum flexibility and performance.

### Quick Start

**Switch themes programmatically:**

```tsx
import { useTheme } from "./hooks/useTheme";

function MyComponent() {
  const { theme, setTheme, cycleTheme } = useTheme();

  return (
    <div>
      <button onClick={() => setTheme("dark")}>Dark Mode</button>
      <button onClick={cycleTheme}>Next Theme</button>
    </div>
  );
}
```

### Supported Themes

| Theme               | Description                    | Primary Color     |
| ------------------- | ------------------------------ | ----------------- |
| **Light** (default) | Clean, bright interface        | Blue (#4880FF)    |
| **Dark**            | Modern dark mode for low-light | Blue (#4880FF)    |
| **Forest**          | Nature-inspired green palette  | Emerald (#059669) |

### Theme Features

- **Automatic system preference detection** - Detects OS dark/light mode preference
- **localStorage persistence** - Theme selection persists across sessions
- **Instant switching** - CSS variables enable theme changes without page reload
- **Type-safe** - Full TypeScript support for theme types
- **Dual-token system** - SCSS variables + CSS custom properties

### Using Theme-Aware Styles

**Method 1: Tailwind Utility Classes (Recommended)**

```tsx
<div className="bg-surface text-primary border border-gray-200">
  <h3 className="text-lg font-semibold">Theme-aware card</h3>
</div>
```

Available theme-aware classes:

- `.bg-surface` - Card/panel background (auto-adjusts per theme)
- `.text-primary` - Main text color
- `.text-secondary` - Muted text color
- `.card` - Complete card styling with theme support

**Method 2: CSS Custom Properties**

```tsx
<div
  style={{
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-primary)",
    padding: "var(--spacing-4)",
    borderRadius: "var(--border-radius-lg)",
  }}
>
  Dynamic theme-aware styles
</div>
```

**Method 3: SCSS Modules**

```scss
@use "../../assets/styles/variables" as *;
@use "../../assets/styles/mixins" as *;

.container {
  @include surface; // Theme-aware surface styling
  @include theme-aware(border-color, color("gray", 200), color("gray", 700));
  padding: spacing(4);
}
```

### Design Tokens

The theme system provides a comprehensive set of design tokens:

**Colors**: Primary, semantic (success/warning/error/info), grayscale, theme-adaptive tokens
**Spacing**: 8-point grid system (4px base unit) from `spacing(1)` to `spacing(32)`
**Typography**: Font sizes (xs-5xl), weights (400-700), line heights
**Shadows**: Auto-adjusting shadows (sm, base, md, lg, xl, 2xl) optimized for dark themes
**Border Radius**: From `border-radius("sm")` to `border-radius("full")`
**Transitions**: Consistent timing (fast: 150ms, base: 200ms, slow: 300ms)

### SCSS Mixins

Powerful mixins for theme-aware components:

```scss
@include flex-center; // Center content
@include surface; // Theme-aware surface styling
@include transition(opacity transform); // Smooth transitions
@include breakpoint(md) {
} // Responsive breakpoints
@include theme-aware($prop, $light, $dark); // Theme-specific values
@include hover {
} // Hover-capable devices only
@include focus-ring(); // Accessible focus states
```

### Adding a New Theme

1. Update theme type in `src/contexts/ThemeContext.tsx`:

```tsx
export type Theme = "light" | "dark" | "forest" | "ocean";
```

2. Define theme tokens in `src/index.css`:

```css
[data-theme="ocean"] {
  --color-primary-600: #0ea5e9;
  --color-text-primary: #0f172a;
  --color-bg-primary: #f0f9ff;
  /* ... other tokens */
}
```

3. Add translations in `public/locales/*/theme.json`

### Complete Documentation

For comprehensive theme system documentation including all design tokens, implementation patterns, and best practices, see **[themeSystem.md](./themeSystem.md)**.

**Topics covered:**

- Complete design token reference (colors, spacing, typography, shadows)
- Theme implementation guide
- SCSS mixins and utilities reference
- Component theming patterns with examples
- Best practices and troubleshooting
- Migration checklist for adding theme support to components

## Data Fetching (React Query)

Custom wrapper: `src/hooks/useReactQuery.ts` exports pre-bound `useQuery`, `useMutation`, `useQueryClient` with sensible defaults.

**Domain hooks:**

- `useTodos.ts` - Fetch, create, update, delete todos with optimistic cache updates and error rollback
- `useDeals.ts` - Fetch deals data for revenue charts and deal details tables
- `useProducts.ts` - Product data operations
- `useBanners.ts` - Promotional banner data

Devtools enabled via `<ReactQueryDevtools />` in `App.tsx`.

## API Layer

Generic fetch abstraction: `src/services/api.ts` (`apiService.get/post/put/patch/delete`).

**Domain services:**

- `todos.ts` - Todo CRUD operations
- `deals.ts` - Deal data fetching
- `products.ts` - Product operations
- `productStock.ts` - Product stock/inventory data

**Extending:** Add domain-specific service modules following the same pattern. Handle transformation from API DTOs to internal types for consistency. Create corresponding hooks in `src/hooks/` for React Query integration.

## Adding a New Page

1. Create folder under `src/pages/NewPage/index.tsx`.
2. Export component as default.
3. Add lazy import + `<Route path="new-page" element={<NewPage />} />` in `AppRoutes.tsx` inside the Dashboard layout route.
4. Add navigation item in `src/components/Sidebar/navigationData.ts`.

## Styling

- Global SCSS: `src/assets/styles/main.scss` + partials (`_variables.scss`, `_mixins.scss`, `_globals.scss`).
- Tailwind utilities for layout & responsive behavior.
- Component styles via `*.module.scss` co-located with components.

## Icons

Using Lucide React (`lucide-react`). Import individual icons for tree-shaking:

```tsx
import { Home, Settings } from "lucide-react";
```

## ESLint & TypeScript

Config: `eslint.config.js` (flat config). Plugins: TypeScript ESLint, React Hooks, React Refresh. For stricter React rules, optionally install:

```bash
yarn add -D eslint-plugin-react-x eslint-plugin-react-dom
```

## React Compiler

Enabled via Babel plugin in `vite.config.ts`:

```ts
react({
  babel: { plugins: [["babel-plugin-react-compiler"]] },
});
```

Provides runtime optimizations; may incur slightly slower builds.

## Internationalization Example

```tsx
import { useTranslation } from "react-i18next";
const { t } = useTranslation("dashboard");
return <h1>{t("title")}</h1>;
```

## Formatting & Utilities

- `utils/formatters.ts` for number/date formatting.
- `utils/cn.ts` for conditional classNames composition.

## Folder Naming Consistency

Note: Use `configs/` (plural) as per actual directory for configuration modules.

## Performance Practices

- All pages lazy loaded (code-splitting by route).
- React Compiler for optimized rendering.
- Optimistic React Query mutations reduce perceived latency.
- Minimal global state; domain state via server cache.

## Future Enhancements (Ideas)

- Auth integration (JWT / OAuth provider).
- Role-based route guards.
- Persisted React Query cache.
- E2E tests (Playwright / Cypress).
- Component testing (Vitest + Testing Library).
- Accessibility audit.
- Data export (CSV / XLSX) from tables.
- Real backend integration for deals & products.

## Development Workflow (OpenSpec + Agent Pipeline)

This project uses a spec-driven development workflow powered by [OpenSpec](https://github.com/Fission-AI/OpenSpec) and Claude Code subagents. Every code change follows: **propose** → **review** → **apply** → **archive**.

- **[WORKFLOW-SETUP-GUIDE.md](./WORKFLOW-SETUP-GUIDE.md)** — Full step-by-step setup guide for any project
- **[QUICK-WORKFLOW-SETUP.md](./QUICK-WORKFLOW-SETUP.md)** — 10-minute quick setup version

OpenSpec specs and change history live in the `openspec/` directory.

## Contributing

1. Fork + create feature branch: `git checkout -b feature/my-change`
2. Install deps & run `yarn dev`
3. Ensure lint passes: `yarn lint`
4. Open PR with clear description.

## License

Add a license file (MIT recommended). Update this section accordingly.

## Acknowledgements

- JSONPlaceholder (sample API)
- React & Vite teams

---

For questions or improvements, open an issue. Enjoy building.
