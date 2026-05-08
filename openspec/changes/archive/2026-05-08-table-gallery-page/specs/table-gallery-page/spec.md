## ADDED Requirements

### Requirement: Table gallery page route and shell
The application SHALL render a Tables gallery page at the path `/table`. The page SHALL have a header consisting of a brand-light square containing the lucide `Table` icon and the title "Table" (`text-2xl font-bold text-primary`), and a Filter By Tables dropdown control aligned to the right of the header (`ml-auto`). Below the header, the page SHALL render up to three section cards (Basic Tables, Cell Content, States & Interaction) stacked vertically.

#### Scenario: Page renders at /table
- **WHEN** an authenticated user navigates to `/table`
- **THEN** the Tables gallery page renders inside the DashboardLayout with the icon-titled header, the Filter By Tables dropdown, and all three section cards visible by default

#### Scenario: Page title uses translation
- **WHEN** the page header renders
- **THEN** the title text comes from `t("tables:title")` and reads "Table" in English / its Japanese translation in Japanese

#### Scenario: Placeholder content removed
- **WHEN** the page mounts
- **THEN** no remnants of the prior placeholder copy ("View and manage data tables here.") or its non-namespaced i18n keys (`navigation.table`, `table.description`) are referenced

### Requirement: Filter By Tables dropdown options and default
The Filter By Tables dropdown SHALL offer four options: "Tables" (value `all`), "Basic Tables" (value `basic`), "Cell Content" (value `cellContent`), "States & Interaction" (value `statesAndInteraction`). The default selected value SHALL be `all`. All option labels SHALL come from the `tables:filterBy.*` translation keys.

#### Scenario: Default selection on first render
- **WHEN** the user opens the Tables gallery page for the first time in the session
- **THEN** the Filter By Tables dropdown displays "Tables" as the selected value

#### Scenario: Dropdown lists all four options
- **WHEN** the user opens the Filter By Tables dropdown
- **THEN** the menu shows exactly four options in order: "Tables", "Basic Tables", "Cell Content", "States & Interaction"

### Requirement: Filter scopes visible sections
Selecting an option from the Filter By Tables dropdown SHALL change which section cards are rendered:
- `all` (Tables) → Basic Tables, Cell Content, and States & Interaction sections all render.
- `basic` → only the Basic Tables section renders.
- `cellContent` → only the Cell Content section renders.
- `statesAndInteraction` → only the States & Interaction section renders.

The section ordering when multiple are visible SHALL be Basic Tables → Cell Content → States & Interaction.

#### Scenario: Selecting Basic hides others
- **WHEN** the user selects "Basic Tables" from the Filter By Tables dropdown
- **THEN** only the Basic Tables section card is rendered; Cell Content and States & Interaction sections are not in the DOM

#### Scenario: Returning to Tables shows all
- **WHEN** the user has selected "Cell Content" and then re-selects "Tables"
- **THEN** all three section cards render again in the order Basic → Cell Content → States & Interaction

### Requirement: Filter state is local and not persisted
The selected filter value SHALL be stored in component-local React state and SHALL NOT persist across navigations or page reloads.

#### Scenario: Reload resets filter
- **WHEN** the user selects "States & Interaction", reloads the browser, and the page remounts
- **THEN** the dropdown shows "Tables" (the default), not "States & Interaction"

### Requirement: Basic Tables section variants
The Basic Tables section card SHALL contain exactly four variant cards laid out in a 2×2 grid (responsive: 1 col on screens narrower than `lg`, 2 cols on `lg` and wider). Each variant card SHALL render a small `TableCommon` instance with 3–5 rows of invented mock data and the same column structure, differing only in the modifier props applied:
1. **Default** — no modifier props (`striped`/`bordered`/`compact` all false or omitted).
2. **Striped** — `striped={true}`.
3. **Bordered** — `bordered={true}`.
4. **Compact** — `compact={true}`.

#### Scenario: All four basic variants render
- **WHEN** the Basic Tables section is visible
- **THEN** four variant cards render with the titles "Default", "Striped", "Bordered", and "Compact"

#### Scenario: Modifier props applied per variant
- **WHEN** the Basic Tables section renders
- **THEN** the Striped variant's `<table>` carries the striped modifier class, the Bordered variant's `<table>` carries the bordered modifier class, the Compact variant's `<table>` carries the compact modifier class, and the Default variant's `<table>` carries none of them

### Requirement: Cell Content section variants
The Cell Content section card SHALL contain exactly four variant cards laid out in a 2×2 grid showcasing different cell-content patterns. No `TableCommon` modifier props are applied; only `renderCell` differs:
1. **With Avatars** — user list with columns: avatar (image), name, email. 5 rows.
2. **With Status Badges** — orders list with columns: order id, customer, status. The status cell renders the existing `StatusBadge` shared component. 5 rows.
3. **With Color Dots** — products list with columns: name, available colors. The colors cell renders the shared `ColorDots` component. 5 rows.
4. **With Action Icons** — products list with columns: name, actions. The actions cell renders `Pencil` and `Trash2` icon buttons; clicking the Pencil button SHALL show a toast with text from `tables:toast.edited`; clicking the Trash2 button SHALL show a toast with text from `tables:toast.deleted`. 5 rows.

