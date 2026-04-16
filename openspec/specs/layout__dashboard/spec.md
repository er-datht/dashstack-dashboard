# dashboard-layout Specification

## Purpose
Defines the shared dashboard chrome — a fixed sidebar (with collapse), a fixed top navigation bar, and the main content area with smooth transitions.

## Requirements

### Requirement: Fixed sidebar with collapse toggle
The DashboardLayout SHALL render a fixed-position sidebar on the left side that supports collapsing between expanded (256px) and collapsed (80px) widths.

#### Scenario: Sidebar expanded state
- **WHEN** the sidebar is in expanded state
- **THEN** it displays at 256px width with full navigation labels and the main content area has 256px left margin

#### Scenario: Sidebar collapsed state
- **WHEN** the sidebar is collapsed
- **THEN** it displays at 80px width with icons only and the main content area has 80px left margin

### Requirement: Fixed top navigation bar
The DashboardLayout SHALL render a fixed-position TopNav bar at the top that adjusts its left position based on sidebar collapse state.

#### Scenario: TopNav positioning
- **WHEN** the sidebar collapse state changes
- **THEN** the TopNav left offset adjusts to match the sidebar width

### Requirement: Main content area with smooth transitions
The main content area SHALL transition smoothly between sidebar states using CSS transitions on margin/padding.

#### Scenario: Sidebar toggle animation
- **WHEN** the user toggles the sidebar collapse
- **THEN** the main content area smoothly transitions its left margin
