## MODIFIED Requirements

### Requirement: Logo upload area
The Settings page SHALL display a centered logo upload area at the top of the form card. It MUST show a camera icon placeholder (or the currently selected image) and a clickable "Upload Logo" text link below. The upload area SHALL also accept files via drag & drop.

#### Scenario: Default state with no logo
- **WHEN** no logo has been selected
- **THEN** a camera icon placeholder SHALL be displayed inside a circular container
- **AND** text "Upload Logo" (localized) SHALL appear below the icon

#### Scenario: User clicks upload area to select image
- **WHEN** the user clicks on the camera icon or "Upload Logo" text
- **THEN** a file picker dialog SHALL open accepting image files

#### Scenario: User drags a file over the upload area
- **WHEN** the user drags a file over the circular upload area
- **THEN** the border SHALL change to a solid primary-color highlight to indicate the drop target is active

#### Scenario: User drops a valid image file
- **WHEN** the user drops a valid image file (allowed type, under 5MB) onto the upload area
- **THEN** the camera icon SHALL be replaced with a preview of the dropped image

#### Scenario: User drops an invalid file
- **WHEN** the user drops a non-image file or a file exceeding 5MB
- **THEN** the file SHALL be rejected and the upload area SHALL remain unchanged

#### Scenario: User drags file away without dropping
- **WHEN** the user drags a file over the upload area and then moves it away
- **THEN** the border highlight SHALL revert to the default dashed style

#### Scenario: Logo preview after selection
- **WHEN** the user selects an image file (via click or drag & drop)
- **THEN** the camera icon SHALL be replaced with a preview of the selected image
- **AND** the "Upload Logo" text SHALL be replaced with a remove button

### Requirement: Form field input behavior
Each text input and the textarea SHALL be editable and SHALL display localized placeholder text when empty.

#### Scenario: Empty fields show placeholder text
- **WHEN** the Settings page loads with empty form fields
- **THEN** each field SHALL display localized placeholder text: Site Name, Copyright, SEO Title, SEO Keywords, and SEO Description

#### Scenario: User types in text input
- **WHEN** the user types "My Site" in the Site Name field
- **THEN** the field value SHALL update to "My Site" and the placeholder SHALL disappear
