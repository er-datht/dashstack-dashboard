## 1. Routing & Navigation

- [x] 1.1 Add `ADD_CONTACT: "/contact/add"` route constant to `src/routes/routes.ts`
- [x] 1.2 Add lazy-loaded `AddNewContact` import and `<Route path="contact/add">` in `src/routes/AppRoutes.tsx`
- [x] 1.3 Update Contact page "Add New Contact" button to navigate to `/contact/add` using `useNavigate` (replace "Coming soon" toast)

## 2. i18n Translation Keys

- [x] 2.1 Add new translation keys to `public/locales/en/contact.json`: uploadPhoto, removePhoto, photoPreview, firstName, lastName, yourEmail, phoneNumber, dateOfBirth, gender options, addNow, fieldRequired, invalidEmail, contactAdded
- [x] 2.2 Add corresponding Japanese translations to `public/locales/jp/contact.json`

## 3. Add New Contact Page

- [x] 3.1 Create `src/pages/Contact/AddNewContact/index.tsx` with page layout: heading, card container, `bg-page` background
- [x] 3.2 Implement photo upload area: circular upload zone with Camera icon, click-to-select, drag-and-drop, preview, remove button (reuse Settings page pattern)
- [x] 3.3 Implement 6 form fields in 2-column responsive grid: First Name, Last Name, Email, Phone Number, Date of Birth (text→date on focus), Gender (custom dropdown matching UserMenu pattern)
- [x] 3.4 Implement validation: required check on firstName/lastName/email, email format check, error borders + messages, clear-on-change
- [x] 3.5 Implement submit flow: loading state with Loader2 spinner, success toast, navigate to `/contact` after 1s delay
- [x] 3.6 Add accessibility: keyboard-accessible upload area (Enter/Space), label/htmlFor associations, aria-invalid, aria-describedby on error fields

## 4. Tests

- [x] 4.1 Update `src/pages/Contact/__tests__/Contact.test.tsx`: replace "Coming soon" toast test with navigation assertion (`mockNavigate` called with `/contact/add`)
