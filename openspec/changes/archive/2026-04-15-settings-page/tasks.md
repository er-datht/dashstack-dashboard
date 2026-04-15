## 1. Types and Translations

- [x] 1.1 Add `GeneralSettings` type to `src/types/settings.ts` with fields: siteName, copyright, seoTitle, seoKeywords, seoDescription, logoUrl
- [x] 1.2 Add new translation keys to `public/locales/en/settings.json`: siteName, copyright, seoTitle, seoKeywords, seoDescription, uploadLogo, and required-field error message
- [x] 1.3 Add corresponding Japanese translations to `public/locales/jp/settings.json`

## 2. Settings Page Implementation

- [x] 2.1 Rewrite `src/pages/Settings/index.tsx` with page heading "General Settings" (no icon header — just the text heading matching Figma) using `useTranslation("settings")`
- [x] 2.2 Implement logo upload area: circular camera icon placeholder, hidden file input, "Upload Logo" clickable text, image preview on selection, remove logo button when image selected
- [x] 2.3 Implement 2-column form layout — Row 1: Site Name + Copyright side-by-side; Row 2: SEO Title + SEO Keywords stacked left, SEO Description textarea right. Responsive: collapse to 1 column below md breakpoint
- [x] 2.4 Wire up form state with `useState` for all 5 fields + logo file. Mark Site Name, Copyright, SEO Title, SEO Keywords as required with validation on save
- [x] 2.5 Implement centered Save button with loading spinner state, simulated delay, and success toast notification

## 3. Theme and Styling

- [x] 3.1 Apply theme-adaptive styles using CSS custom properties and Tailwind utility classes (card bg, input bg, borders, text colors) for light/dark/forest
- [x] 3.2 Ensure textarea height matches the combined height of two stacked inputs + gap on desktop; standard height on mobile
