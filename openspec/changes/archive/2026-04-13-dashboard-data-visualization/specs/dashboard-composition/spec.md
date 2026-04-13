## ADDED Requirements

### Requirement: Dashboard stat cards
The Dashboard page SHALL display 4 stat cards showing Total Users, Total Orders, Total Sales, and Total Revenue, each with an icon, current value, and trend indicator.

#### Scenario: Stat cards rendered
- **WHEN** the Dashboard page loads
- **THEN** 4 stat cards are displayed with their respective metrics, icons, and trend percentages

### Requirement: Dashboard chart section
The Dashboard page SHALL display a RevenueChart and a SalesDetailsChart side by side below the stat cards.

#### Scenario: Charts rendered
- **WHEN** the Dashboard page loads
- **THEN** both RevenueChart and SalesDetailsChart render with their default data

### Requirement: Dashboard deals table
The Dashboard page SHALL display a DealDetailsTable below the charts with month filtering and pagination.

#### Scenario: Deals table rendered
- **WHEN** the Dashboard page loads
- **THEN** the DealDetailsTable shows deal records with pagination controls
