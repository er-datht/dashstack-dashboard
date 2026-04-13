## ADDED Requirements

### Requirement: i18next with HttpBackend and LanguageDetector
The i18n system SHALL use i18next with react-i18next bindings, i18next-http-backend for loading translation files, and i18next-browser-languagedetector for automatic language detection.

#### Scenario: Translation file loading
- **WHEN** the application initializes
- **THEN** i18next loads translation JSON files from `/public/locales/{language}/{namespace}.json` via HTTP backend

### Requirement: Supported languages
The i18n system SHALL support exactly two languages: English (`en`) as the default/fallback and Japanese (`jp`).

#### Scenario: Fallback to English
- **WHEN** a translation key is missing in the Japanese locale
- **THEN** the English translation is displayed as fallback

#### Scenario: Valid language codes
- **WHEN** a language is selected
- **THEN** it MUST be one of `"en"` or `"jp"`

### Requirement: Namespace-based translation organization
Translations SHALL be organized into namespaces. The following 11 namespaces SHALL be registered at initialization: common, navigation, auth, dashboard, products, orders, settings, todo, theme, errors, messages. Additional namespaces (favorites, pricing) SHALL be loaded on-demand by components that need them.

#### Scenario: Namespace loading at init
- **WHEN** the application starts
- **THEN** the 11 registered namespaces are available for use

#### Scenario: On-demand namespace loading
- **WHEN** a component needs the "favorites" or "pricing" namespace
- **THEN** it loads the namespace on-demand using `useTranslation('favorites')`

### Requirement: Language detection and persistence
The language detector SHALL check sources in order: localStorage (key `"i18nextLng"`) → browser navigator language → HTML lang attribute. The selected language SHALL be cached in localStorage.

#### Scenario: Persisted language restored
- **WHEN** the application loads and localStorage contains `"i18nextLng"` value
- **THEN** that language is used without checking other sources

#### Scenario: Browser language detection
- **WHEN** no localStorage value exists and the browser is set to Japanese
- **THEN** Japanese (`jp`) is detected and applied

### Requirement: i18n config at project root
The i18n configuration file SHALL be located at the project root as `i18n.ts`, not inside the `src/` directory. The entry point (`src/index.tsx`) SHALL import it before rendering.

#### Scenario: Config file location
- **WHEN** a developer needs to modify i18n configuration
- **THEN** they edit `/i18n.ts` at the project root

### Requirement: All UI text uses t() function
All user-visible text in the application SHALL use the `t()` function from react-i18next for translation support. Hardcoded strings MUST NOT be used for UI text.

#### Scenario: Translatable component text
- **WHEN** a component displays text to the user
- **THEN** it uses `t('namespace:key')` or `t('key')` with a namespace from `useTranslation`
