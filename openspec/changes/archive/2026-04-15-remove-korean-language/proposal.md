## Why

Korean language support is being removed to reduce the supported language set back to English and Japanese. This reverses the `add-korean-language` change.

## What Changes

- Remove `"ko"` from i18n.ts `supportedLngs` and `preload` arrays
- Remove Korean entry from `LanguageSwitcher` component languages array
- **BREAKING**: Delete all 14 Korean translation files in `public/locales/ko/`
- Remove `openspec/specs/korean-language-support/` spec directory
- Update README.md and CLAUDE.md to reflect en/jp only

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `internationalization`: Supported languages reduced from en/jp/ko to en/jp. Korean registration, preloading, and UI selection removed.

## Impact

- **i18n config** (`i18n.ts`): Two array entries removed
- **LanguageSwitcher** (`src/components/LanguageSwitcher/index.tsx`): One object removed from languages array
- **Translation files**: `public/locales/ko/` directory (14 files) deleted
- **Specs**: `openspec/specs/korean-language-support/` removed
- **Docs**: README.md, CLAUDE.md updated
- **Runtime**: Users with `"ko"` in localStorage fall back to `fallbackLng: "en"` automatically
