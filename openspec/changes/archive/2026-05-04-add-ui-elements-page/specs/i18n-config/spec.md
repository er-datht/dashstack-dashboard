## MODIFIED Requirements

### Requirement: Namespace-based translation organization
Translations SHALL be organized into namespaces. The following 17 namespaces SHALL be registered at initialization: common, navigation, auth, dashboard, products, orders, settings, todo, theme, errors, messages, calendar, contact, team, invoice, inbox, uiElements. Additional namespaces (favorites, pricing) SHALL be loaded on-demand by components that need them.

#### Scenario: Namespace loading at init
- **WHEN** the application starts
- **THEN** the 17 registered namespaces are available for use, including `uiElements`

#### Scenario: On-demand namespace loading
- **WHEN** a component needs the "favorites" or "pricing" namespace
- **THEN** it loads the namespace on-demand using `useTranslation('favorites')`

#### Scenario: uiElements namespace available on UI Elements page
- **WHEN** the UI Elements page renders and calls `useTranslation('uiElements')`
- **THEN** the namespace is already loaded and translation lookups succeed without an extra HTTP fetch
