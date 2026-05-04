## Context

The dashboard already has a chart-rendering toolbox: recharts is installed and used in `RevenueChart`/`SalesDetailsChart`, the existing `chart-components` spec defines per-theme palettes for light/dark/forest, and the `dashboard-composition` spec establishes the "page = stack of cards each containing a chart" pattern. The UI Elements page currently routes to a placeholder. This change replaces it with a charts gallery and renames the route from singular to plural.

Constraints:
- React 19 + React Compiler enabled — manual `useMemo`/`useCallback` are rare; theme palette lookups can be inline.
- Tailwind v4 + `card` utility class is theme-aware; no hardcoded card backgrounds.
- All UI text via `t()` (per `i18n-config` spec).
- All 3 themes (light/dark/forest) must render correctly.
- No path aliases — relative imports.
- `classnames` (not `clsx`) via the `cn()` helper.
- 17-namespace registration in root `i18n.ts` (currently 16; this change adds the 17th).

Stakeholders: end users browsing the chart gallery, developers using it as a recharts variant reference.

## Goals / Non-Goals

**Goals:**
- Deliver a 3-section charts gallery (Bar / Pie / Donut), each with 4 variants matching the screenshot.
- Provide a working Filter By Charts dropdown that scopes which sections render.
- Atomically rename `ui-element` → `ui-elements` across route, sidebar, i18n, and folder layout.
- Reuse the existing `chart-components` palette pattern: a `getXxxColors(theme)` lookup per chart type, returning saturated brand-style hues that read on every theme.
- Keep the page composable: each chart variant is its own small component so future variants are drop-in additions.
- Support tooltips on hover via recharts defaults; no legends, no axis labels.

**Non-Goals:**
- Line / Area / Scatter / Radar / Radial chart variants (out of scope; future change).
- Live data binding (gallery uses hard-coded mock data).
- Filter state persistence across reload (local `useState` only).
- A reusable `PageHeader` component extraction (continue with the existing inlined header pattern used by other pages).
- Loading/empty states (data is static, never loading).
- Backwards-compat redirect from `/ui-element` → `/ui-elements` (catch-all already lands on `/dashboard`).
- Accessibility beyond recharts defaults (no custom aria-labels for chart shapes — recharts handles tooltip a11y).

## Decisions

### 1. Folder layout: rename + nest variants

**Decision:** Rename `src/pages/UiElement/` → `src/pages/UiElements/`. Inside, structure as:

```
src/pages/UiElements/
  index.tsx                 # Page shell: header, filter dropdown, sections
  components/
    FilterByDropdown.tsx    # Funnel + label + dropdown trigger
    BarChartSection.tsx     # Card with 4 bar variants
    PieChartSection.tsx     # Card with 4 pie variants
    DonutChartSection.tsx   # Card with 4 donut variants
  charts/
    BarVariantPlain.tsx
    BarVariantStacked2.tsx
    BarVariantGrouped.tsx
    BarVariantStacked3.tsx
    PieVariantSingle.tsx    # Reused 4 times with different color/value
    DonutVariantSingle.tsx  # Reused for teal + blue donuts
    DonutVariantStacked2.tsx
    DonutVariantStacked3.tsx
  data/
    mockData.ts             # All hard-coded chart data
  palette.ts                # getBarColors(theme), getPieColors(theme), getDonutColors(theme)
  types.ts                  # FilterValue, ChartVariantId, etc.
```

**Rationale:** Mirrors the screenshot's 3-section layout 1:1, keeps each variant <50 lines, and isolates color logic in `palette.ts`. Alternatives considered: (a) one big `index.tsx` with all charts inline — rejected, becomes unmaintainable past 200 lines; (b) generic `<ChartVariant variant="..." />` dispatcher — rejected, the variants differ enough (stacked vs grouped vs single-slice) that switch-driven logic adds more friction than per-file components.

### 2. Filter dropdown shape and behavior

**Decision:** A single inline component `FilterByDropdown.tsx` rendered top-right of the page header.

```tsx
type FilterValue = "all" | "bar" | "pie" | "donut";
```

Pill structure: `<button>` with funnel icon (`Filter` from lucide-react) + "Filter By" label + bordered inner dropdown trigger showing the current selection + chevron. Click opens a menu of 4 options. Default = `"all"` (label "Charts"). Page renders only the section(s) matching the selected value; `"all"` renders all 3.

Component owns its own open/close state. The selected `FilterValue` is lifted to `UiElements/index.tsx` as `useState<FilterValue>("all")` and passed back via a callback prop.

