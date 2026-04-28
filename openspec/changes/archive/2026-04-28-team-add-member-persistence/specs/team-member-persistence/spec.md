## ADDED Requirements

### Requirement: New team members are persisted to localStorage
When a new team member is successfully added via the AddPersonForm, the system SHALL construct a `TeamMember` object from the form data and persist it to localStorage under the key `'team-members'`. The `TeamMember` SHALL have `name` constructed as `"FirstName LastName"`, `email` from the form, `avatar` from the photo preview blob URL (or `undefined` if no photo), `id` generated via `Date.now().toString()`, and `createdAt`/`updatedAt` set to the current ISO timestamp.

#### Scenario: New member is saved to localStorage
- **WHEN** user submits a valid AddPersonForm on the Team page with firstName "Jane" and lastName "Doe"
- **THEN** a `TeamMember` with `name: "Jane Doe"` is persisted to localStorage under key `'team-members'`
- **AND** the member has a unique `id`, current `createdAt`/`updatedAt` timestamps, and the form's email

#### Scenario: Photo is included as avatar
- **WHEN** user uploads a photo and submits the form
- **THEN** the new member's `avatar` field contains the photo's blob URL

#### Scenario: No photo uploaded
- **WHEN** user submits without uploading a photo
- **THEN** the new member's `avatar` field is `undefined`

### Requirement: New members appear at the top of the team list
When a new member is added, the system SHALL prepend the member to the beginning of the team members array so that the new member appears first in the grid.

#### Scenario: New member appears first
- **WHEN** user adds a new team member and navigates back to the Team page
- **THEN** the new member's card is the first card in the grid

### Requirement: Team data initializes from mock data on first load
On the first load (no existing localStorage data), the system SHALL initialize the team members array from the existing `mockTeamMembers` data and persist it to localStorage.

#### Scenario: First load uses mock data
- **WHEN** no `'team-members'` key exists in localStorage
- **THEN** the team list displays the 12 mock members and saves them to localStorage

#### Scenario: Subsequent loads use localStorage
- **WHEN** `'team-members'` key exists in localStorage with 13 members
- **THEN** the team list displays all 13 members from localStorage
