# product-stock Specification

## Purpose
Defines the ProductStock page: search filter, table columns, ColorDots rendering, pagination, and action-button stubs.

## Requirements

### Requirement: Product stock table with search
The ProductStock page SHALL display a data table of product stock items with a search input that filters products by name.

#### Scenario: Search filtering
- **WHEN** a user types "shirt" in the search input
- **THEN** only products with "shirt" in their name are displayed

### Requirement: Product stock columns
The ProductStock table SHALL display columns for: product Image, Name, Category, Price, Amount (stock count), and Available Colors.

#### Scenario: Column rendering
- **WHEN** the ProductStock page renders
- **THEN** all 6 columns are visible with appropriate data

### Requirement: ColorDots component
The Available Colors column SHALL use a ColorDots component that displays up to 4 color circles, with a "+N" count indicator if there are more.

#### Scenario: More than 4 colors
- **WHEN** a product has 6 available colors
- **THEN** 4 color dots are displayed plus a "+2" indicator

### Requirement: Product stock pagination
The ProductStock page SHALL paginate results with 10 items per page.

#### Scenario: Pagination controls
- **WHEN** there are more than 10 product stock items
- **THEN** pagination controls appear allowing navigation between pages

### Requirement: Action stubs
The ProductStock page SHALL display Edit and Delete action buttons for each row, currently implemented as stubs (TODO).

#### Scenario: Action buttons present
- **WHEN** a product stock row renders
- **THEN** Edit and Delete action buttons are visible (currently non-functional stubs)