**Rationale:** Mirrors the existing month-dropdown pattern in `RevenueChart` (button + onBlur close + dropdown menu) so users get a familiar interaction. Keeping the value lifted lets the page do the section-filtering rather than the dropdown.

Alternatives considered: react-select / headless-ui — rejected, adds a dependency for a simple 4-option dropdown; the codebase already has the homegrown pattern.

### 3. Chart library + recharts variant choices

**Decision:** All charts use `recharts` (already installed). Mapping:

- Bar variants → `BarChart` with `Bar` series. Plain = 1 series. Stacked = multiple `Bar` with `stackId="a"`. Grouped = multiple `Bar` without `stackId`. The plain (variant 1), 2-stack (variant 2), and 3-stack (variant 4) bars use `barSize={12}` to match the slim aesthetic of the screenshot; the grouped variant (3) is left at the recharts default since side-by-side pairs already render thin.
- Pie variants → `PieChart` with `Pie` (no `innerRadius`). Each "single-slice" pie is a 2-data-point pie: one slice = colored, the remainder = a light track color.
- Donut variants → `PieChart` with `Pie` using `innerRadius` and `outerRadius` for the ring. Single-color donuts use a 2-data-point pie (colored + light track). The 2-color donut uses 3 cells (yellow + teal + track). The multi-color (4th) donut fills the full ring with 5 colored segments (yellow + teal + light teal + blue + orange) and no track, joined edge-to-edge.

**Rationale:** Recharts already in dependency tree; no new library. The "single colored slice on a light track" pattern matches the screenshot's lavender-background pies/donuts.

Alternatives considered: chart.js, apexcharts — rejected, would add ~80kb each and split the codebase between two charting libs.

### 4. Theme-aware palette strategy

**Decision:** Each chart family has a `get<Family>Colors(theme: Theme)` function in `palette.ts` returning a structured object:

```ts
type BarPalette = {
  plainBlue: string;          // variant a
  stacked2Base: string;       // variant b base (teal)
  stacked2Top: string;        // variant b top (light cyan)
  groupedA: string;           // variant c first series (purple)
  groupedB: string;           // variant c second series (orange)
  stacked3Base: string;       // variant d base (lightest pink)
  stacked3Mid: string;        // variant d mid (dark pink)
  stacked3Top: string;        // variant d top (light pink)
  pieTrack: string;           // light lavender track (used by pies + donuts)
};
```

Per-theme overrides nudge saturation/brightness so colors read on dark and forest backgrounds. The light theme uses the screenshot palette verbatim.

**Rationale:** Matches the existing `chart-components` spec ("Theme-aware chart colors" requirement) and the `RevenueChart`/`SalesDetailsChart` precedent. Single source of truth per family, switched via `useTheme()`.

Alternatives considered: CSS variables for chart colors — rejected, recharts SVG fills don't reliably read computed CSS-var values across all `<defs>` cases, and the existing pattern uses literal hex.

**Note on `useChartTheme`:** The chart variants read theme through a small local hook `src/pages/UiElements/useChartTheme.ts` that wraps `useTheme()` defensively and falls back to `"light"` when no `<ThemeProvider>` is present. This is a test-isolation aid — the page-level test renders `<UiElements />` in a unit-test harness without wrapping in a provider, and the fallback prevents that test from blowing up while keeping production behavior identical (the app always wraps in `ThemeProvider`).

### 5. Mock data shape and location

**Decision:** Hard-coded mock data lives in `data/mockData.ts`, exported as named constants:

```ts
export const barPlainData = [{name: "A", value: 80}, ...];
export const barStacked2Data = [{name: "A", base: 30, top: 50}, ...];
export const barGroupedData = [{name: "A", a: 40, b: 60}, ...];
export const barStacked3Data = [{name: "A", base: 20, mid: 30, top: 40}, ...];
export const pieData = (filledPct: number) => [
  { name: "filled", value: filledPct },
  { name: "track",  value: 100 - filledPct },
];
export const donutSingleData = pieData; // alias
export const donutStacked2Data = [...];
export const donutStacked3Data = [...];
```

**Rationale:** Decouples data from chart components, makes it trivial to tweak proportions per the design without touching JSX.

### 6. Responsive grid

**Decision:** Use Tailwind grid utilities directly on each section card:
- `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4`

**Rationale:** 4-across on large screens, 2x2 on tablets (md breakpoint = 768px), 1-per-row on mobile. Matches the project's existing breakpoint conventions (no custom breakpoints needed).

### 7. i18n namespace and rename

**Decision:** Add `uiElements` namespace; register it in root `i18n.ts`. Rename `navigation.uiElement` → `navigation.uiElements` in both `en/navigation.json` and `jp/navigation.json`, with values "UI Elements" and "UI要素" (the existing jp value).

