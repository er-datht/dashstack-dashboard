## 1. Add Asterisks to Required Field Labels

- [x] 1.1 Add `<span className="text-error">*</span>` to required field labels in `src/pages/Contact/AddNewContact/index.tsx`: First Name, Last Name, Your email
- [x] 1.2 Add `<span className="text-error">*</span>` to required field labels in `src/pages/Settings/index.tsx`: Site Name, Copyright, SEO Title, SEO Keywords
- [x] 1.3 Add `<span className="text-error">*</span>` to the Event Title label in `src/pages/Calendar/AddEventModal.tsx`

## 2. Update Tests

- [x] 2.1 Update `src/pages/Settings/__tests__/Settings.test.tsx`: change `getByLabelText('fieldName')` to `getByLabelText(/fieldName/)` and `getByText('fieldName')` to `getByText(/fieldName/)` for all required fields whose labels now contain child elements
