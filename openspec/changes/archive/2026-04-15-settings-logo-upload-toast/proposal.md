## Why

When a user uploads a logo (via click or drag & drop), there is no visual confirmation that it was accepted. A toast notification provides clear feedback, consistent with the existing save-success toast pattern.

## What Changes

- Show a success toast notification when a logo file is successfully uploaded
- Reuse the existing toast state/rendering already in the Settings component
- Add a new translation key for the upload success message

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `settings-general-form`: Adding toast feedback on successful logo upload

## Impact

- **Files modified**: `src/pages/Settings/index.tsx` (trigger toast on logo upload), `public/locales/en/settings.json`, `public/locales/jp/settings.json` (new key)
