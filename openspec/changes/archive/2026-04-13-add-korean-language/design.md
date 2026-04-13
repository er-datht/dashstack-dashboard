## Context

DashStack uses i18next with HttpBackend to load translations from `public/locales/{lng}/{ns}.json`. The LanguageSwitcher component renders a dropdown of available languages. Currently two languages are supported: English (`en`) and Japanese (`jp`). The i18n infrastructure is already designed to scale — adding a new language requires no architectural changes.

## Goals / Non-Goals

**Goals:**
- Add Korean (`ko`) as a fully supported language across all 13 translation namespaces
- Integrate Korean into the existing LanguageSwitcher UI
- Ensure Korean is preloaded and detectable by the language detector

**Non-Goals:**
- Changing the i18n architecture or loading strategy
- Adding RTL support or other layout changes
- Adding language-specific date/number formatting beyond what i18next already provides

## Decisions

**3 touchpoints, no new patterns:**
1. `i18n.ts` — Add `"ko"` to both `supportedLngs` and `preload` arrays. This is the minimal config change to register a new language.
2. `src/components/LanguageSwitcher/index.tsx` — Add a Korean entry (`{ code: "ko", label: "한국어", flag: "🇰🇷" }`) to the `languages` array. The component already maps over this array dynamically.
3. `public/locales/ko/` — Create 13 JSON files mirroring the English source structure. All interpolation variables (`{{from}}`, `{{to}}`, `{{total}}`, etc.) are preserved exactly.

**Why mirror English, not Japanese?** English is the fallback language and the canonical source of truth for translation keys. Translating from English ensures completeness.

## Risks / Trade-offs

- [Translation quality] Manual translation may have inaccuracies → Can be refined later without code changes, only JSON file edits needed.
- [Bundle size] 13 additional JSON files → Minimal impact since HttpBackend loads files on-demand per namespace, not all at once.