Files added:
- `public/locales/en/uiElements.json`
- `public/locales/jp/uiElements.json`

Keys (both files):
```json
{
  "title": "UI Elements" | "UI要素",
  "filter": {
    "label": "Filter By",
    "options": {
      "all": "Charts",
      "bar": "Bar Chart",
      "pie": "Pie Chart",
      "donut": "Donut Chart"
    }
  },
  "sections": {
    "bar": "Bar Chart",
    "pie": "Pie Chart",
    "donut": "Donut Chart"
  }
}
```

**Rationale:** Plural namespace name matches plural page name and leaves room for future UI-Elements-related categories (forms, badges, etc.). Existing `dashboard` namespace is already crowded.

### 8. ROUTES rename strategy

**Decision:** Single atomic commit-equivalent change touching:

1. `src/routes/routes.ts`: `UI_ELEMENT: "/ui-element"` → `UI_ELEMENTS: "/ui-elements"`.
2. `src/routes/AppRoutes.tsx`: lazy import `UiElement` → `UiElements`, route path `ui-element` → `ui-elements`.
3. `src/components/Sidebar/navigationData.ts`: nav item id `ui-element` → `ui-elements`, label key `navigation:uiElement` → `navigation:uiElements`, route ref `ROUTES.UI_ELEMENT` → `ROUTES.UI_ELEMENTS`.
4. Folder rename: `src/pages/UiElement/` → `src/pages/UiElements/`.
5. i18n: `uiElement` key → `uiElements` key in both navigation locale files (with plural value).
6. Any tests referencing the singular id/route — update.

**Rationale:** Partial renames cause active-state regressions per `sidebar-navigation` spec scenarios (longest-prefix matching), so this must land as one atomic delta.

### 9. Page header

**Decision:** Reuse the existing inline page-header pattern from the placeholder file (`<div className="flex items-center gap-3 mb-6">` + icon badge + `<h1>`). Drop in the `Filter By` dropdown to the right via `<div className="ml-auto">` (or wrap the header in a `flex justify-between` row with the title-block on the left and the filter on the right).

**Rationale:** No PageHeader component exists; extracting one would balloon the change. Stay consistent with other pages that use this same inline layout.

### 10. Custom tooltip component

**Decision:** All chart variants render their tooltip via a shared `<ChartTooltip />` component at `src/pages/UiElements/components/ChartTooltip.tsx`, passed to recharts as `<Tooltip content={<ChartTooltip />} />`. The component matches the visual treatment of `RevenueChart`'s `CustomTooltip`: theme-aware surface (`var(--color-surface)`), border, shadow, colored dot per series, `text-secondary` label, `text-primary` semibold value. Pie/donut tooltips filter out the `track` slice so the user only sees real data segments.

**Rationale:** The recharts default tooltip colors each line by the series fill, which makes light fills (light cyan, lightest pink, light teal) unreadable against the white tooltip background. A custom tooltip provides consistent contrast across all 8 chart variants and matches the existing dashboard tooltip design language.

Alternatives considered: passing only `itemStyle` / `labelStyle` overrides to the default tooltip — rejected, the result still mixed legible and illegible lines because the colored swatch was reused as the text color. The custom component cleanly separates the swatch (colored dot) from the text (theme primary).

## Risks / Trade-offs

- [**Old `/ui-element` URL becomes invalid**] → catch-all redirect already lands users on `/dashboard`. No 404. Acceptable: this is a brownfield template, the singular URL was never published externally.
- [**Tests referencing singular id `ui-element`**] → run a grep for `ui-element` and `UiElement` after the rename to catch missed references; update sidebar tests if any.
- [**Recharts fill colors don't theme via CSS vars**] → per Decision 4, use literal hex values returned from per-theme palette functions. Trade-off accepted: matches existing `RevenueChart` precedent.
- [**Mock data could drift from screenshot proportions**] → tasks include a visual QA step in browser across all 3 themes before marking the change verified.
- [**Forest theme readability**] → forest backgrounds are dark green; lightest-pink + light-cyan stacked-bar tops may wash out. Mitigation: forest palette nudges those hues slightly toward higher contrast (e.g., shift `stacked2Top` from `#A7F3D0` toward `#5EEAD4`).
- [**Filter dropdown UX on mobile**] → dropdown menu width vs. viewport. Mitigation: align menu to right edge of trigger and cap menu min-width at trigger width.
- [**Atomic rename touches 6+ files**] → single change with all rename edits + new content. No partial application.
