# shared-components Specification

## Purpose
Defines the shared UI building blocks: TableCommon, StatusBadge, button variants, Pagination, LoadingWrapper, and the component conventions all new components must follow.

## Requirements

### Requirement: Generic TableCommon component
The `TableCommon<T>` component SHALL accept typed column definitions (`ColumnDefinition<T>[]`), data array (`T[]`), and a `renderCell(item: T, column: ColumnDefinition<T>)` callback for custom cell rendering. It SHALL support optional pagination, column alignment (left/center/right), column widths, and a loading overlay. It SHALL ALSO accept three optional boolean visual modifier props — `striped`, `bordered`, and `compact` — each defaulting to `false`, each implemented as a CSS modifier class appended to the rendered `<table>` element. The modifiers SHALL be combinable, theme-aware (light / dark / forest) via existing CSS custom properties, and SHALL NOT change runtime behavior or rendered output when their values are `false` or omitted.

#### Scenario: Typed table rendering
- **WHEN** `TableCommon<Deal>` is rendered with Deal-typed columns and data
- **THEN** the table renders with type-safe column definitions and cell rendering

#### Scenario: Loading overlay
- **WHEN** the `loading` prop is true
- **THEN** a loading overlay with spinner is displayed over the table

#### Scenario: Pagination integration
- **WHEN** `hasPagination` is true with pageCount and pageCurrent props
- **THEN** pagination controls render below the table

#### Scenario: Striped modifier
- **WHEN** `TableCommon` is rendered with `striped={true}`
- **THEN** the `<table>` element carries the striped modifier class and even-indexed `<tbody>` rows render with the alternating background color sourced from `var(--color-table-row-hover-secondary)`; hover styling continues to take precedence over the stripe

#### Scenario: Bordered modifier
- **WHEN** `TableCommon` is rendered with `bordered={true}`
- **THEN** the `<table>` element carries the bordered modifier class, every `<th>` and `<td>` has a `1px solid var(--color-border)` border, and the outer container retains its existing rounded corners

#### Scenario: Compact modifier
- **WHEN** `TableCommon` is rendered with `compact={true}`
- **THEN** the `<table>` element carries the compact modifier class and the cell vertical padding is halved (from `var(--spacing-4)` to `var(--spacing-2)`); horizontal cell padding is unchanged

#### Scenario: Modifier defaults are no-op
- **WHEN** `TableCommon` is rendered without any of `striped`, `bordered`, or `compact` (or with all three set to `false`)
- **THEN** the rendered `<table>` carries none of the modifier classes and the visual output is unchanged from prior behavior

#### Scenario: Modifiers combinable
- **WHEN** `TableCommon` is rendered with `striped={true} bordered={true} compact={true}` simultaneously
- **THEN** all three modifier classes are present on the `<table>` and their styles compose without runtime errors

#### Scenario: Theme-aware modifiers
- **WHEN** the active theme is `dark` or `forest` and any of the modifier props is `true`
- **THEN** the stripe / border / padding styling renders using the theme's existing CSS custom properties — no hardcoded colors are used and existing consumers (`ProductStock`, `Orders`, `DealDetailsTable`) continue to render identically when they do not opt in to the new props

### Requirement: TableCommon keyboard activation when onRowClick is provided

When the `TableCommon<T>` component is rendered with the optional `onRowClick?: (item: T) => void` prop, each rendered row `<tr>` SHALL receive `tabIndex={0}` and an `onKeyDown` handler that invokes `onRowClick(item)` when the user presses **Enter** or **Space** while the row is focused. The handler SHALL call `event.preventDefault()` on Space (and ONLY on Space) before invoking `onRowClick`, so that the browser does not scroll the page. The rendered `<tr>` SHALL remain a semantic `<tr>` element — NO `role="button"`, `role="row"`, `role="grid"`, or `role="gridcell"` attribute SHALL be added by this requirement. When `onRowClick` is NOT provided, the rendered DOM for each row SHALL be byte-identical to the behavior prior to this requirement: no `tabIndex` attribute, no `onKeyDown` handler, and no row-level focus or keyboard behavior.

#### Scenario: Enter activates row when onRowClick is provided

- **WHEN** `TableCommon` is rendered with an `onRowClick` callback AND the user focuses a row and presses Enter
- **THEN** the `onRowClick` callback is invoked exactly once with the focused row's item

#### Scenario: Space activates row and prevents default scroll when onRowClick is provided

- **WHEN** `TableCommon` is rendered with an `onRowClick` callback AND the user focuses a row and presses Space
- **THEN** the `onRowClick` callback is invoked exactly once with the focused row's item AND `event.preventDefault()` is called so the browser does not scroll the page

#### Scenario: Other keys do not activate the row

- **WHEN** `TableCommon` is rendered with an `onRowClick` callback AND the user focuses a row and presses any key other than Enter or Space (e.g., Tab, Escape, ArrowDown, the letter `a`)
- **THEN** the `onRowClick` callback is NOT invoked and the default browser behavior for that key is preserved

#### Scenario: tabIndex is set when onRowClick is provided

- **WHEN** `TableCommon` is rendered with an `onRowClick` callback
- **THEN** each rendered row `<tr>` has `tabIndex="0"` in the DOM

#### Scenario: No tabIndex and no keydown handler when onRowClick is absent

