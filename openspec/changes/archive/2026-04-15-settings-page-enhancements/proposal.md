## Why

The Settings page logo upload area only supports click-to-upload. Drag & drop is a standard UX expectation for file upload areas. Additionally, the form fields lack placeholder text, making the form feel empty and providing no input hints to the user.

## What Changes

- Add drag & drop support to the logo upload circle area with visual feedback (highlight border on dragover)
- Add placeholder text to all 5 form fields (Site Name, Copyright, SEO Title, SEO Keywords, SEO Description)
- Add new translation keys for placeholder strings in both en and jp locales

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `settings-general-form`: Adding drag & drop behavior to logo upload area and placeholder text to form fields

## Impact

- **Files modified**: `src/pages/Settings/index.tsx` (drag & drop handlers, placeholder attributes), `public/locales/en/settings.json`, `public/locales/jp/settings.json` (placeholder keys)
- **No new dependencies**
