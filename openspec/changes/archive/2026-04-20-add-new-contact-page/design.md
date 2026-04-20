## Context

The Contact page (`src/pages/Contact/index.tsx`) displays contacts in a card grid with a non-functional "Add New Contact" button. The Settings page (`src/pages/Settings/index.tsx`) has a well-established form pattern with photo upload, 2-column grid layout, validation, and toast notifications that can be reused.

## Goals / Non-Goals

**Goals:**
- Provide a form page to create new contacts, matching the existing UI patterns
- Reuse the Settings page's photo upload and form field patterns for consistency
- Support all 3 themes (light/dark/forest) via existing theme-aware utility classes
- Full i18n coverage (en/jp)

**Non-Goals:**
- Persisting contact data to a backend API (mock/simulated save only)
- Edit or delete contact functionality
- Form data persistence across page navigation (no draft saving)
- Adding contacts to the existing `mockContacts` array at runtime

## Decisions

### 1. Separate page vs. modal
**Decision**: Full page at `/contact/add` rather than a modal overlay.
**Rationale**: The design screenshot shows a full page layout with its own heading. A dedicated page is more accessible, supports deep linking, and matches how Settings works. A modal would constrain the form layout and complicate keyboard/focus management.

### 2. Reuse Settings page patterns directly (no shared abstraction)
**Decision**: Copy the same code patterns (input classes, upload area, toast, validation) rather than extracting shared form components.
**Rationale**: Only two pages use this pattern currently. Extracting a shared FormField or PhotoUpload component would be premature abstraction. If a third page needs the same pattern, then extraction makes sense.

### 3. Form fields match design, not existing Contact type
**Decision**: The form uses firstName, lastName, email, phone, dateOfBirth, gender — matching the design screenshot rather than the existing `ContactFormData` type (which has name, company, position, etc.).
**Rationale**: The design is the source of truth for this page's fields. The existing type can be extended later when backend integration happens.

### 4. Gender as a custom dropdown
**Decision**: Use a custom dropdown matching the UserMenu/LanguageSwitcher pattern (click-to-toggle panel, checkmark on selected item, `usermenu-*` theme classes, click-outside-to-close, Escape key support) instead of a native `<select>`.
**Rationale**: The user requested visual consistency with the existing UserMenu dropdown style. The custom dropdown includes `role="listbox"`, `role="option"`, `aria-selected`, `aria-haspopup`, and `aria-expanded` for accessibility. Options: Male, Female, Other.

### 5. Date of Birth input
**Decision**: Text input that switches to `type="date"` on focus, with placeholder text shown before focus.
**Rationale**: The design shows a text placeholder ("Enter your birthdate"). Native date inputs don't show placeholder text, so the type-switch on focus trick provides both the placeholder UX and the date picker functionality.

## Risks / Trade-offs

- **No backend persistence** → Submitted contacts are lost on page reload. This is acceptable since the app uses mock data throughout. Mitigation: toast confirms the action visually, then navigates back.
- **No form draft saving** → Navigating away loses all input. Mitigation: the form is short (6 fields), so re-entry cost is low. A "discard changes?" prompt could be added later if needed.
- **Date input type-switch** → Some browsers may behave inconsistently with the focus/blur type change. Mitigation: the field is optional, and fallback to plain text input still works.
