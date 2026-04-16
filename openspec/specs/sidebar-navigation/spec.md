# sidebar-navigation Specification

## Purpose
Defines the sidebar's section-based structure, i18n-integrated labels, bottom action items, Lucide icons, and collapsed-mode tooltips.

## Requirements

### Requirement: Section-based navigation structure
The sidebar navigation SHALL organize items into named sections using the `getNavSections(t)` function, currently defining "DASHBOARD" (6 items) and "PAGES" (8 items) sections.

#### Scenario: Navigation sections rendered
- **WHEN** the sidebar renders
- **THEN** it displays navigation items grouped under "DASHBOARD" and "PAGES" section headers

### Requirement: i18n-integrated navigation labels
All navigation item labels SHALL use the `t()` translation function for internationalization support.

#### Scenario: Language switch affects navigation
- **WHEN** the user switches language from English to Japanese
- **THEN** all sidebar navigation labels update to their Japanese translations

### Requirement: Bottom action items
The sidebar SHALL display bottom action items (Settings, Theme toggle, Logout) via `getBottomItems(t)`, separate from the main navigation sections.

#### Scenario: Bottom items rendered
- **WHEN** the sidebar renders
- **THEN** Settings, Theme toggle, and Logout appear at the bottom of the sidebar

### Requirement: Lucide React icons
All navigation items SHALL use lucide-react icons for visual identification.

#### Scenario: Icon rendering
- **WHEN** a navigation item renders
- **THEN** it displays its associated lucide-react icon alongside the label

### Requirement: Tooltip support in collapsed mode
The sidebar SHALL display tooltips (via react-tooltip) for navigation items when in collapsed mode since labels are hidden.

#### Scenario: Collapsed sidebar tooltips
- **WHEN** the sidebar is collapsed and a user hovers over a navigation icon
- **THEN** a tooltip appears showing the navigation item label
