## Why

DashStack currently supports English and Japanese. Adding Korean as a third language expands the application's reach to Korean-speaking users and validates the i18n system's ability to scale beyond two languages.

## What Changes

- Add Korean (`ko`) as a supported language in the i18next configuration
- Update the LanguageSwitcher component to include Korean with its flag and label
- Create 13 Korean translation files covering all existing namespaces (common, navigation, auth, dashboard, products, orders, settings, todo, theme, errors, messages, favorites, pricing)

## Capabilities

### New Capabilities
- `korean-language-support`: Korean language translation files, i18n config registration, and LanguageSwitcher integration

### Modified Capabilities

## Impact

- `i18n.ts` — add `ko` to `supportedLngs` and `preload` arrays
- `src/components/LanguageSwitcher/index.tsx` — add Korean entry to `languages` array
- `public/locales/ko/` — 13 new JSON translation files
- No breaking changes, no new dependencies, no API changes
