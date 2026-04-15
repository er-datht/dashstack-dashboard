## 1. Translations

- [x] 1.1 Add `logoUploaded` translation key to `public/locales/en/settings.json` and `public/locales/jp/settings.json`

## 2. Toast Generalization and Logo Upload Trigger

- [x] 2.1 Replace `showToast` boolean with `toastMessage` string state in `src/pages/Settings/index.tsx`; render toast when `toastMessage` is non-empty, auto-dismiss clears it
- [x] 2.2 Update `handleSave` to set `toastMessage` to `t("settingsSaved")` instead of `setShowToast(true)`
- [x] 2.3 Trigger toast with `t("logoUploaded")` message in `applyLogoFile` after successful file validation
