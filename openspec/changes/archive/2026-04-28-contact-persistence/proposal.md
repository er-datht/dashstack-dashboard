## Why

The Add New Contact form collects all fields (name, email, phone, etc.) but discards the data on submit — the contact is never saved. Meanwhile, the Contact list reads from a static mock array, so user-added contacts never appear. The Team side already solves this with localStorage persistence; Contact should follow the same pattern.

## What Changes

- Extend the `Contact` type with optional `firstName`, `lastName`, `dateOfBirth`, and `gender` fields (aligning with the `PersonFormData` the form already collects)
- Add `firstName`/`lastName` to each mock contact entry for consistency
- Wire `AddNewContact` to persist new contacts to localStorage via `useLocalStorage` + `onSubmit` callback (same pattern as `AddNewMember`)
- Switch the Contact list page to read from `useLocalStorage` instead of the static `mockContacts` array
- Use `"contacts"` as the localStorage key, prepend new contacts to the list

## Capabilities

### New Capabilities

- `contact-persistence`: Persistence layer for contacts using localStorage, enabling user-added contacts to survive page reloads and appear alongside mock data in the contact grid

### Modified Capabilities

- `contact-card-grid`: Data source changes from static mock array to localStorage-backed array
- `add-new-contact-form`: Form submission now persists data via onSubmit callback

## Impact

- `src/types/contact.ts` — type extension
- `src/pages/Contact/contactData.ts` — mock data enrichment
- `src/pages/Contact/AddNewContact/index.tsx` — persistence logic added
- `src/pages/Contact/index.tsx` — data source switched to useLocalStorage
- Existing Contact tests may need mock strategy updates
