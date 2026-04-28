## MODIFIED Requirements

### Requirement: New team members are persisted to localStorage
When a new team member is successfully added via the PersonForm, the system SHALL construct a `TeamMember` object from the form data and persist it to localStorage under the key `'team-members'`. The `TeamMember` SHALL have `name` constructed as `"FirstName LastName"`, `firstName` and `lastName` stored separately, `email` from the form, `phone`, `dateOfBirth`, `gender` from the form (may be empty strings), `avatar` from the photo preview blob URL (or `undefined` if no photo), `id` generated via `Date.now().toString()`, and `createdAt`/`updatedAt` set to the current ISO timestamp.

#### Scenario: New member is saved with all fields
- **WHEN** user submits a valid PersonForm on the Team page with firstName "Jane", lastName "Doe", phone "555-1234", dateOfBirth "1990-05-15", gender "female"
- **THEN** a `TeamMember` with all fields populated is persisted to localStorage under key `'team-members'`

#### Scenario: Photo is included as avatar
- **WHEN** user uploads a photo and submits the form
- **THEN** the new member's `avatar` field contains the photo's blob URL

#### Scenario: No photo uploaded
- **WHEN** user submits without uploading a photo
- **THEN** the new member's `avatar` field is `undefined`

## ADDED Requirements

### Requirement: Editing a member updates localStorage
When a member is edited via the MemberDetail page and the form is submitted, the system SHALL find the member by `id` in the `'team-members'` localStorage array, update all fields (firstName, lastName, name, email, phone, dateOfBirth, gender, avatar), set `updatedAt` to the current ISO timestamp, and persist the updated array back to localStorage.

#### Scenario: Edit updates member in place
- **WHEN** user edits member id "1" changing firstName to "Jake"
- **THEN** the member with id "1" in localStorage has firstName "Jake", name "Jake Perez", and a refreshed updatedAt

#### Scenario: Edit preserves array order
- **WHEN** user edits a member
- **THEN** the member remains at the same position in the array (not moved to top or bottom)
