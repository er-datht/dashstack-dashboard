## Why

The `/table` route is currently a placeholder card with stray non-namespaced i18n keys, while its sidebar peer `/ui-elements` ships a fully-realized charts gallery. The Table page should mirror that pattern as a Tables gallery — both to make the admin shell feel complete and to give the project a discoverable surface for showcasing the existing `TableCommon` component and a small set of new visual variants (`striped`, `bordered`, `compact`) that consumers will benefit from.

## What Changes

- Replace the placeholder `src/pages/Table/index.tsx` with a 3-section gallery (Basic Tables / Cell Content / States & Interaction), each section a card with a 2×2 grid of 4 `<VariantCard />` instances — 12 variants total.
- Add a `FilterByDropdown` to the page header (mirrors `UiElements`) with values `all` / `basic` / `cellContent` / `statesAndInteraction`. State is local and not persisted across navigation/reload.
- Extend `TableCommon` with three new optional boolean props — all default `false`, all CSS-only modifier classes appended to the `<table>` element:
  - `striped` — alternating row backgrounds via `tbody tr:nth-child(even)` using existing `--color-table-row-hover-secondary` (no new tokens). Hover still wins over stripe.
  - `bordered` — full grid: `1px solid var(--color-border)` on every `td` and `th`, outer border via container. Existing `border-radius` preserved.
  - `compact` — halves vertical cell padding only (`var(--spacing-2)` instead of `var(--spacing-4)`); horizontal padding stays at 16px; header vertical padding halved on the same axis.
- Promote the `ColorDots` helper currently private inside `src/pages/ProductStock/index.tsx` to a shared component at `src/components/ColorDots/index.tsx`. Update the `ProductStock` import in the same diff. The Tables gallery's "With Color Dots" variant imports from the same shared location.
- Add a new `tables` i18n namespace (en + jp) registered in root `i18n.ts`. Delete the placeholder's stray non-namespaced keys (`navigation.table`, `table.description`).
- Add unit tests asserting the 3 new modifier classes appear on `<table>` only when their respective prop is `true` — protects existing consumers (`ProductStock`, `Orders`, `DealDetailsTable`) from regression. Add page-level smoke tests for the gallery (sections render, filter narrows visible sections, all 12 variant cards mount).

## Capabilities

### New Capabilities

- `table-gallery-page`: The Tables showcase at `/table` — page header with `Table` lucide icon and `FilterByDropdown`, three conditionally-rendered section cards, each containing a 2×2 grid of variant cards demonstrating `TableCommon` features (visual modifiers, cell content patterns, states & interaction). Local-only filter state. Companion to `ui-elements-page`.

### Modified Capabilities

- `shared-components`: `TableCommon` gains three optional boolean visual modifier props (`striped`, `bordered`, `compact`) — all default `false`, theme-aware via existing CSS custom properties, applied as modifier classes to the `<table>` element. A new `ColorDots` shared component is added (promoted from `ProductStock` with no behavior change).

## Impact

- **Code**: `src/pages/Table/index.tsx` (rewritten); new files under `src/pages/Table/components/`, `src/pages/Table/types.ts`, `src/pages/Table/mockData.ts`; `src/components/TableCommon/index.tsx` and `TableCommon.module.scss` (3 new props + modifier classes); new `src/components/ColorDots/index.tsx`; `src/pages/ProductStock/index.tsx` (import update only).
- **i18n**: New `tables` namespace added to root `i18n.ts`; new locale files at `public/locales/{en,jp}/tables.json`; placeholder's stray `navigation.table` / `table.description` keys deleted (not migrated).
- **Tests**: New `src/components/TableCommon/__tests__/TableCommon.modifiers.test.tsx`; new `src/pages/Table/__tests__/index.test.tsx`.
- **Routing & nav**: No changes — `ROUTES.TABLE`, the lazy import in `AppRoutes.tsx`, and the sidebar nav item all already exist.
- **Dependencies**: None added or removed. Reuses `lucide-react`, `react-i18next`, `classnames`, `react-paginate`, and the existing CSS token system.
- **Existing consumers**: `ProductStock`, `Orders`, `DealDetailsTable` continue to render identically — new `TableCommon` props default to `false`. `ProductStock` only changes its `ColorDots` import path.
- **Out of scope**: sortable headers, row selection, expandable rows, density toggle, column visibility, CSV export, filter persistence — all deferred to a future change.
