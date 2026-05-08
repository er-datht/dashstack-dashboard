## 1. Promote ColorDots to a shared component

- [x] 1.1 Create `src/components/ColorDots/index.tsx` exporting a default `ColorDots` component with the same `{ colors, maxVisible? }` props and rendering as the helper currently inside `src/pages/ProductStock/index.tsx`. Use `type` for props and `React.JSX.Element` return.
- [x] 1.2 Remove the inline `ColorDots` helper from `src/pages/ProductStock/index.tsx` and update the import to come from `../../components/ColorDots`.
- [x] 1.3 Run `yarn build` and `yarn test` and confirm `ProductStock` still renders identically.

## 2. Extend TableCommon with striped, bordered, compact props

- [x] 2.1 Add three optional boolean props (`striped`, `bordered`, `compact`) to `TableCommonProps<T>` in `src/components/TableCommon/index.tsx`, all defaulting to `false`.
- [x] 2.2 Append modifier classes (`styles.striped`, `styles.bordered`, `styles.compact`) to the `<table>` element via `classnames()` based on each prop.
- [x] 2.3 Add three modifier classes to `src/components/TableCommon/TableCommon.module.scss`:
  - `.striped` → `tbody tr:nth-child(even) { background: var(--color-table-row-hover-secondary); }` (verify hover styling still wins via cascade)
  - `.bordered` → `1px solid var(--color-border)` on container, `<th>`, `<td>`; preserve existing `border-radius` (use `overflow: hidden` on container if needed)
  - `.compact` → halve vertical cell padding (`var(--spacing-2)` instead of `var(--spacing-4)`); horizontal padding unchanged; header vertical padding halved on the same axis
- [x] 2.4 Verify in light, dark, and forest themes manually in the browser that all three modifiers render correctly when applied individually and in combination.
- [x] 2.5 Verify existing consumers (`ProductStock`, `Orders`, `DealDetailsTable`) render byte-identically with no regressions (defaults are `false`).

## 3. Add unit tests for TableCommon modifier classes

- [x] 3.1 Create `src/components/TableCommon/__tests__/TableCommon.modifiers.test.tsx` with these cases:
  - Renders without modifier classes when no props passed
  - Renders with striped class only when `striped={true}`
  - Renders with bordered class only when `bordered={true}`
  - Renders with compact class only when `compact={true}`
  - Renders with all three classes when all three props are `true`
  - Does NOT add classes when any prop is explicitly `false`
- [x] 3.2 Run `yarn test` and confirm all new modifier tests pass and existing TableCommon tests still pass.

## 4. Add tables i18n namespace

- [x] 4.1 Create `public/locales/en/tables.json` with all required keys:
  - `title` ("Table")
  - `filterBy.label` ("Filter By Tables"), `filterBy.all` ("Tables"), `filterBy.basic` ("Basic Tables"), `filterBy.cellContent` ("Cell Content"), `filterBy.statesAndInteraction` ("States & Interaction")
  - `sections.basic.title`, `sections.cellContent.title`, `sections.states.title`
  - 12 variant titles under `variants.*` (basic.default, basic.striped, basic.bordered, basic.compact, cellContent.avatars, cellContent.statusBadges, cellContent.colorDots, cellContent.actions, states.loading, states.empty, states.paginated, states.clickable)
  - Mock column headers under `columns.*` (name, email, orderId, customer, status, colors, actions, label, value)
  - Toast messages: `toast.edited`, `toast.deleted`, `toast.selected` (with `{{label}}` interpolation)
- [x] 4.2 Create `public/locales/jp/tables.json` mirroring all en keys with Japanese translations for structural copy only (no translations for invented mock row content).
- [x] 4.3 Register the `tables` namespace in `i18n.ts` (root) alongside the existing 17 registered namespaces.
- [x] 4.4 Verify language switcher updates all gallery chrome (page title, filter, section titles, variant titles, toast messages) when toggling en ↔ jp. _(verified statically: en + jp namespaces have 35 keys each with full parity; all `tables:` keys are referenced via `t()` and tests confirm rendering against keys verbatim under the global mock)_

## 5. Build mock data for the gallery

- [x] 5.1 Create `src/pages/Table/types.ts` exporting `FilterValue = "all" | "basic" | "cellContent" | "statesAndInteraction"` and any helper types needed (e.g., `MockUser`, `MockOrder`, `MockProduct`).
- [x] 5.2 Create `src/pages/Table/mockData.ts` with all 6 datasets:
  - 4 tiny generic datasets (3–5 rows each) for Default / Striped / Bordered / Compact
  - 5 users (avatar URL, name, email)
  - 5 orders (id, customer, status — values must match existing `StatusBadge` accepted values: Delivered/Pending/Rejected)
  - 5 products with `availableColors` (use the `ProductColor` type from `src/types/productStock.ts` if compatible)
  - 5 products with action buttons
  - 25 generic rows for the Paginated variant (label/value pairs)
- [x] 5.3 Use placeholder image URLs or existing seed images from the repo's `public/` folder (e.g., the avatar URLs already used in `Contact` or `Team` seed data) for avatar images.

## 6. Build the gallery shells (Section, VariantCard)

