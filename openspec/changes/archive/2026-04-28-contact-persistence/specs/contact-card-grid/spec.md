## MODIFIED Requirements

### Requirement: Mock data source
The page SHALL use `useLocalStorage<Contact[]>("contacts", mockContacts)` to read the contacts array, falling back to the static mock array on first load. The page SHALL render from this localStorage-backed array instead of directly from the static `mockContacts` import. Each mock contact SHALL have `id`, `name`, `firstName`, `lastName`, `email`, `avatar`, and `createdAt`/`updatedAt` timestamps.

#### Scenario: Mock data is typed correctly
- **WHEN** mock contact data is defined
- **THEN** each entry conforms to the `Contact` type from `src/types/contact.ts` including optional `firstName` and `lastName` fields

#### Scenario: Contact list reads from localStorage
- **WHEN** user navigates to the /contact route
- **THEN** the page reads contacts from localStorage key `'contacts'` (falling back to mockContacts if no key exists)

#### Scenario: User-added contacts appear in grid
- **WHEN** a user has previously added a contact via the Add New Contact form
- **THEN** the new contact appears in the contact grid alongside mock contacts
