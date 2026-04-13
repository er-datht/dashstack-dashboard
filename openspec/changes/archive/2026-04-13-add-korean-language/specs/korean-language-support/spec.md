## ADDED Requirements

### Requirement: Korean language registration
The i18n configuration SHALL include `"ko"` in the `supportedLngs` array and `preload` array so that Korean is recognized as a valid language and preloaded at startup.

#### Scenario: Korean is a supported language
- **WHEN** the application initializes i18next
- **THEN** `"ko"` MUST be present in the `supportedLngs` configuration
- **AND** `"ko"` MUST be present in the `preload` configuration

### Requirement: Korean language selection in UI
The LanguageSwitcher component SHALL display Korean as a selectable option with the label "한국어" and the flag emoji "🇰🇷".

#### Scenario: Korean appears in language dropdown
- **WHEN** the user opens the LanguageSwitcher dropdown
- **THEN** a Korean option MUST be displayed with code `"ko"`, label `"한국어"`, and flag `"🇰🇷"`

#### Scenario: Selecting Korean switches the language
- **WHEN** the user selects the Korean option from the LanguageSwitcher
- **THEN** `i18n.changeLanguage("ko")` MUST be called
- **AND** all UI text MUST render in Korean

### Requirement: Korean translation files
The application SHALL provide Korean translation JSON files for all 13 namespaces at `public/locales/ko/{namespace}.json`.

#### Scenario: All namespaces have Korean translations
- **WHEN** the language is set to `"ko"`
- **THEN** translation files MUST exist for: common, navigation, auth, dashboard, products, orders, settings, todo, theme, errors, messages, favorites, pricing

#### Scenario: Translation keys match English source
- **WHEN** comparing any Korean translation file to its English counterpart
- **THEN** the Korean file MUST contain all the same keys (including nested keys)
- **AND** all interpolation variables (e.g., `{{from}}`, `{{to}}`, `{{total}}`) MUST be preserved exactly

### Requirement: Korean language persistence
The language selection SHALL persist across page reloads via localStorage.

#### Scenario: Korean persists on reload
- **WHEN** the user selects Korean and reloads the page
- **THEN** the `i18nextLng` localStorage key MUST be set to `"ko"`
- **AND** the application MUST load in Korean without user interaction
