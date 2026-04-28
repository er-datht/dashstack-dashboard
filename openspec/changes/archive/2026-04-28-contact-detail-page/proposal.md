## Why

The Team page supports clicking a team card to navigate to a detail/edit page (`/team/:id`), but the Contact page does not. Users cannot view or edit individual contacts after creation. Adding a contact detail page mirrors the team detail pattern, providing a consistent experience across both people-management sections.

## What Changes

- Add a `ContactDetail` page at `/contact/:id` that renders `PersonForm` in edit mode with pre-filled contact data from localStorage
- Make `ContactCard` clickable (entire card navigates to `/contact/:id`) with keyboard accessibility and `stopPropagation` on the Message button
- Add route constant `CONTACT_DETAIL` and lazy-loaded route in `AppRoutes.tsx`
- Add `save` and `contactUpdated` translation keys to `en` and `jp` contact locale files

## Capabilities

### New Capabilities
- `contact-detail`: Contact detail/edit page at `/contact/:id` with PersonForm, localStorage persistence, breadcrumb navigation, and card-level navigation from the contact list

### Modified Capabilities
- `contact-card-grid`: ContactCard becomes clickable (navigates to detail page), with keyboard support and stopPropagation on Message button

## Impact

- **Routes**: New `CONTACT_DETAIL` constant in `routes.ts`, new lazy route in `AppRoutes.tsx`
- **Pages**: New `src/pages/Contact/ContactDetail/index.tsx`
- **Components**: Modified `ContactCard.tsx` (card-level click navigation)
- **i18n**: Updated `public/locales/{en,jp}/contact.json` with 2 new keys each
- **No new dependencies**