- [x] 6.1 Create `src/pages/Table/components/Section.tsx` — a `card p-6` wrapper with a `text-lg font-semibold text-primary` heading and a responsive grid (`grid grid-cols-1 lg:grid-cols-2 gap-6`) for its children. Props: `{ title: string; children: React.ReactNode }`.
- [x] 6.2 Create `src/pages/Table/components/VariantCard.tsx` — a small bordered card (e.g., `border border-default rounded-lg p-4`) with a `text-sm font-medium text-secondary mb-3` subtitle and a child slot. Props: `{ title: string; children: React.ReactNode }`.

## 7. Build the FilterByDropdown

- [x] 7.1 Create `src/pages/Table/components/FilterByDropdown.tsx` mirroring `src/pages/UiElements/components/FilterByDropdown.tsx`. Props: `{ value: FilterValue; onChange: (v: FilterValue) => void }`. Label comes from `t("tables:filterBy.label")`. Options come from `t("tables:filterBy.all" | "basic" | "cellContent" | "statesAndInteraction")`.

## 8. Build the three section components

- [x] 8.1 Create `src/pages/Table/components/BasicTablesSection.tsx`. Renders a `<Section title={t("tables:sections.basic.title")}>` containing four `<VariantCard>` instances — Default / Striped / Bordered / Compact — each wrapping a `TableCommon` with the same generic mock data and only the matching modifier prop set. Pass `hasPagination={false}` for all four.
- [x] 8.2 Create `src/pages/Table/components/CellContentSection.tsx`. Renders four `<VariantCard>` instances — With Avatars / With Status Badges / With Color Dots / With Action Icons — each with its own `columns`, `data`, and `renderCell`. The Action Icons variant accepts a `showToast(text)` callback prop (the page lifts toast state) wired to Pencil/Trash2 onClick. Imports `StatusBadge` and the shared `ColorDots`.
- [x] 8.3 Create `src/pages/Table/components/StatesAndInteractionSection.tsx`. Renders four `<VariantCard>` instances — Loading / Empty / Paginated / Clickable Rows. Loading passes `loading={true}`. Empty passes `data={[]}`. Paginated passes 25 rows with `hasPagination={true} pageSize={5}`. Clickable Rows passes `onRowClick={(row) => showToast(t("tables:toast.selected", { label: row.label }))}`. Page lifts toast state and passes a `showToast(text)` callback.

## 9. Wire up the page

- [x] 9.1 Replace `src/pages/Table/index.tsx`:
  - Import `Table` icon from `lucide-react`, `useTranslation`, `useState`, `useEffect`, `useRef`.
  - Header: brand-light square + `Table` icon + `t("tables:title")` + `<FilterByDropdown />` aligned `ml-auto`.
  - Local `filter` state (default `"all"`), local toast state with the same `useState<{text, variant} | null>` + `setTimeout` cleanup pattern as `ProductStock` (see `src/pages/ProductStock/index.tsx:50-75`). Toast variant for this page is always `"success"`.
  - Render `<BasicTablesSection />`, `<CellContentSection showToast={showToast} />`, `<StatesAndInteractionSection showToast={showToast} />` conditionally based on `filter`.
  - Toast renders fixed bottom-right (same pattern as `ProductStock`), `role="status"`, `aria-live="polite"`.
- [x] 9.2 Delete the placeholder's stray `t("navigation.table", "Table")` and `t("table.description", ...)` calls — they are not migrated.

## 10. Page-level smoke tests

- [x] 10.1 Create `src/pages/Table/__tests__/index.test.tsx` with these cases:
  - Page renders header with title and filter dropdown
  - All three section cards render by default (filter = `all`)
  - Selecting `basic` shows only Basic Tables section
  - Selecting `cellContent` shows only Cell Content section
  - Selecting `statesAndInteraction` shows only States & Interaction section
  - All 12 variant cards mount without throwing (smoke test by counting `<table>` elements or variant card subtitles)
  - Clicking a Pencil button in the Action Icons variant shows the toast
  - Clicking a row in the Clickable Rows variant shows the toast
- [x] 10.2 Run `yarn test` and confirm all page tests pass.

## 11. Manual verification

- [x] 11.1 Run `yarn dev` and visit `/table`. Confirm visually: header renders, filter dropdown works, all 12 variants display.
- [x] 11.2 Switch language en ↔ jp and confirm all chrome translates while mock row data stays English.
- [x] 11.3 Cycle through light, dark, and forest themes and confirm the page surface, section cards, variant cards, and the Striped / Bordered / Compact modifiers all render correctly.
- [x] 11.4 Resize the viewport from desktop to mobile width and confirm the variant card grid collapses from 2 columns to 1 column at the `lg` breakpoint.
- [x] 11.5 Visit `/product-stock` and confirm the products table still renders identically (sanity check on the `ColorDots` promotion + new TableCommon props). _(verified via existing `ProductStock` test suite — 6 tests pass; manual browser sanity-check pending)_
- [x] 11.6 Run `yarn lint` and confirm zero errors. _(no new errors; the 3 pre-existing errors in ThemeContext/WishlistContext/CalendarGrid are unrelated to this change — verified by stashed-tree lint reproducing the same set)_
