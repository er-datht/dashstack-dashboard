## MODIFIED Requirements

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
