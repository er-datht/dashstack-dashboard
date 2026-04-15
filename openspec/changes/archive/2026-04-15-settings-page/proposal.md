## Why

The Settings page placeholder currently shows static text with no functional UI. The Figma design (node 5:4082) specifies a "General Settings" form with logo upload and editable site configuration fields. Implementing this gives users a functional settings experience matching the design system.

## What Changes

- Replace the placeholder Settings page (`src/pages/Settings/index.tsx`) with a full General Settings form
- Add a logo upload area (camera icon placeholder + "Upload Logo" clickable text) centered at the top of the form card
- Add a 2-column form layout with 5 fields:
  - Row 1: two text inputs side-by-side (Site Name, Copy Right)
  - Row 2: left column has two stacked text inputs (SEO Title, SEO Keywords), right column has one textarea (SEO Description) matching the height of the two stacked inputs
- Add a centered "Save" button at the bottom of the form card
- Form sits in a white (theme-adaptive) rounded card on a light background
- All fields use local component state (no API integration — UI only for now)
- Support all 3 themes (light, dark, forest) via existing CSS custom properties

## Capabilities

### New Capabilities
- `settings-general-form`: General Settings page UI — logo upload area, 5-field form layout, save button, theme support, i18n

### Modified Capabilities

(none — no existing spec requirements change)

## Impact

- **Files modified**: `src/pages/Settings/index.tsx` (full rewrite of placeholder)
- **New files**: None expected (translations and types already exist)
- **Translation keys**: Will use existing keys from `settings.json` namespace; may add a few new keys for field labels (siteName, copyright, seoTitle, seoKeywords, seoDescription, uploadLogo)
- **Dependencies**: No new packages — uses existing lucide-react icons, react-i18next, Tailwind utilities
- **Types**: May extend or adjust `src/types/settings.ts` to add general settings fields if needed
