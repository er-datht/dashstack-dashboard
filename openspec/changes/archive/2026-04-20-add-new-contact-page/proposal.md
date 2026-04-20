## Why

The Contact page currently lists contacts in a card grid but provides no way to add new ones — the "Add New Contact" button shows a "Coming soon" toast. Users need a dedicated form page to create contacts, completing the contact management workflow.

## What Changes

- Add a new `/contact/add` route with a full-page form for creating contacts
- Photo upload area (reusing the Settings page's drag-and-drop pattern)
- 6 form fields in a 2-column responsive grid: First Name, Last Name, Email, Phone Number, Date of Birth, Gender (dropdown)
- Client-side validation on required fields (First Name, Last Name, Email) with email format check
- Success toast notification + automatic navigation back to the Contact list
- i18n support for all labels, placeholders, and messages (en/jp)
- Replace the "Coming soon" toast on the Contact page's "Add New Contact" button with navigation to the new route

## Capabilities

### New Capabilities
- `add-new-contact-form`: Contact creation form page with photo upload, field validation, and submit flow

### Modified Capabilities
- `contact-card-grid`: The "Add New Contact" button changes from a "Coming soon" toast to navigating to `/contact/add`

## Impact

- **Routes**: New `ADD_CONTACT` constant in `src/routes/routes.ts`, new lazy-loaded route in `AppRoutes.tsx`
- **Pages**: New `src/pages/Contact/AddNewContact/index.tsx` component
- **Contact page**: `src/pages/Contact/index.tsx` updated to use `useNavigate` instead of toast handler
- **i18n**: New translation keys added to `public/locales/{en,jp}/contact.json`
- **Tests**: Existing Contact test updated to verify navigation instead of toast behavior
