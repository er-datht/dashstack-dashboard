# Dashstack React Dashboard

A modern, production-ready React 19 + TypeScript dashboard built with Vite, Tailwind CSS 4, SCSS Modules, React Router v7, React Query, and i18next. Includes a fully structured layout, theming, lazy loaded routes, internationalization, API service abstractions, and optimistic UI updates.

## Features

- ⚡ Vite 7 for fast HMR, TS build integration
- ⚛ React 19 with React Compiler (experimental performance optimizations)
- 🧠 React Query (data fetching, caching, optimistic updates)
- 🌐 i18next internationalization (English + Japanese) with language detection
- 🧭 React Router v7 with code-split lazy routes
- 🌓 Multi-theme support (Light / Dark / Forest) with system preference detection
- 🎨 Tailwind CSS 4 + SCSS Modules (utility + component scope styling)
- 🧩 Modular architecture (services, hooks, types, contexts)
- 📦 API abstraction layer (`src/services/api.ts`)
- ✅ ESLint + TypeScript + recommended configs
- 📊 Example chart (Recharts) + dashboard widgets
- ⭐ Todos module with optimistic mutations

## Tech Stack

React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, SCSS Modules, React Router v7, React Query, i18next, Lucide Icons, Recharts.

## Project Structure

```
src/
├── assets/              # Static assets + global styles (SCSS)
├── components/          # Reusable UI pieces (Sidebar, TopNav, Charts, etc.)
├── configs/             # App level config (api, app-config)
├── constants/           # Static values / environment helpers
├── contexts/            # React contexts (ThemeContext)
├── hoc/                 # Higher-order components (withAuth)
├── hooks/               # Custom hooks (useTheme, useTodos, useDeals, useReactQuery)
├── layouts/             # Layout wrappers (DashboardLayout)
├── pages/               # Route pages (Dashboard, Products, Todo, ...)
├── routes/              # Centralized routing (`AppRoutes.tsx`, `routes.ts`)
├── services/            # API & domain service layers (api, todos, deals)
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
| `/orders`        | Orders management                  |
| `/product-stock` | Inventory / stock view             |
| `/pricing`       | Pricing tables                     |
| `/calendar`      | Calendar page                      |
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

### Installation & Scripts (npm)

```bash
# Install deps
npm install

# Dev server
npm run dev

# Type check + build
npm run build

# Preview production build
npm run preview

# Lint all sources
npm run lint
```

### Installation & Scripts (Yarn)

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
Translation namespaces: common, navigation, auth, dashboard, products, orders, settings, todo, theme, errors, messages.
Add a new namespace: add JSON file under `public/locales/<lng>/<namespace>.json` and extend `ns` array in `i18n.ts` if needed.

## Theming

Multi-theme support with three built-in themes: Light, Dark, and Forest. Themes are managed via `ThemeContext` and applied using data attributes (`data-theme`). Theme preference is saved in localStorage and system preference is detected on initial load.

**Usage:**

```tsx
import { useTheme } from "@/hooks/useTheme";

function MyComponent() {
  const { theme, setTheme, cycleTheme } = useTheme();

  return <button onClick={() => setTheme("dark")}>Switch to Dark</button>;
}
```

**Available themes:** `light`, `dark`, `forest`

**Theme switching:** Use the `ThemeSwitcher` component in the sidebar or call `cycleTheme()` to rotate through available themes.

## Data Fetching (React Query)

Custom wrapper: `src/hooks/useReactQuery.ts` exports pre-bound `useQuery`, `useMutation`, `useQueryClient` with sensible defaults.

**Example domain hooks:**

- `useTodos.ts` - Fetch, create, update, delete todos with optimistic cache updates and error rollback
- `useDeals.ts` - Fetch deals data for revenue charts and deal details tables

Devtools available via `@tanstack/react-query-devtools` (add `<ReactQueryDevtools />` to your root if desired).

## Domain Modules

### Todos Module

Service: `src/services/todos.ts` (maps external API shape to internal `TodoItem`).
Optimistic updates: implemented in mutations inside `useTodos.ts` (cache update, rollback on error).

**Usage:**

```tsx
const { todos, addTodo, updateTodo, deleteTodo } = useTodos();
```

### Deals Module

Service: `src/services/deals.ts` (fetches deal data from API).
Hook: `src/hooks/useDeals.ts` provides access to deals data with React Query caching.

**Usage:**

```tsx
const { deals, isLoading, error } = useDeals();
```

Components using deals data:

- `RevenueChart` - Visualizes revenue over time
- `DealDetailsTable` - Displays detailed deal information with status badges

## API Layer

Generic fetch abstraction: `src/services/api.ts` (`apiService.get/post/put/patch/delete`).

**Existing domain services:**

- `todos.ts` - Todo CRUD operations
- `deals.ts` - Deal data fetching

**Extending:** Add domain-specific service modules (e.g. `products.ts`, `orders.ts`). Handle transformation from API DTOs to internal types for consistency. Create corresponding hooks in `src/hooks/` for React Query integration.

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

Config: `eslint.config.js`. Recommended to upgrade to type-aware configs (see section below). For stricter React rules, optionally install:

```bash
npm install eslint-plugin-react-x eslint-plugin-react-dom -D
```

Configuration example (type-aware + React rules) shown in README earlier.

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

## Contributing

1. Fork + create feature branch: `git checkout -b feature/my-change`
2. Install deps & run `npm run dev` or `yarn dev`
3. Ensure lint passes: `npm run lint` or `yarn lint`
4. Open PR with clear description.

## License

Add a license file (MIT recommended). Update this section accordingly.

## Acknowledgements

- JSONPlaceholder (sample API)
- React & Vite teams

---

For questions or improvements, open an issue. Enjoy building.
