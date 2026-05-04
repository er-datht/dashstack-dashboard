## Why

The "UI Element" page in the sidebar currently routes to a placeholder card that says "Explore UI components and elements here." It is the only nav entry that does not deliver real content. The design calls for a charts gallery showcasing recharts variants (Bar, Pie, Donut) with a working "Filter By Charts" dropdown to scope visible sections — turning a dead placeholder into a useful reference for the chart styles available across the app, while also normalizing the page name to its plural form ("UI Elements") used in the design.

## What Changes

- **BREAKING**: Rename the route, component folder, sidebar entry, ROUTES key, and i18n nav label from singular `ui-element` / `UI Element` to plural `ui-elements` / `UI Elements`. All references must be updated atomically.
  - `ROUTES.UI_ELEMENT` → `ROUTES.UI_ELEMENTS` with value `/ui-elements`
  - `src/pages/UiElement/` → `src/pages/UiElements/`
  - Sidebar nav id `ui-element` → `ui-elements`, label key `navigation.uiElement` → `navigation.uiElements` (en + jp)
  - Lazy import + `<Route>` path in `AppRoutes.tsx`
- **Replace placeholder with real content**: implement the UI Elements page as a charts gallery with three sections (Bar Chart / Pie Chart / Donut Chart), each card holding 4 chart variants in a responsive row.
- **Add functional Filter By Charts dropdown** in the page header (top-right). Options: "Charts" (default — shows all sections), "Bar Chart", "Pie Chart", "Donut Chart". Selecting an option shows only the matching section.
- **Add new i18n namespace `uiElements`** registered in root `i18n.ts`, with `public/locales/en/uiElements.json` and `public/locales/jp/uiElements.json` for page title, filter label, filter options, and section titles.
- **Bar Chart card** with 4 variants: plain blue bars, 2-color stacked teal+cyan, grouped purple+orange pairs, 3-color stacked pink.
- **Pie Chart card** with 4 single-slice pies on a light track: blue / purple / orange / blue at varying proportions.
- **Donut Chart card** with 4 variants: single-color teal, single-color blue, 2-color yellow+teal, multi-color (orange/yellow/teal).
- **Theme-aware palettes** for light/dark/forest, following the existing `chart-components` pattern.
- **Responsive layout**: 4 variants per row on desktop → 2×2 on tablet → 1 per row on mobile. Sections stack vertically.
- **Hover tooltips** enabled (recharts default). No legends, no axis labels.

## Capabilities

### New Capabilities
- `ui-elements-page`: Charts gallery page at `/ui-elements` with Bar / Pie / Donut sections and a Filter By dropdown that toggles section visibility.

### Modified Capabilities
- `route-config`: `ROUTES.UI_ELEMENT` is renamed to `ROUTES.UI_ELEMENTS` (value `/ui-elements`); the lazy-loaded route changes from `ui-element` → `ui-elements` and points to `pages/UiElements`.
- `sidebar-navigation`: The PAGES section item id, label key, and route reference for the UI Elements entry are renamed from singular to plural.
- `i18n-config`: Adds `uiElements` to the registered namespace list (now 17 namespaces).
- `remaining-pages`: The "Remaining content pages" requirement is updated to list `UiElements` (plural) instead of the legacy singular `UiElement`.

## Impact

- **Code**:
  - `src/routes/routes.ts` — rename constant + value
  - `src/routes/AppRoutes.tsx` — rename lazy import + route path
  - `src/components/Sidebar/navigationData.ts` — rename id, label key, route reference
  - `src/pages/UiElement/` → `src/pages/UiElements/` — folder rename + full rewrite of `index.tsx`
  - New chart variant components under `src/pages/UiElements/components/` (or inlined per-section files)
  - `i18n.ts` — add `uiElements` to `ns` array
  - `public/locales/en/navigation.json` + `public/locales/jp/navigation.json` — rename `uiElement` key to `uiElements`, update value to plural
  - `public/locales/{en,jp}/uiElements.json` — new files
- **Dependencies**: none added. recharts is already installed and used.
- **Tests**: existing sidebar active-state tests may reference the singular id `ui-element`; update or remove. New tests for the UI Elements page (filter behavior, section visibility, render).
- **Bookmarks**: the previous `/ui-element` URL becomes invalid. Catch-all redirect already sends unknown routes to `/dashboard`, so bookmarked links land on the dashboard rather than 404.
- **Other pages**: no impact; this change is contained to the UI Elements route, sidebar entry, and i18n nav key.
