## MODIFIED Requirements

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

## ADDED Requirements

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
