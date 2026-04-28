## MODIFIED Requirements

### Requirement: TeamCard displays avatar with fallback and name
Each TeamCard SHALL display the member's avatar image. If the avatar fails to load or is missing, a `User` icon fallback SHALL be shown. The member's name SHALL be displayed below the avatar, truncated with a tooltip for long names. A "Message" button SHALL navigate to the Inbox route. Clicking anywhere on the card (except the Message button) SHALL navigate to `/team/${member.id}` (the member detail page).

#### Scenario: Card with valid avatar
- **WHEN** a team member has a valid avatar URL
- **THEN** the card displays the avatar image

#### Scenario: Card with broken avatar falls back to icon
- **WHEN** a team member's avatar URL fails to load
- **THEN** the card displays a `User` icon placeholder

#### Scenario: Message button navigates to Inbox
- **WHEN** user clicks the "Message" button on a team card
- **THEN** the app navigates to the Inbox route
- **AND** the card click navigation does NOT fire

#### Scenario: Card click navigates to detail page
- **WHEN** user clicks on the card's avatar or name area
- **THEN** the app navigates to `/team/${member.id}`

### Requirement: TeamMember type definition
A `TeamMember` type SHALL be defined in `src/types/team.ts` with fields: `id` (ID), `name` (string), `email` (string), `avatar` (optional string), `createdAt` (string), `updatedAt` (string), `firstName` (optional string), `lastName` (optional string), `phone` (optional string), `dateOfBirth` (optional string), `gender` (optional string).

#### Scenario: Type is importable with all fields
- **WHEN** a component imports `TeamMember` from `types/team`
- **THEN** the type is available with all specified fields including optional firstName, lastName, phone, dateOfBirth, gender

### Requirement: Team mock data with 12 members
The `teamData.ts` file SHALL export a `mockTeamMembers` array of 12 `TeamMember` objects. Each member SHALL have id, name, firstName, lastName, email, avatar (randomuser.me URL), createdAt, updatedAt, and plausible values for phone, dateOfBirth, and gender.

#### Scenario: Mock data provides 12 members with full fields
- **WHEN** the mock data is imported
- **THEN** it contains exactly 12 `TeamMember` entries with all required fields and populated optional fields (firstName, lastName, phone, dateOfBirth, gender)
