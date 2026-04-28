## MODIFIED Requirements

### Requirement: Team listing page displays member cards in a responsive grid
The Team page SHALL display team members in a responsive card grid layout: 1 column on mobile, 2 columns on `sm` breakpoint, 3 columns on `lg` breakpoint. Each card SHALL show the member's avatar photo and name. The member list SHALL be read from localStorage via the `useLocalStorage` hook (key: `'team-members'`), initialized from `mockTeamMembers` on first load.

#### Scenario: Page renders with team member cards from localStorage
- **WHEN** user navigates to `/team`
- **THEN** the page displays a grid of TeamCard components populated from localStorage data

#### Scenario: Page includes user-added members
- **WHEN** user previously added a new member via the form
- **THEN** the team grid includes the new member's card at the top of the list

#### Scenario: Responsive grid layout
- **WHEN** viewport is at `lg` breakpoint or wider
- **THEN** the grid displays 3 columns
- **WHEN** viewport is at `sm` breakpoint
- **THEN** the grid displays 2 columns
- **WHEN** viewport is below `sm` breakpoint
- **THEN** the grid displays 1 column

### Requirement: Load More pagination showing 6 members per page
The page SHALL initially display the first 6 team members. A "Load More" button SHALL appear when more members exist. Clicking it SHALL show the next 6 members. The button SHALL hide when all members are visible. The total count SHALL reflect the full localStorage-backed array (mock + user-added).

#### Scenario: Initial load shows 6 members
- **WHEN** the page loads with 13 members (12 mock + 1 added)
- **THEN** only the first 6 members are displayed
- **AND** the "Load More" button is visible

#### Scenario: Load More reveals all members
- **WHEN** user clicks "Load More" enough times
- **THEN** all members (including user-added) are displayed
- **AND** the "Load More" button is hidden when all are shown
