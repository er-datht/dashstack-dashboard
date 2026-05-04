## 1. Atomic rename: ui-element → ui-elements

- [x] 1.1 In `src/routes/routes.ts`, rename `UI_ELEMENT: "/ui-element"` to `UI_ELEMENTS: "/ui-elements"`
- [x] 1.2 In `src/routes/AppRoutes.tsx`, rename the lazy import const `UiElement` → `UiElements`, change the import path to `../pages/UiElements`, and change the route `<Route path="ui-element" element={<UiElement />} />` to `<Route path="ui-elements" element={<UiElements />} />`
- [x] 1.3 In `src/components/Sidebar/navigationData.ts`, change the UI Elements nav item: id `ui-element` → `ui-elements`, label key `navigation:uiElement` → `navigation:uiElements`, fallback string `"UI Element"` → `"UI Elements"`, route `ROUTES.UI_ELEMENT` → `ROUTES.UI_ELEMENTS`
- [x] 1.4 Rename the folder `src/pages/UiElement/` → `src/pages/UiElements/` (preserve git history with `git mv`)
- [x] 1.5 In `public/locales/en/navigation.json`, rename key `uiElement` → `uiElements` and update value to `"UI Elements"`
- [x] 1.6 In `public/locales/jp/navigation.json`, rename key `uiElement` → `uiElements` (keep value `"UI要素"` or update to plural form if appropriate)
- [x] 1.7 Grep the repo for remaining references: `ui-element`, `UI_ELEMENT`, `UiElement`, `uiElement` — update or delete each (ignore strings inside this change's `openspec/changes/add-ui-elements-page/` directory)

## 2. i18n namespace registration

- [x] 2.1 In root `i18n.ts`, add `"uiElements"` to the `ns` array (alongside the existing 16 namespaces)
- [x] 2.2 Create `public/locales/en/uiElements.json` with keys: `title`, `filter.label`, `filter.options.{all,bar,pie,donut}`, `sections.{bar,pie,donut}` (English values: "UI Elements", "Filter By", "Charts", "Bar Chart", "Pie Chart", "Donut Chart")
- [x] 2.3 Create `public/locales/jp/uiElements.json` with the same key shape and Japanese translations (use natural translations, e.g., title `"UI要素"`, filter label `"フィルター"`, etc.)

## 3. Page scaffold

- [x] 3.1 Create `src/pages/UiElements/types.ts` exporting the `FilterValue` type (`"all" | "bar" | "pie" | "donut"`)
- [x] 3.2 Create `src/pages/UiElements/palette.ts` exporting `getBarColors(theme)`, `getPieColors(theme)`, `getDonutColors(theme)`. Each returns a structured palette object with light-theme values from the design screenshot and dark/forest overrides for readability
- [x] 3.3 Create `src/pages/UiElements/data/mockData.ts` exporting hard-coded data arrays for every chart variant (bar plain, bar 2-stack, bar grouped, bar 3-stack, pie helper, donut single, donut 2-stack, donut 3-stack)
- [x] 3.4 Replace `src/pages/UiElements/index.tsx` with the new page shell: page header (Layers icon + "UI Elements" title) on the left, `<FilterByDropdown />` on the right, then conditional rendering of `<BarChartSection />`, `<PieChartSection />`, `<DonutChartSection />` based on the filter value
- [x] 3.5 Wire `useState<FilterValue>("all")` in `index.tsx` and pass `value` and `onChange` to `<FilterByDropdown />`

## 4. Filter By dropdown component

- [x] 4.1 Create `src/pages/UiElements/components/FilterByDropdown.tsx` with props `{ value: FilterValue; onChange: (next: FilterValue) => void }`
- [x] 4.2 Render the trigger as a pill: funnel icon (`Filter` from lucide-react) + "Filter By" label + bordered inner dropdown trigger showing the current selection's translated label + chevron icon
- [x] 4.3 Implement open/close state with `onBlur` close timeout matching the existing `RevenueChart` dropdown pattern
- [x] 4.4 Render a dropdown menu listing all 4 options; clicking an option calls `onChange(value)` and closes the menu
- [x] 4.5 Apply `text-primary`, `hover-bg-muted`, `bg-sidebar-menu-active` (for the active item) classes consistent with existing dropdowns

## 5. Bar Chart section + variants

- [x] 5.1 Create `src/pages/UiElements/components/BarChartSection.tsx`: a `card` wrapper with a section title (`t("uiElements:sections.bar")`) and a `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4` row containing the four bar variant components
- [x] 5.2 Create `src/pages/UiElements/charts/BarVariantPlain.tsx`: `BarChart` with one `Bar` series rendering `barPlainData` in plain blue
- [x] 5.3 Create `src/pages/UiElements/charts/BarVariantStacked2.tsx`: `BarChart` with two `Bar` series sharing `stackId="a"`, base teal + top light-cyan
- [x] 5.4 Create `src/pages/UiElements/charts/BarVariantGrouped.tsx`: `BarChart` with two `Bar` series (no `stackId`), purple + orange side-by-side
- [x] 5.5 Create `src/pages/UiElements/charts/BarVariantStacked3.tsx`: `BarChart` with three `Bar` series sharing `stackId="a"`, three pink hues
- [x] 5.6 In each bar variant, hide axes (`<XAxis hide />` and `<YAxis hide />`), enable `<Tooltip />`, and disable `<CartesianGrid />`. Wrap in `<ResponsiveContainer>` with a fixed height (e.g., 180px)

## 6. Pie Chart section + variants

- [x] 6.1 Create `src/pages/UiElements/components/PieChartSection.tsx`: card wrapper + 4-column responsive grid containing 4 instances of `<PieVariantSingle />` with different colors and proportions (blue 25%, purple 25%, orange 33%, blue 33%)
- [x] 6.2 Create `src/pages/UiElements/charts/PieVariantSingle.tsx` accepting `props { color: string; value: number }`. Renders a `PieChart` with one `Pie` containing two cells: filled (`color`) and track (`palette.pieTrack`). Tooltip enabled, no legend
- [x] 6.3 Use `ResponsiveContainer` with a fixed height (e.g., 180px) and aspect-square sizing

## 7. Donut Chart section + variants

- [x] 7.1 Create `src/pages/UiElements/components/DonutChartSection.tsx`: card wrapper + 4-column responsive grid containing the four donut variants in order
- [x] 7.2 Create `src/pages/UiElements/charts/DonutVariantSingle.tsx` accepting `props { color: string; value: number }`. Renders a `PieChart` with one `Pie` (with `innerRadius`/`outerRadius`) using two cells: filled + track
- [x] 7.3 Create `src/pages/UiElements/charts/DonutVariantStacked2.tsx`: `Pie` with three cells (yellow + teal + track)
- [x] 7.4 Create `src/pages/UiElements/charts/DonutVariantStacked3.tsx`: `Pie` with four cells (orange + yellow + teal + track)
- [x] 7.5 Reuse `DonutVariantSingle` for the first two variants (teal, blue) by passing different colors

## 8. Theming verification

- [x] 8.1 Verify the page renders correctly in the light theme (matches screenshot proportions and colors)
- [x] 8.2 Switch to dark theme; verify all chart variants are legible against the dark card background; adjust palette overrides if any track or fill loses contrast
- [x] 8.3 Switch to forest theme; verify all chart variants are legible against the forest background; adjust palette overrides as needed
- [x] 8.4 Verify the Filter By dropdown text, border, and active-item styling renders correctly in all 3 themes

## 9. i18n verification

- [x] 9.1 Switch language to Japanese; verify page title renders the Japanese translation
- [x] 9.2 Verify filter label and all 4 filter option labels render Japanese translations
- [x] 9.3 Verify all 3 section titles render Japanese translations

## 10. Filter behavior verification

- [x] 10.1 Default selection is "Charts" — all 3 sections visible
- [x] 10.2 Selecting "Bar Chart" hides Pie and Donut sections (DOM check)
- [x] 10.3 Selecting "Pie Chart" hides Bar and Donut sections
- [x] 10.4 Selecting "Donut Chart" hides Bar and Pie sections
- [x] 10.5 Reloading the page resets selection to "Charts" (no localStorage persistence)

## 11. Responsive layout verification

- [x] 11.1 At desktop width (≥1280px), each section renders 4 variants in one row
- [x] 11.2 At tablet width (768–1279px), each section renders variants in a 2×2 grid
- [x] 11.3 At mobile width (<768px), each section renders variants stacked one-per-row
- [x] 11.4 Section cards stack vertically at all viewport widths

## 12. Tests

- [x] 12.1 Update or remove any existing test that references the singular `ui-element` id, route, or `UiElement` component name
- [x] 12.2 Add unit test for `FilterByDropdown`: renders 4 options, default value reflects in trigger, calling onChange updates the displayed selection
- [x] 12.3 Add unit test for `UiElements` page: default filter value renders all 3 sections; setting filter to `bar` shows only Bar Chart section; setting filter to `pie` shows only Pie Chart section; setting filter to `donut` shows only Donut Chart section
- [x] 12.4 Run `yarn test` and confirm all tests pass

## 13. Lint, build, and visual QA

- [x] 13.1 Run `yarn lint` and resolve any errors introduced by the change
- [x] 13.2 Run `yarn build` and confirm a clean TypeScript compile + Vite bundle
- [x] 13.3 Start `yarn dev` and visit `/ui-elements` in a browser; visually compare against the screenshot for proportions, colors, and section ordering
- [x] 13.4 Visit the legacy `/ui-element` URL and confirm catch-all redirects to `/dashboard`
