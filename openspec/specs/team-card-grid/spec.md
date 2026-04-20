# Capability: Team Card Grid

## Purpose

Provides the Team listing page with a responsive card grid of team members, header with navigation, Load More pagination, and i18n support.

## Requirements

### Requirement: Team listing page displays member cards in a responsive grid
The Team page SHALL display team members in a responsive card grid layout: 1 column on mobile, 2 columns on `sm` breakpoint, 3 columns on `lg` breakpoint. Each card SHALL show the member's avatar photo and name.

#### Scenario: Page renders with team member cards
- **WHEN** user navigates to `/team`
- **THEN** the page displays a grid of TeamCard components populated from mock data

#### Scenario: Responsive grid layout
- **WHEN** viewport is at `lg` breakpoint or wider
- **THEN** the grid displays 3 columns
- **WHEN** viewport is at `sm` breakpoint
- **THEN** the grid displays 2 columns
- **WHEN** viewport is below `sm` breakpoint
- **THEN** the grid displays 1 column

### Requirement: Team page header with icon badge and Add New Member button
The page SHALL display a header with a `UsersRound` icon in an error-colored badge (`bg-error-light`, `text-error`), a "Team" title, and an "Add New Member" button that navigates to `/team/add`.

#### Scenario: Header renders correctly
- **WHEN** the Team page loads
- **THEN** the header shows a `UsersRound` icon in a red/pink badge, the translated title `team:title`, and an "Add New Member" button

#### Scenario: Add New Member button navigates
- **WHEN** user clicks the "Add New Member" button
- **THEN** the app navigates to `/team/add`

### Requirement: Load More pagination showing 6 members per page
The page SHALL initially display the first 6 team members. A "Load More" button SHALL appear when more members exist. Clicking it SHALL show the next 6 members. The button SHALL hide when all members are visible.

#### Scenario: Initial load shows 6 members
- **WHEN** the page loads with 12 mock members
- **THEN** only the first 6 members are displayed
- **AND** the "Load More" button is visible

#### Scenario: Load More reveals next batch
- **WHEN** user clicks "Load More"
- **THEN** all 12 members are displayed
- **AND** the "Load More" button is hidden

### Requirement: TeamCard displays avatar with fallback and name
Each TeamCard SHALL display the member's avatar image. If the avatar fails to load or is missing, a `User` icon fallback SHALL be shown. The member's name SHALL be displayed below the avatar, truncated with a tooltip for long names. A "Message" button SHALL navigate to the Inbox route.

#### Scenario: Card with valid avatar
- **WHEN** a team member has a valid avatar URL
- **THEN** the card displays the avatar image

#### Scenario: Card with broken avatar falls back to icon
- **WHEN** a team member's avatar URL fails to load
- **THEN** the card displays a `User` icon placeholder

#### Scenario: Message button navigates to Inbox
- **WHEN** user clicks the "Message" button on a team card
- **THEN** the app navigates to the Inbox route

### Requirement: Team mock data with 12 members
The `teamData.ts` file SHALL export a `mockTeamMembers` array of 12 `TeamMember` objects. Each member SHALL have id, name, email, avatar (randomuser.me URL), createdAt, and updatedAt fields.

#### Scenario: Mock data provides 12 members
- **WHEN** the mock data is imported
- **THEN** it contains exactly 12 `TeamMember` entries with all required fields

### Requirement: TeamMember type definition
A `TeamMember` type SHALL be defined in `src/types/team.ts` with fields: `id` (ID), `name` (string), `email` (string), `avatar` (optional string), `createdAt` (string), `updatedAt` (string).

#### Scenario: Type is importable
- **WHEN** a component imports `TeamMember` from `types/team`
- **THEN** the type is available with all specified fields

### Requirement: Team page i18n support
All UI text on the Team listing page SHALL use translation keys from the `team` namespace. Translations SHALL be provided for `en` and `jp` locales.

#### Scenario: English translations render
- **WHEN** locale is `en`
- **THEN** the page shows "Team", "Add New Member", "Message", "Load More"

#### Scenario: Japanese translations render
- **WHEN** locale is `jp`
- **THEN** the page shows Japanese equivalents for all text
