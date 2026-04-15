## 1. Translations

- [x] 1.1 Add placeholder translation keys to `public/locales/en/settings.json`: siteNamePlaceholder, copyrightPlaceholder, seoTitlePlaceholder, seoKeywordsPlaceholder, seoDescriptionPlaceholder
- [x] 1.2 Add corresponding Japanese placeholder translations to `public/locales/jp/settings.json`

## 2. Drag & Drop on Logo Upload

- [x] 2.1 Add `isDragging` state and drag event handlers (`onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop`) to the circular upload area in `src/pages/Settings/index.tsx`
- [x] 2.2 Apply visual feedback: solid primary border on dragover, revert to dashed on drag leave/drop
- [x] 2.3 Reuse existing file validation (type + size) for dropped files

## 3. Form Field Placeholders

- [x] 3.1 Add `placeholder` attribute to all 5 form fields using localized placeholder keys
