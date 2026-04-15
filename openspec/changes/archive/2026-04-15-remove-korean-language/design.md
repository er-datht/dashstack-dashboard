## Context

Korean was added as the third language (after en/jp) in the `add-korean-language` change. It touches: `i18n.ts` config, `LanguageSwitcher` component, and 14 translation files in `public/locales/ko/`. The LanguageSwitcher dynamically maps over a languages array, so removal is a clean deletion with no structural changes needed.

## Goals / Non-Goals

**Goals:**
- Completely remove Korean language support from runtime, UI, translation files, specs, and documentation
- Ensure graceful fallback for users who had Korean selected

**Non-Goals:**
- Changing any other i18n behavior or configuration
- Modifying English or Japanese translations
- Changing the LanguageSwitcher component structure

## Decisions

1. **Delete entire `public/locales/ko/` directory** rather than individual files — cleaner and ensures no orphaned files. All 14 namespace files are removed.
2. **No migration code needed** — i18next's `fallbackLng: "en"` already handles the case where a stored language is no longer supported. Users with `"ko"` in localStorage will automatically fall back to English.
3. **Remove the OpenSpec spec** (`openspec/specs/korean-language-support/`) since the capability no longer exists.
4. **Update docs inline** — README.md and CLAUDE.md references updated in the same change.

## Risks / Trade-offs

- [Users with ko in localStorage see English instead] → Acceptable; fallbackLng handles this gracefully with no errors.
- [Archived change history preserved] → The `openspec/changes/archive/2026-04-13-add-korean-language/` directory stays as historical record.
