# shared-components Specification

## Purpose
Defines the shared UI building blocks: TableCommon, StatusBadge, button variants, Pagination, LoadingWrapper, and the component conventions all new components must follow.

## Requirements

### Requirement: Generic TableCommon component
The `TableCommon<T>` component SHALL accept typed column definitions (`ColumnDefinition<T>[]`), data array (`T[]`), and a `renderCell(item: T, column: ColumnDefinition<T>)` callback for custom cell rendering. It SHALL support optional pagination, column alignment (left/center/right), column widths, and a loading overlay.

#### Scenario: Typed table rendering
- **WHEN** `TableCommon<Deal>` is rendered with Deal-typed columns and data
- **THEN** the table renders with type-safe column definitions and cell rendering

#### Scenario: Loading overlay
- **WHEN** the `loading` prop is true
- **THEN** a loading overlay with spinner is displayed over the table

#### Scenario: Pagination integration
- **WHEN** `hasPagination` is true with pageCount and pageCurrent props
- **THEN** pagination controls render below the table

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
The LoadingWrapper SHALL conditionally render either a loading indicator or its children based on loading state.

#### Scenario: Loading state
- **WHEN** loading is true
- **THEN** a loading indicator is displayed instead of children

#### Scenario: Loaded state
- **WHEN** loading is false
- **THEN** children are rendered

### Requirement: Component conventions
All components SHALL follow these conventions: functional components with TypeScript, `type` keyword for props (not `interface`), explicit `React.JSX.Element` return type, `cn()` helper for class composition, and lucide-react icons at standard sizes (w-4 h-4 small, w-5 h-5 default, w-6 h-6 large).

#### Scenario: New component creation
- **WHEN** a new component is created
- **THEN** it uses a `type` for props, `cn()` for classes, functional style, and lucide-react icons at standard sizes
