## 1. Remove i18n Configuration

- [x] 1.1 Remove "ko" from `supportedLngs` array in `i18n.ts`
- [x] 1.2 Remove "ko" from `preload` array in `i18n.ts`

## 2. Update LanguageSwitcher Component

- [x] 2.1 Remove Korean language entry (`{ code: "ko", label: "한국어", flag: "🇰🇷" }`) from languages array in `src/components/LanguageSwitcher/index.tsx`

## 3. Delete Korean Translation Files

- [x] 3.1 Delete entire `public/locales/ko/` directory (14 files)

## 4. Remove OpenSpec Spec and Update Stale Specs

- [x] 4.1 Delete `openspec/specs/korean-language-support/` directory
- [x] 4.2 Update `openspec/specs/order-data-layer/spec.md` — remove Korean translation scenario/references
- [x] 4.3 Update `openspec/specs/event-participants-input/spec.md` — change "en, jp, or ko" to "en or jp"

## 5. Update Documentation

- [x] 5.1 Update README.md — remove Korean references from i18n description, tech stack, and i18n section
- [x] 5.2 Update CLAUDE.md — remove "ko" from Project Overview and Internationalization section, update existing specs list entry #9 to note Korean was removed by this change
