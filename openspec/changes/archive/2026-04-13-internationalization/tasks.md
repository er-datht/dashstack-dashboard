## 1. Verify i18n Configuration

- [ ] 1.1 Confirm `i18n.ts` exists at project root (not in src/)
- [ ] 1.2 Confirm i18next uses HttpBackend and LanguageDetector plugins
- [ ] 1.3 Confirm supported languages are `["en", "jp"]` with "en" as fallback
- [ ] 1.4 Confirm 11 namespaces are registered: common, navigation, auth, dashboard, products, orders, settings, todo, theme, errors, messages
- [ ] 1.5 Confirm detection order: localStorage → navigator → htmlTag

## 2. Verify Translation Files

- [ ] 2.1 Confirm `public/locales/en/` contains JSON files for all 11+ namespaces
- [ ] 2.2 Confirm `public/locales/jp/` mirrors the English namespace structure
- [ ] 2.3 Confirm on-demand namespaces (favorites.json, pricing.json) exist in both locales

## 3. Verify LanguageSwitcher Component

- [ ] 3.1 Confirm LanguageSwitcher renders in TopNav with flag icons and language names
- [ ] 3.2 Confirm dropdown opens on hover
- [ ] 3.3 Confirm language selection calls `i18n.changeLanguage()` and updates all UI text
- [ ] 3.4 Confirm current language shows checkmark indicator

## 4. Verify Integration

- [ ] 4.1 Confirm `src/index.tsx` imports i18n.ts before rendering
- [ ] 4.2 Confirm all navigation labels use `t()` function
- [ ] 4.3 Confirm language persistence to localStorage under `"i18nextLng"` key
