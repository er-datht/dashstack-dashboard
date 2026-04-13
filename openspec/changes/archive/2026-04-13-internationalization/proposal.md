## Why

Document the internationalization (i18n) system of DashStack. The application supports English and Japanese using i18next with namespace-based translation organization, HTTP backend loading, and automatic language detection. This spec captures the translation architecture, namespace structure, and component integration patterns to ensure consistent multi-language support across all features.

## What Changes

- Document i18next configuration with HttpBackend and LanguageDetector
- Document the 11 registered + 2 on-demand translation namespaces
- Document translation file structure and location conventions
- Document the LanguageSwitcher component and language selection UX
- Document the `t()` function usage convention for all UI text

## Capabilities

### New Capabilities
- `i18n-config`: i18next setup with HttpBackend, LanguageDetector, namespace registration, and detection/persistence strategy
- `language-switcher`: LanguageSwitcher component with flag icons, hover dropdown, and i18n.changeLanguage integration

### Modified Capabilities

## Impact

- **Files**: `i18n.ts` (project root), `public/locales/{en|jp}/*.json`, `src/components/LanguageSwitcher/index.tsx`
- **Convention**: All UI text must use the `t()` function from react-i18next
- **Convention**: New features must add translations to both `en` and `jp` locale directories
- **Convention**: `i18n.ts` is at the project root, not in `src/`
