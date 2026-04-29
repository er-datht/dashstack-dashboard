## ADDED Requirements

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
