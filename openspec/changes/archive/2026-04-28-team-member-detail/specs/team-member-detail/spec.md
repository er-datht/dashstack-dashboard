## ADDED Requirements

### Requirement: MemberDetail page at /team/:id
A `MemberDetail` page SHALL be accessible at route `/team/:id`. It SHALL read the team member with the matching `id` from the `'team-members'` localStorage array, resolve `firstName`/`lastName` (from stored fields or by splitting `name` on first space), and render `PersonForm` in edit mode with `initialValues` pre-populated, `submitKey="save"`, and `titleKey` set to display the member's name as the page heading.

#### Scenario: Detail page renders with pre-filled form
- **WHEN** user navigates to `/team/1`
- **THEN** the page displays PersonForm with firstName "Jacob", lastName "Perez", email "jacob.perez@example.com", and other fields pre-filled from the member's data

#### Scenario: Page title shows member name
- **WHEN** user navigates to a member's detail page
- **THEN** the page heading shows the member's name (e.g., "Jacob Perez")

#### Scenario: Submit button says "Save"
- **WHEN** the detail page renders
- **THEN** the submit button displays the translated text for "save" instead of "Add Now"

#### Scenario: Breadcrumb shows Team and member name
- **WHEN** user navigates to `/team/1` (Jacob Perez)
- **THEN** a breadcrumb shows "Team" (clickable, navigates to `/team`) followed by "Jacob Perez"

### Requirement: Saving edits updates member in localStorage
When the user submits the form on the detail page, the system SHALL update the matching member in the `'team-members'` localStorage array with the new field values (firstName, lastName, name recomputed as `firstName + " " + lastName`, email, phone, dateOfBirth, gender, avatar), update `updatedAt` to the current ISO timestamp, show a success toast, and navigate back to `/team`.

#### Scenario: Edit and save a member
- **WHEN** user changes firstName from "Jacob" to "Jake" and clicks Save
- **THEN** the member's `firstName` is updated to "Jake", `name` becomes "Jake Perez", `updatedAt` is refreshed, and the user is navigated to `/team`

#### Scenario: Updated member visible in team list
- **WHEN** user edits a member and navigates back to the team list
- **THEN** the team card shows the updated name

### Requirement: Invalid member ID redirects to /team
If the `id` parameter does not match any member in localStorage, the page SHALL redirect to `/team`.

#### Scenario: Non-existent member ID
- **WHEN** user navigates to `/team/999` and no member with id "999" exists
- **THEN** the user is redirected to `/team`

### Requirement: Route and lazy loading
The route `team/:id` SHALL be registered in `AppRoutes.tsx` with a lazy-loaded `MemberDetail` component. A `TEAM_DETAIL` constant SHALL be added to the ROUTES object in `routes.ts`.

#### Scenario: Route is accessible
- **WHEN** user navigates to `/team/1`
- **THEN** the MemberDetail page loads via lazy import

### Requirement: Detail page i18n
The detail page SHALL use translation keys from the `team` namespace. New keys SHALL include `save` (button text) and `memberUpdated` (success toast). Translations SHALL be provided for `en` and `jp` locales.

#### Scenario: English translations
- **WHEN** locale is `en` and user is on the detail page
- **THEN** the save button shows "Save" and the success toast shows "Member updated successfully"

#### Scenario: Japanese translations
- **WHEN** locale is `jp` and user is on the detail page
- **THEN** the save button and success toast show Japanese equivalents