- **WHEN** `TableCommon` is rendered WITHOUT an `onRowClick` callback (i.e., the prop is omitted or `undefined`)
- **THEN** each rendered row `<tr>` has NO `tabIndex` attribute in the DOM AND pressing Enter or Space on a row does not trigger any callback

#### Scenario: Row remains a semantic tr element

- **WHEN** `TableCommon` is rendered with an `onRowClick` callback
- **THEN** each rendered row is a `<tr>` element with NO `role="button"`, `role="row"`, `role="grid"`, or `role="gridcell"` attribute added by this component

### Requirement: ColorDots shared component
The application SHALL provide a shared `ColorDots` component at `src/components/ColorDots/index.tsx` that renders a horizontal sequence of small circular swatches representing colors. The component SHALL accept an array of `{ hex: string; name: string }` objects via a `colors` prop and an optional `maxVisible` prop (default `4`). When `colors.length > maxVisible`, the first `maxVisible` swatches SHALL render and a "+N" overflow label SHALL render after them. Each swatch SHALL include the color's `name` as its `title` attribute for hover-tooltip accessibility. The component SHALL follow project component conventions (functional, `type` for props, explicit `React.JSX.Element` return).

#### Scenario: Render under the cap
- **WHEN** `ColorDots` is rendered with 3 colors and the default `maxVisible`
- **THEN** 3 circular swatches render with their `hex` backgrounds and no overflow label

#### Scenario: Render above the cap
- **WHEN** `ColorDots` is rendered with 6 colors and the default `maxVisible` of 4
- **THEN** 4 circular swatches render followed by a "+2" overflow label

#### Scenario: Hover tooltip
- **WHEN** a user hovers over any swatch
- **THEN** the browser shows the color's `name` as a native tooltip via the `title` attribute

#### Scenario: Reused by ProductStock
- **WHEN** the `ProductStock` page renders its product table
- **THEN** the colors column uses the shared `src/components/ColorDots` component (no inline duplicate of the helper exists in `src/pages/ProductStock/index.tsx`)

#### Scenario: Reused by tables gallery
- **WHEN** the Tables gallery renders its "With Color Dots" cell-content variant
- **THEN** the colors cell uses the same shared `src/components/ColorDots` component

### Requirement: StatusBadge component
The StatusBadge SHALL render color-coded badges for three statuses: Delivered (teal), Pending (yellow), and Rejected (red), with i18n translation support and a fixed width of `w-24`.

#### Scenario: Status color mapping
- **WHEN** StatusBadge receives status "Pending"
- **THEN** it renders a yellow badge with the translated "Pending" text

### Requirement: Button variant components
The application SHALL provide button components including ButtonDefault, ButtonDanger, ButtonGroup, and IconButton for consistent button styling across the application.

#### Scenario: Button rendering
- **WHEN** ButtonDefault is rendered with children and onClick
- **THEN** a styled default button renders with the correct theme-aware styling

### Requirement: Pagination component
The Pagination component SHALL use react-paginate with configurable items per page, page range display, and margin pages.

#### Scenario: Page change
- **WHEN** a user clicks a page number
- **THEN** the onPageChange callback is invoked with the selected page index

### Requirement: LoadingWrapper component
The LoadingWrapper SHALL conditionally render either a loading indicator or its children based on loading state. Its spinner SHALL take its colour from `var(--color-loading-accent)`, its accompanying text SHALL use `var(--color-text-secondary)`, and its overlay scrim SHALL be derived from the active theme's page background via `var(--color-scrim)`. None of these three SHALL be expressed with a Tailwind `dark:` variant or a numbered-palette class.

#### Scenario: Loading state
- **WHEN** loading is true
- **THEN** a loading indicator is displayed instead of children

#### Scenario: Loaded state
- **WHEN** loading is false
- **THEN** children are rendered

#### Scenario: Spinner colour per theme
- **WHEN** the loading indicator renders under light, dark, or forest
- **THEN** the spinner is that theme's loading accent rather than a neutral gray

#### Scenario: Scrim matches the surface it covers
- **WHEN** the overlay renders under the dark or forest theme
- **THEN** the scrim is a translucent form of that theme's page background, not the light theme's white, so the content behind it stays legibly dimmed rather than washed lighter

### Requirement: TableCommon loading overlay colour
The `TableCommon` loading overlay's spinner SHALL take its colour from `var(--color-loading-accent)`. The component's stylesheet SHALL NOT carry a `:global(.dark)` override for the spinner: `ThemeContext` sets only the `data-theme` attribute and never applies a `.dark` class, so such a rule can never match.

#### Scenario: Overlay spinner per theme
- **WHEN** `TableCommon` renders with `loading` true under any theme
- **THEN** the overlay spinner is that theme's loading accent

#### Scenario: No unreachable theme selector
- **WHEN** `TableCommon.module.scss` is inspected
- **THEN** it contains no `:global(.dark)` spinner rule, because the class it targets is never applied to the document

### Requirement: Component conventions
All components SHALL follow these conventions: functional components with TypeScript, `type` keyword for props (not `interface`), explicit `React.JSX.Element` return type, `cn()` helper for class composition, and lucide-react icons at standard sizes (w-4 h-4 small, w-5 h-5 default, w-6 h-6 large).

#### Scenario: New component creation
- **WHEN** a new component is created
- **THEN** it uses a `type` for props, `cn()` for classes, functional style, and lucide-react icons at standard sizes
