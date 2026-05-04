# sidebar-navigation Specification

## Purpose
Defines the sidebar's section-based structure, i18n-integrated labels, bottom action items, Lucide icons, and collapsed-mode tooltips.
## Requirements
### Requirement: Section-based navigation structure
The sidebar navigation SHALL organize items into named sections using the `getNavSections(t)` function, currently defining "DASHBOARD" (6 items) and "PAGES" (8 items) sections. The PAGES section's UI Elements entry SHALL use the id `ui-elements`, label key `navigation:uiElements`, and route reference `ROUTES.UI_ELEMENTS`.

#### Scenario: Navigation sections rendered
- **WHEN** the sidebar renders
- **THEN** it displays navigation items grouped under "DASHBOARD" and "PAGES" section headers

#### Scenario: UI Elements nav entry uses plural identifiers
- **WHEN** the sidebar renders the PAGES section
- **THEN** the UI Elements item has id `ui-elements`, label translated from `navigation:uiElements` (rendering "UI Elements" / "UI要素"), the Layers icon, and links to `ROUTES.UI_ELEMENTS`

### Requirement: i18n-integrated navigation labels
All navigation item labels SHALL use the `t()` translation function for internationalization support. The UI Elements label SHALL come from the `navigation:uiElements` key (plural).

#### Scenario: Language switch affects navigation
- **WHEN** the user switches language from English to Japanese
- **THEN** all sidebar navigation labels update to their Japanese translations, including "UI Elements" → "UI要素"

#### Scenario: UI Elements label uses plural key
- **WHEN** the sidebar renders the UI Elements item
- **THEN** the label is fetched via `t("navigation:uiElements")` and not the legacy `t("navigation:uiElement")` key

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

### Requirement: Active-state highlighting for sub-routes
The sidebar SHALL keep the parent nav item highlighted when the current path is a sub-route of that item's route. Active-state resolution SHALL use exact matching first, then fall back to longest-prefix matching (appending `/` to avoid partial collisions). The root route (`/`) and `/dashboard` SHALL be excluded from prefix matching to prevent false positives. If no match is found, the sidebar SHALL default to highlighting "Dashboard".

#### Scenario: Team detail page keeps Team selected
- **WHEN** the user navigates to `/team/123`
- **THEN** the sidebar highlights the "Team" nav item as active

#### Scenario: Add Team page keeps Team selected
- **WHEN** the user navigates to `/team/add`
- **THEN** the sidebar highlights the "Team" nav item as active

#### Scenario: Contact detail page keeps Contact selected
- **WHEN** the user navigates to `/contact/456`
- **THEN** the sidebar highlights the "Contact" nav item as active

#### Scenario: Add Contact page keeps Contact selected
- **WHEN** the user navigates to `/contact/add`
- **THEN** the sidebar highlights the "Contact" nav item as active

#### Scenario: Exact match still takes priority
- **WHEN** the user navigates to `/team` (exact route)
- **THEN** the sidebar highlights the "Team" nav item via exact match, not prefix match

#### Scenario: No prefix collision between similar routes
- **WHEN** the user navigates to `/product-stock`
- **THEN** the sidebar highlights "Stock" (exact match), not "Products" (`/products` is not a prefix of `/product-stock`)

