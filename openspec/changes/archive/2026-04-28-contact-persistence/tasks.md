## 1. Type & Data Layer

- [x] 1.1 Add optional `firstName`, `lastName`, `dateOfBirth`, `gender` fields to the `Contact` type in `src/types/contact.ts`
- [x] 1.2 Add `firstName` and `lastName` fields to each entry in `src/pages/Contact/contactData.ts` (split existing `name` values)

## 2. Persistence — AddNewContact

- [x] 2.1 Wire `AddNewContact` to use `useLocalStorage<Contact[]>("contacts", mockContacts)` and pass an `onSubmit` handler to `PersonForm` that constructs a `Contact` from `PersonFormData` and prepends it to the array (mirror `AddNewMember` pattern)

## 3. Display — Contact List

- [x] 3.1 Update `Contact/index.tsx` to read from `useLocalStorage<Contact[]>("contacts", mockContacts)` instead of the static `mockContacts` import

## 4. Tests

- [x] 4.1 Update existing Contact tests to account for the localStorage data source change
