### Requirement: Settings page displays General Settings heading
The Settings page SHALL display a page title "General Settings" (localized) at the top of the main content area.

#### Scenario: Page title renders
- **WHEN** the user navigates to the `/settings` route
- **THEN** a heading with text from `t("settings:generalSettings")` SHALL be visible

### Requirement: Logo upload area
The Settings page SHALL display a centered logo upload area at the top of the form card. It MUST show a camera icon placeholder (or the currently selected image) and a clickable "Upload Logo" text link below. The upload area SHALL also accept files via drag & drop. A success toast SHALL appear after a valid image is uploaded.

#### Scenario: Default state with no logo
- **WHEN** no logo has been selected
- **THEN** a camera icon placeholder SHALL be displayed inside a circular container
- **AND** text "Upload Logo" (localized) SHALL appear below the icon

#### Scenario: User clicks upload area to select image
- **WHEN** the user clicks on the camera icon or "Upload Logo" text
- **THEN** a file picker dialog SHALL open accepting image files (png, jpg, gif, svg)

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

#### Scenario: Toast shown after logo upload
- **WHEN** the user selects or drops a valid image file
- **THEN** a success toast with localized "Logo uploaded successfully" text SHALL appear
- **AND** the toast SHALL auto-dismiss after 3 seconds

### Requirement: Logo removal
The user SHALL be able to remove a previously selected logo.

#### Scenario: User removes selected logo
- **WHEN** a logo has been selected and the user clicks a remove/clear action
- **THEN** the logo preview SHALL be removed and the camera icon placeholder SHALL reappear

### Requirement: Form fields layout
The Settings page SHALL display 5 form fields inside a white (theme-adaptive) rounded card. The layout MUST be a 2-column grid:
- Row 1: Site Name (text input) | Copyright (text input)
- Row 2 left column: SEO Title (text input), SEO Keywords (text input) stacked vertically
- Row 2 right column: SEO Description (textarea) spanning the full height of the two left inputs

#### Scenario: All form fields render with labels
- **WHEN** the Settings page loads
- **THEN** 5 form fields SHALL be visible with localized labels: Site Name, Copyright, SEO Title, SEO Keywords, SEO Description

#### Scenario: Textarea matches stacked inputs height
- **WHEN** the form renders
- **THEN** the SEO Description textarea height SHALL visually match the combined height of SEO Title + SEO Keywords inputs plus gap

### Requirement: Form field input behavior
Each text input and the textarea SHALL be editable and SHALL display localized placeholder text when empty. Typing in a field SHALL update the corresponding form state value.

#### Scenario: Empty fields show placeholder text
- **WHEN** the Settings page loads with empty form fields
- **THEN** each field SHALL display localized placeholder text

#### Scenario: User types in text input
- **WHEN** the user types "My Site" in the Site Name field
- **THEN** the field value SHALL update to "My Site" and the placeholder SHALL disappear

#### Scenario: User types in textarea
- **WHEN** the user types a description in the SEO Description textarea
- **THEN** the textarea value SHALL update accordingly

### Requirement: Required field validation
Site Name, Copyright, SEO Title, and SEO Keywords SHALL be required fields. SEO Description is optional. Each required field label SHALL display a red asterisk (`*`) indicator using theme-aware `text-error` styling to visually distinguish required fields from optional ones before form submission.

#### Scenario: Required field left empty on save
- **WHEN** the user clicks Save with a required field empty
- **THEN** the empty required field SHALL show a visual error indicator
- **AND** the form SHALL NOT proceed with the save action

#### Scenario: Required fields show asterisk indicator
- **WHEN** the Settings page loads
- **THEN** the labels for Site Name, Copyright, SEO Title, and SEO Keywords SHALL each display a red asterisk (`*`) after the label text
- **AND** the SEO Description label SHALL NOT display an asterisk

### Requirement: Save button with loading and toast
The Settings page SHALL display a centered "Save" button below the form fields. The button MUST use the primary brand color. On click, it SHALL show a loading state, then display a success toast notification.

#### Scenario: Save button renders
- **WHEN** the form is displayed
- **THEN** a "Save" button (localized via `t("settings:saveChanges")`) SHALL be visible and centered

#### Scenario: User clicks Save with valid form
- **WHEN** the user clicks the Save button and all required fields are filled
- **THEN** the button SHALL show a loading/spinner state
- **AND** after a brief delay (simulated), a success toast notification SHALL appear with text from `t("settings:settingsSaved")`
- **AND** the button SHALL return to its normal state

#### Scenario: Save button disabled during loading
- **WHEN** the save action is in progress
- **THEN** the Save button SHALL be disabled to prevent duplicate submissions

### Requirement: Theme support
All Settings page elements SHALL adapt to the active theme (light, dark, forest) using CSS custom properties and theme-aware Tailwind utility classes.

#### Scenario: Dark theme applied
- **WHEN** the active theme is "dark"
- **THEN** the card background, text colors, input backgrounds, and borders SHALL use dark theme values

#### Scenario: Forest theme applied
- **WHEN** the active theme is "forest"
- **THEN** the card background, text colors, input backgrounds, and borders SHALL use forest theme values

### Requirement: Responsive layout
The 2-column form layout SHALL collapse to a single column on screens below the `md` breakpoint (768px).

#### Scenario: Mobile viewport
- **WHEN** the viewport width is below 768px
- **THEN** all form fields SHALL stack vertically in a single column
- **AND** the textarea SHALL display at a standard height (no longer matching two stacked inputs)

### Requirement: Internationalization
All visible text on the Settings page SHALL use translation keys from the `settings` namespace via `useTranslation("settings")`.

#### Scenario: Japanese locale
- **WHEN** the active language is Japanese (jp)
- **THEN** all labels, button text, and heading SHALL display in Japanese