#### Scenario: All four cell-content variants render
- **WHEN** the Cell Content section is visible
- **THEN** four variant cards render with the titles "With Avatars", "With Status Badges", "With Color Dots", and "With Action Icons"

#### Scenario: Action icons fire toasts
- **WHEN** the user clicks the Pencil button on any row in the With Action Icons variant
- **THEN** a success toast appears with the translated `tables:toast.edited` text and dismisses after the standard timeout

#### Scenario: Delete action does not mutate data
- **WHEN** the user clicks the Trash2 button on any row
- **THEN** the toast shows `tables:toast.deleted` and the row remains in the table (no actual deletion, no `ConfirmModal`)

### Requirement: States & Interaction section variants
The States & Interaction section card SHALL contain exactly four variant cards laid out in a 2×2 grid showcasing existing `TableCommon` features (no new props):
1. **Loading** — renders with `loading={true}` so the spinner overlay is visible.
2. **Empty** — renders with `data={[]}` so the no-data empty state is visible.
3. **Paginated** — renders 25 rows of generic mock data with `hasPagination={true}` and `pageSize={5}` so pagination actually paginates within the small showcase card.
4. **Clickable Rows** — renders with `onRowClick` wired; clicking any row SHALL show a toast with text from `tables:toast.selected`, interpolated with the clicked row's label.

#### Scenario: All four states variants render
- **WHEN** the States & Interaction section is visible
- **THEN** four variant cards render with the titles "Loading", "Empty", "Paginated", and "Clickable Rows"

#### Scenario: Paginated variant uses page size 5
- **WHEN** the Paginated variant renders
- **THEN** exactly 5 rows are visible at a time and the pagination control shows 5 pages total for the 25-row dataset

#### Scenario: Clickable rows fire toast
- **WHEN** the user clicks any row in the Clickable Rows variant
- **THEN** a toast appears with the translated `tables:toast.selected` text including the clicked row's label

### Requirement: Theme-aware visual variants
The page surface, section cards, variant cards, and all `TableCommon` instances (including the modifier styles for Striped, Bordered, and Compact) SHALL render correctly in all three themes: light, dark, and forest. All colors SHALL come from existing CSS custom properties (`--color-*`); no hardcoded color values SHALL be used.

#### Scenario: Dark theme rendering
- **WHEN** the active theme is `dark`
- **THEN** the page surface, section cards, variant cards, and the Striped / Bordered / Compact modifier styles all render with the dark-theme palette via existing CSS custom properties

#### Scenario: Forest theme rendering
- **WHEN** the active theme is `forest`
- **THEN** the page surface, section cards, variant cards, and the Striped / Bordered / Compact modifier styles all render with the forest-theme palette via existing CSS custom properties

### Requirement: Responsive grid for variant cards
Within each section card, the four variant cards SHALL be laid out in a CSS grid that is:
- 1 column on screens narrower than the `lg` breakpoint (≤1023px).
- 2 columns on screens at the `lg` breakpoint or wider (≥1024px).

Section cards SHALL always stack vertically regardless of viewport.

#### Scenario: Desktop layout (≥lg)
- **WHEN** the viewport width is ≥1024px
- **THEN** each section card displays its four variant cards in a 2×2 grid

#### Scenario: Mobile layout (<lg)
- **WHEN** the viewport width is below 1024px
- **THEN** each section card displays its four variant cards stacked one per row

### Requirement: Hard-coded mock data
Variant cards SHALL render from hard-coded mock data defined in the page module's `mockData.ts`. The page SHALL NOT make network calls or use React Query / domain hooks for any of the variant data.

#### Scenario: No network calls on mount
- **WHEN** the Tables gallery page mounts
- **THEN** no API requests are issued by the page or any of its variant cards

#### Scenario: Mock data text is English-only
- **WHEN** the language is switched to Japanese
- **THEN** the structural copy (page title, filter labels, section titles, variant titles, column headers, toast messages) switches to Japanese, and the mock row content (names, emails, product titles, order IDs) remains in English

### Requirement: i18n namespace for tables
The application SHALL define a new i18n namespace `tables` containing keys for the page title, filter label, filter option labels, section titles, variant titles, mock column headers, and toast messages. The namespace SHALL be registered in the root `i18n.ts` namespace list and locale files SHALL exist for both `en` and `jp`.

#### Scenario: Namespace registered at init
- **WHEN** the application initializes i18next
- **THEN** the `tables` namespace is included in the registered namespace list alongside the existing 17 namespaces

#### Scenario: All page chrome translated
- **WHEN** the user switches language to Japanese
- **THEN** the page title, filter label, filter options, section titles, variant titles, and toast messages all switch to their Japanese translations
