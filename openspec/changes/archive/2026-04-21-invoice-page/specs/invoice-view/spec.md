# Invoice View Specification

## Purpose
Defines the invoice page layout with sender/recipient header, items table, total calculation, and action buttons.

## ADDED Requirements

### Requirement: Invoice page header
The page displays an "Invoice" title at the top left, consistent with other dashboard pages.

#### Scenario: Page title displayed
- **WHEN** the user navigates to the Invoice page
- **THEN** "Invoice" title is shown at top left in bold text

### Requirement: Invoice card with sender/recipient/dates
A card contains three sections in a row: Invoice From (left), Invoice To (center), and dates (right).

#### Scenario: Sender info displayed
- **WHEN** the invoice card renders
- **THEN** "Invoice From :" label is shown with sender name in bold and address below

#### Scenario: Recipient info displayed
- **WHEN** the invoice card renders
- **THEN** "Invoice To :" label is shown with recipient name in bold and location below

#### Scenario: Dates displayed
- **WHEN** the invoice card renders
- **THEN** "Invoice Date :" and "Due Date" are shown with their respective date values

### Requirement: Items table
A table with 5 columns displays line items with a header row and data rows.

#### Scenario: Table columns
- **WHEN** the items table renders
- **THEN** columns are: Serial No., Description, Quantity, Base Cost, Total Cost

#### Scenario: Table rows with mock data
- **WHEN** the items table renders
- **THEN** 4 rows are shown: Children Toy (qty 2, $20, $80), Makeup (qty 2, $50, $100), Asus Laptop (qty 5, $100, $500), Iphone X (qty 4, $1000, $4000)

#### Scenario: Table header styling
- **WHEN** the table header renders
- **THEN** it has a light background tint (`bg-surface-secondary`) distinguishing it from data rows

#### Scenario: Table row styling
- **WHEN** the data rows render
- **THEN** row text uses `text-primary` for readability and rows are separated by light `border-border-muted` dividers

### Requirement: Total calculation
A total row appears below the table showing the sum of all item total costs.

#### Scenario: Total displayed
- **WHEN** the items table renders
- **THEN** "Total = $4680" is displayed right-aligned below the table

### Requirement: Action buttons
Print and Send buttons appear at the bottom right of the card.

#### Scenario: Print button
- **WHEN** the user clicks the Print icon button
- **THEN** a "Coming soon" toast notification appears

#### Scenario: Send button
- **WHEN** the user clicks the Send button (blue, with send icon)
- **THEN** a "Coming soon" toast notification appears

### Requirement: Theme support
The invoice page supports all 3 themes.

#### Scenario: Theme adaptation
- **WHEN** the theme changes between light, dark, and forest
- **THEN** the card background, text colors, table borders, and button colors adapt using theme tokens

### Requirement: Internationalization
All visible text uses i18n translation keys from the `invoice` namespace.

#### Scenario: Language switching
- **WHEN** the user switches language between en and jp
- **THEN** all labels (Invoice From, Invoice To, column headers, Total, Send, etc.) display in the selected language
