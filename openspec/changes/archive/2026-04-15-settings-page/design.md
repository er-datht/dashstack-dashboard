## Context

The Settings page (`src/pages/Settings/index.tsx`) is currently a placeholder with static text. The Figma design shows a "General Settings" form with logo upload, 5 form fields in a 2-column layout, and a Save button. Infrastructure already exists: route `/settings`, navigation item in sidebar, types in `src/types/settings.ts`, and translation files in `public/locales/{en|jp}/settings.json`.

## Goals / Non-Goals

**Goals:**
- Implement the General Settings form UI matching the Figma design
- Logo upload area with camera icon and clickable "Upload Logo" text
- 2-column responsive form layout with 5 fields (4 text inputs + 1 textarea)
- Save button with loading state and success toast notification
- Responsive: 2-column collapses to 1-column below md (768px)
- Required field validation for Site Name, Copyright, SEO Title, SEO Keywords
- Logo removal capability
- Full theme support (light/dark/forest)
- i18n for all visible strings

**Non-Goals:**
- No API integration for saving settings (UI-only, local state)
- No actual file upload implementation (visual placeholder only — clicking opens file picker but no server upload)
- No complex form validation — only required-field checks (empty/non-empty) for 4 fields
- No other settings sections (notifications, privacy, display) — only General Settings per Figma

## Decisions

### 1. Rewrite placeholder page in-place
**Choice**: Replace the existing `src/pages/Settings/index.tsx` entirely.
**Rationale**: The placeholder has no reusable logic. A clean rewrite is simpler than incremental modification.

### 2. Local component state for form fields
**Choice**: Use `useState` for form field values. No React Query or context.
**Rationale**: The Figma design shows a simple form with a Save button. There's no API endpoint yet. Local state keeps it simple and ready for future API integration.

### 3. Add new translation keys for field labels
**Choice**: Add keys `siteName`, `copyright`, `seoTitle`, `seoKeywords`, `seoDescription`, `uploadLogo` to `settings.json` for both en and jp locales.
**Rationale**: The existing translation file has generic keys but not the specific field labels shown in the Figma design. Need to map the "Site Name" labels to actual semantic fields.

### 4. Add GeneralSettings type
**Choice**: Add a `GeneralSettings` type to `src/types/settings.ts` with fields: `siteName`, `copyright`, `seoTitle`, `seoKeywords`, `seoDescription`, `logoUrl`.
**Rationale**: The existing `AppSettings` type covers theme/notifications/privacy/display but not the general site configuration fields shown in the Figma.

### 5. Styling approach — Tailwind utilities with theme-aware CSS variables
**Choice**: Use Tailwind utility classes with the project's existing custom utilities (`.card`, `.bg-surface`, `.text-primary`, etc.) and CSS custom properties for theme-adaptive colors.
**Rationale**: Follows the project's 3-tier styling system. No SCSS module needed — the form layout is straightforward flexbox/grid.

### 6. Logo upload — hidden file input pattern
**Choice**: Use a hidden `<input type="file">` triggered by clicking the camera icon / "Upload Logo" text. Store the selected file as a local preview URL via `URL.createObjectURL`.
**Rationale**: Standard accessible pattern. No server upload needed per non-goals — just preview.

## Risks / Trade-offs

- **[No persistence]** Form data resets on page navigation. → Acceptable for UI-only phase; will add API integration in a future change.
- **[Field semantics confirmed]** User confirmed field names: Site Name, Copyright, SEO Title, SEO Keywords, SEO Description. Required fields: Site Name, Copyright, SEO Title, SEO Keywords. SEO Description is optional.
- **[Textarea height matching]** The textarea must visually match the height of two stacked inputs. → Use a fixed height or `min-h` matching the combined height of two input rows plus gap.
