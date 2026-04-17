# deal-details-table Specification

## Purpose
Defines the DealDetailsTable — a typed view over the generic TableCommon with status badges, pagination, month filtering, and `useDeals` data source.

## Requirements

### Requirement: TableCommon generic integration
The DealDetailsTable SHALL use the generic `TableCommon<Deal>` component for rendering, passing column definitions and a custom `renderCell` function.

#### Scenario: Generic table rendering
- **WHEN** DealDetailsTable renders
- **THEN** it passes Deal-typed column definitions and cell renderer to TableCommon

### Requirement: Deal table columns
The DealDetailsTable SHALL display columns for: Name, Location, DateTime, Amount, Price, and Status.

#### Scenario: Column display
- **WHEN** deal data is rendered in the table
- **THEN** all 6 columns (Name, Location, DateTime, Amount, Price, Status) are visible

### Requirement: Status badges in deal table
The Status column SHALL use the StatusBadge component to render color-coded badges for Delivered (teal), Pending (yellow), and Rejected (red) statuses.

#### Scenario: Status badge colors
- **WHEN** a deal has status "Delivered"
- **THEN** a teal-colored StatusBadge is displayed

### Requirement: Deal table pagination
The DealDetailsTable SHALL support pagination with 10 items per page using the built-in TableCommon pagination.

#### Scenario: Page navigation
- **WHEN** there are more than 10 deals
- **THEN** pagination controls appear and allow navigation between pages

### Requirement: Deal table month filter
The DealDetailsTable SHALL include a month dropdown filter for filtering deals by period.

#### Scenario: Month filter selection
- **WHEN** a user selects a different month
- **THEN** the table updates to show deals for the selected period

### Requirement: Data from useDeals hook
The DealDetailsTable SHALL source its data from the `useDeals()` React Query hook.

#### Scenario: Data loading
- **WHEN** DealDetailsTable mounts
- **THEN** it calls `useDeals()` to fetch deal data
