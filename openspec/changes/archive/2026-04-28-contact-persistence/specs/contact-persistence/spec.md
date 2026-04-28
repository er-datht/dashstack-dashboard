## ADDED Requirements

### Requirement: New contacts are persisted to localStorage
When a new contact is successfully added via the PersonForm, the system SHALL construct a `Contact` object from the form data and persist it to localStorage under the key `'contacts'`. The `Contact` SHALL have `name` constructed as `"FirstName LastName"`, `firstName` and `lastName` stored separately, `email` from the form, `phone`, `dateOfBirth`, `gender` from the form (may be empty strings), `avatar` from the photo preview blob URL (or `undefined` if no photo), `id` generated via `Date.now().toString()`, and `createdAt`/`updatedAt` set to the current ISO timestamp.

#### Scenario: New contact is saved with all fields
- **WHEN** user submits a valid PersonForm on the Contact page with firstName "Jane", lastName "Doe", phone "555-1234", dateOfBirth "1990-05-15", gender "female"
- **THEN** a `Contact` with all fields populated is persisted to localStorage under key `'contacts'`

#### Scenario: Photo is included as avatar
- **WHEN** user uploads a photo and submits the form
- **THEN** the new contact's `avatar` field contains the photo's blob URL

#### Scenario: No photo uploaded
- **WHEN** user submits without uploading a photo
- **THEN** the new contact's `avatar` field is `undefined`

### Requirement: New contacts appear at the top of the contact list
When a new contact is added, the system SHALL prepend the contact to the beginning of the contacts array so that the new contact appears first in the grid.

#### Scenario: New contact appears first
- **WHEN** user adds a new contact and navigates back to the Contact page
- **THEN** the new contact's card is the first card in the grid

### Requirement: Contact data initializes from mock data on first load
On the first load (no existing localStorage data), the system SHALL initialize the contacts array from the existing `mockContacts` data and persist it to localStorage.

#### Scenario: First load uses mock data
- **WHEN** no `'contacts'` key exists in localStorage
- **THEN** the contact list displays the 18 mock contacts and saves them to localStorage

#### Scenario: Subsequent loads use localStorage
- **WHEN** `'contacts'` key exists in localStorage with 19 contacts
- **THEN** the contact list displays all 19 contacts from localStorage
