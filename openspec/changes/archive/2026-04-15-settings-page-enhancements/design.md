## Context

The Settings page was just implemented with click-to-upload for logo and empty form fields. Two refinements needed: drag & drop on upload area and placeholder text.

## Goals / Non-Goals

**Goals:**
- Drag & drop file onto the logo upload circle to select it
- Visual feedback (border highlight) during dragover
- Placeholder text for all 5 form fields via i18n

**Non-Goals:**
- No drag & drop outside the circle area (not a full-page dropzone)
- No multi-file drag & drop

## Decisions

### 1. Native HTML drag & drop events on the existing upload div
**Choice**: Add `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop` handlers to the circular upload area div. Use a `isDragging` state to toggle border highlight.
**Rationale**: No library needed — native browser events are sufficient for single-file drop. Keeps bundle size unchanged.

### 2. Reuse existing file validation logic
**Choice**: The dropped file goes through the same `ALLOWED_IMAGE_TYPES` and `MAX_LOGO_SIZE` checks as click-upload.
**Rationale**: Consistent behavior regardless of upload method.

### 3. Placeholder text via translation keys
**Choice**: Add `siteNamePlaceholder`, `copyrightPlaceholder`, `seoTitlePlaceholder`, `seoKeywordsPlaceholder`, `seoDescriptionPlaceholder` keys to settings.json locales.
**Rationale**: Keeps all UI text in i18n. Placeholders give contextual hints (e.g. "Enter your site name").

## Risks / Trade-offs

- **[Drag visual feedback]** The dashed border highlight must be visible across all 3 themes. → Use `border-primary` utility which adapts to theme.
