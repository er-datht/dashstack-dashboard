# ui-elements-page Specification

## Purpose
TBD - created by archiving change add-ui-elements-page. Update Purpose after archive.
## Requirements
### Requirement: UI Elements page route and shell
The application SHALL render a UI Elements page at the path `/ui-elements`. The page SHALL have a header consisting of a Layers-icon badge and the title "UI Elements", and a Filter By Charts dropdown control aligned to the right of the header. Below the header, the page SHALL render up to three section cards (Bar Chart, Pie Chart, Donut Chart) stacked vertically.

#### Scenario: Page renders at /ui-elements
- **WHEN** an authenticated user navigates to `/ui-elements`
- **THEN** the UI Elements page renders inside the DashboardLayout with header, filter dropdown, and three chart sections visible by default

#### Scenario: Page title uses translation
- **WHEN** the page header renders
- **THEN** the title text comes from `t("uiElements:title")` and reads "UI Elements" in English / "UI要素" in Japanese

### Requirement: Filter By Charts dropdown options and default
The Filter By Charts dropdown SHALL offer four options: "Charts" (value `all`), "Bar Chart" (value `bar`), "Pie Chart" (value `pie`), "Donut Chart" (value `donut`). The default selected value SHALL be `all`. All option labels SHALL come from the `uiElements:filter.options.*` translation keys.

#### Scenario: Default selection on first render
- **WHEN** the user opens the UI Elements page for the first time in the session
- **THEN** the Filter By dropdown displays "Charts" as the selected value

#### Scenario: Dropdown lists all four options
- **WHEN** the user opens the Filter By dropdown
- **THEN** the menu shows exactly four options in order: "Charts", "Bar Chart", "Pie Chart", "Donut Chart"

### Requirement: Filter scopes visible sections
Selecting an option from the Filter By dropdown SHALL change which section cards are rendered:
- `all` (Charts) → Bar Chart, Pie Chart, and Donut Chart sections all render.
- `bar` (Bar Chart) → only the Bar Chart section renders.
- `pie` (Pie Chart) → only the Pie Chart section renders.
- `donut` (Donut Chart) → only the Donut Chart section renders.

The section ordering when multiple are visible SHALL be Bar → Pie → Donut.

#### Scenario: Selecting Bar Chart hides others
- **WHEN** the user selects "Bar Chart" from the Filter By dropdown
- **THEN** only the Bar Chart section card is rendered; Pie Chart and Donut Chart sections are not in the DOM

#### Scenario: Returning to Charts shows all
- **WHEN** the user has selected "Pie Chart" and then re-selects "Charts"
- **THEN** all three section cards (Bar, Pie, Donut) render again in order

### Requirement: Filter state is local and not persisted
The selected filter value SHALL be stored in component-local React state and SHALL NOT persist across navigations or page reloads.

#### Scenario: Reload resets filter
- **WHEN** the user selects "Donut Chart", reloads the browser, and the page remounts
- **THEN** the dropdown shows "Charts" (the default), not "Donut Chart"

### Requirement: Bar Chart section variants
The Bar Chart section card SHALL contain exactly four bar chart variants laid out in a row:
1. **Plain blue bars** — single-series vertical bars with varying heights.
2. **2-color stacked bars** — bars with a teal base segment and a light cyan top segment.
3. **Grouped bars** — pairs of side-by-side bars (purple + orange) at multiple x positions.
4. **3-color stacked bars** — bars with a base, mid, and top segment in three pink hues.

#### Scenario: All four bar variants render
- **WHEN** the Bar Chart section is visible
- **THEN** four distinct bar chart variants are rendered: plain, 2-stacked, grouped, 3-stacked

### Requirement: Pie Chart section variants
The Pie Chart section card SHALL contain exactly four pie chart variants laid out in a row, each rendered as a single-slice pie on a light-track background. Slice colors and proportions SHALL be:
1. Blue slice (~25%)
2. Purple slice (~25%)
3. Orange slice (~33%)
4. Blue slice (~33%)

#### Scenario: All four pie variants render
- **WHEN** the Pie Chart section is visible
- **THEN** four single-slice pies render in order with the specified colors and proportions

### Requirement: Donut Chart section variants
The Donut Chart section card SHALL contain exactly four donut chart variants laid out in a row:
1. Single-color teal donut.
2. Single-color blue donut.
3. 2-color donut (yellow + teal).
4. Multi-color donut filling the full ring (no track) with five segments — yellow, teal, light teal, blue, and orange — joined edge-to-edge.

#### Scenario: All four donut variants render
- **WHEN** the Donut Chart section is visible
- **THEN** four donut variants render in order with the specified color treatments

### Requirement: Hover tooltips enabled, no legends or axis labels
All chart variants SHALL display recharts default tooltips on hover. Charts SHALL NOT render legends. Bar charts SHALL NOT render axis labels or axis tick text.

#### Scenario: Tooltip on hover
- **WHEN** the user hovers over a bar in any bar chart variant
- **THEN** a tooltip appears with the data value for that bar

#### Scenario: No legend rendered
- **WHEN** any chart variant renders
- **THEN** no legend element is present in the chart

### Requirement: Theme-aware chart palettes
Each chart family (bar, pie, donut) SHALL define color palettes for all three themes (light, dark, forest). The active theme's palette SHALL be applied to chart fills, tracks, and stroke colors. The light-theme palette SHALL match the design screenshot's saturated brand hues. Dark and forest palettes MAY adjust hues for readability against their respective backgrounds.

#### Scenario: Dark theme palette applied
- **WHEN** the active theme is `dark`
- **THEN** chart variants render using the dark-theme palette for that chart family

#### Scenario: Forest theme palette applied
- **WHEN** the active theme is `forest`
- **THEN** chart variants render using the forest-theme palette for that chart family

### Requirement: Responsive grid for chart variants
Within each section card, the four chart variants SHALL be laid out in a CSS grid that is:
- 1 column on screens narrower than the `md` breakpoint (mobile).
- 2 columns on screens at the `md` breakpoint (tablet, ≥768px).
- 4 columns on screens at the `xl` breakpoint or wider (desktop, ≥1280px).

Section cards SHALL always stack vertically regardless of viewport.

#### Scenario: Desktop layout
- **WHEN** the viewport width is ≥1280px
- **THEN** each section card displays its four chart variants in a single row of four columns

#### Scenario: Tablet layout
- **WHEN** the viewport width is between 768px and 1279px
- **THEN** each section card displays its four chart variants in a 2×2 grid

#### Scenario: Mobile layout
- **WHEN** the viewport width is below 768px
- **THEN** each section card displays its four chart variants stacked one per row

### Requirement: Hard-coded mock data
Chart variants SHALL render from hard-coded mock data defined in the page module. The page SHALL NOT make network calls to fetch chart data.

#### Scenario: No network calls on mount
- **WHEN** the UI Elements page mounts
- **THEN** no API requests are issued by the page or its chart components

### Requirement: i18n namespace for UI Elements
The application SHALL define a new i18n namespace `uiElements` containing keys for the page title, filter label, filter option labels, and section titles. The namespace SHALL be registered in the root `i18n.ts` namespace list and locale files SHALL exist for both `en` and `jp`.

#### Scenario: Namespace registered at init
- **WHEN** the application initializes i18next
- **THEN** the `uiElements` namespace is included in the registered namespace list

#### Scenario: All page strings translated
- **WHEN** the user switches language to Japanese
- **THEN** the page title, filter label, filter options, and section titles all switch to their Japanese translations

