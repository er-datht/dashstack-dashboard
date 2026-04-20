## ADDED Requirements

### Requirement: Add New Member form page at /team/add
The Add New Member page SHALL be accessible at `/team/add` via lazy-loaded routing. It SHALL display a form with photo upload and 6 fields: First Name (required), Last Name (required), Email (required), Phone Number, Date of Birth, and Gender (custom dropdown).

#### Scenario: Page renders with all form fields
- **WHEN** user navigates to `/team/add`
- **THEN** the page displays a heading "Add New Member", a photo upload area, and 6 form fields

#### Scenario: Required fields marked with red asterisk
- **WHEN** the form renders
- **THEN** First Name, Last Name, and Email labels show a red asterisk (`*`)

### Requirement: Photo upload with drag-and-drop
The form SHALL include a circular photo upload area that supports click-to-upload and drag-and-drop. Accepted formats: PNG, JPEG, GIF, SVG, WebP. Max size: 5MB. A "Remove Photo" button SHALL appear when a photo is set.

#### Scenario: Upload photo via click
- **WHEN** user clicks the upload area and selects a valid image file
- **THEN** the photo preview is displayed in the circle

#### Scenario: Upload photo via drag-and-drop
- **WHEN** user drags a valid image file onto the upload area
- **THEN** the photo preview is displayed in the circle

#### Scenario: Remove uploaded photo
- **WHEN** user clicks "Remove Photo"
- **THEN** the photo is removed and the camera icon placeholder returns

### Requirement: Form validation on required fields
The form SHALL validate that First Name, Last Name, and Email are non-empty on submit. Email SHALL also be validated for format (contains @ and domain). Invalid fields SHALL show red borders and error messages.

#### Scenario: Submit with empty required fields
- **WHEN** user clicks "Add Now" with empty First Name
- **THEN** the First Name field shows a red border and "This field is required" error

#### Scenario: Submit with invalid email format
- **WHEN** user clicks "Add Now" with email "notanemail"
- **THEN** the Email field shows "Please enter a valid email address" error

#### Scenario: Errors clear on input change
- **WHEN** user types into a field that has a validation error
- **THEN** the error is cleared for that field

### Requirement: Gender custom dropdown
The Gender field SHALL be a custom dropdown (not native select) with options: Male, Female, Other. It SHALL close on click outside or Escape key. Default value: Male.

#### Scenario: Dropdown opens and closes
- **WHEN** user clicks the Gender field
- **THEN** a dropdown with 3 options appears
- **WHEN** user clicks outside the dropdown
- **THEN** the dropdown closes

#### Scenario: Selection updates the field
- **WHEN** user selects "Female" from the dropdown
- **THEN** the Gender field displays "Female"

### Requirement: Form submission with toast and navigation
On successful validation, the form SHALL show a loading spinner on the "Add Now" button, display a success toast, and navigate back to `/team` after 1 second.

#### Scenario: Successful submission flow
- **WHEN** user fills all required fields correctly and clicks "Add Now"
- **THEN** a loading spinner appears on the button
- **AND** a green success toast "Member added successfully" appears
- **AND** the app navigates to `/team` after 1 second

### Requirement: Add New Member i18n support
All form labels, placeholders, buttons, and error messages SHALL use translation keys from the `team` namespace.

#### Scenario: All form text is translated
- **WHEN** locale is `en`
- **THEN** labels show "First Name", "Last Name", "Your email", etc.
- **WHEN** locale is `jp`
- **THEN** labels show Japanese equivalents

### Requirement: Route and navigation wiring
`ADD_TEAM: "/team/add"` SHALL be added to the ROUTES object. The `AddNewMember` component SHALL be lazy-loaded in `AppRoutes.tsx`. The `team` namespace SHALL be registered in the root `i18n.ts` config.

#### Scenario: Route accessible
- **WHEN** user navigates to `/team/add`
- **THEN** the AddNewMember component renders within the DashboardLayout
