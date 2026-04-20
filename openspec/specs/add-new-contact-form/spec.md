## Purpose

Add New Contact form page at `/contact/add` with photo upload, 6 form fields, validation, submission flow, and i18n support.

## Requirements

### Requirement: Add New Contact page layout
The Add New Contact page SHALL be a full page at the `/contact/add` route, rendered inside the DashboardLayout. It SHALL display a bold "Add New Contact" heading outside the card, and a card container with a photo upload area, a 2-column responsive form grid, and a centered "Add Now" submit button.

#### Scenario: Page renders all form elements
- **WHEN** user navigates to `/contact/add`
- **THEN** the page displays a heading "Add New Contact", a card containing a photo upload circle, 6 form fields in a 2-column grid, and an "Add Now" button

#### Scenario: Responsive layout
- **WHEN** viewport width is >= 768px (md breakpoint)
- **THEN** form fields display in 2 columns
- **WHEN** viewport width is < 768px
- **THEN** form fields stack in a single column

### Requirement: Photo upload
The page SHALL display a circular photo upload area at the top center of the card, with a Camera icon when no photo is selected and "Upload Photo" text below. The upload area SHALL support click-to-select and drag-and-drop. Accepted formats: PNG, JPEG, GIF, SVG, WebP. Maximum file size: 5MB. When a photo is selected, the preview SHALL replace the Camera icon, and a "Remove Photo" button with an X icon SHALL appear. The photo upload is optional.

#### Scenario: Empty upload state
- **WHEN** no photo has been selected
- **THEN** the circular area shows a Camera icon with "Upload Photo" text below

#### Scenario: Click to upload
- **WHEN** user clicks the upload circle or "Upload Photo" text
- **THEN** a file picker dialog opens, filtered to image files

#### Scenario: Drag and drop upload
- **WHEN** user drags an image file over the upload area
- **THEN** the border style changes to indicate the drop target is active
- **WHEN** user drops a valid image file
- **THEN** the photo preview replaces the Camera icon

#### Scenario: Remove uploaded photo
- **WHEN** a photo is uploaded and user clicks "Remove Photo"
- **THEN** the photo is removed and the Camera icon is restored

#### Scenario: Invalid file rejected
- **WHEN** user selects a file exceeding 5MB or a non-image type
- **THEN** the file is ignored and no preview is shown

### Requirement: Form fields
The form SHALL contain 6 fields in a 2-column grid layout:
- Row 1: **First Name** (text, required) | **Last Name** (text, required)
- Row 2: **Your email** (email, required) | **Phone Number** (tel, optional)
- Row 3: **Date of Birth** (date, optional) | **Gender** (select dropdown, optional, default "Male")

Each field SHALL have a bold label above the input and a placeholder text inside. The Gender dropdown SHALL offer options: Male, Female, Other, with a ChevronDown icon overlay.

#### Scenario: All fields render with labels and placeholders
- **WHEN** the form loads
- **THEN** all 6 fields are visible with their respective labels and placeholder text

#### Scenario: Gender dropdown options
- **WHEN** user opens the Gender dropdown
- **THEN** options "Male", "Female", and "Other" are available

#### Scenario: Date of Birth shows date picker on focus
- **WHEN** user focuses the Date of Birth field
- **THEN** the input switches to a date type to show the browser's date picker
- **WHEN** user leaves the field without entering a value
- **THEN** the input reverts to showing the placeholder text

### Requirement: Form validation
The form SHALL validate the following required fields on submit: First Name, Last Name, Email. Email SHALL also be validated for format (must contain @ and domain). When validation fails, invalid fields SHALL display a red border and an error message below the field. Error messages SHALL clear when the user modifies the respective field. Each required field label SHALL display a red asterisk (`*`) indicator using theme-aware `text-error` styling to visually distinguish required fields from optional ones before form submission.

#### Scenario: Submit with empty required fields
- **WHEN** user clicks "Add Now" with empty First Name, Last Name, or Email
- **THEN** red borders and "This field is required" error messages appear on the empty required fields
- **AND** the form is not submitted

#### Scenario: Submit with invalid email format
- **WHEN** user clicks "Add Now" with an email that doesn't match the pattern `x@x.x`
- **THEN** a red border and "Please enter a valid email address" error message appears on the email field

#### Scenario: Error clears on field change
- **WHEN** a field has a validation error and the user types in that field
- **THEN** the error border and message are removed immediately

#### Scenario: Required fields show asterisk indicator
- **WHEN** the Add New Contact page loads
- **THEN** the labels for First Name, Last Name, and Your email SHALL each display a red asterisk (`*`) after the label text
- **AND** the labels for Phone Number, Date of Birth, and Gender SHALL NOT display an asterisk

### Requirement: Form submission
When the form passes validation, clicking "Add Now" SHALL show a loading state (spinner icon on the button, button disabled), then display a success toast "Contact added successfully", and navigate back to the Contact page (`/contact`) after a 1-second delay.

#### Scenario: Successful submission
- **WHEN** user fills all required fields with valid data and clicks "Add Now"
- **THEN** the button shows a loading spinner, then a success toast appears, and the page navigates to `/contact` after 1 second

#### Scenario: Button disabled during save
- **WHEN** the form is being submitted
- **THEN** the "Add Now" button is disabled and shows a Loader2 spinner icon

### Requirement: Theme support
The Add New Contact page SHALL support all 3 themes (light, dark, forest) using theme-aware utility classes (`bg-page`, `card`, `text-primary`, `bg-surface-muted`, `border-default`, etc.). No hardcoded colors SHALL be used.

#### Scenario: Theme switching
- **WHEN** the user switches between light, dark, and forest themes
- **THEN** all page elements (background, card, inputs, buttons, text) adapt their colors appropriately

### Requirement: Internationalization
All user-visible text SHALL use the `t()` translation function with the `contact` namespace. Translation keys SHALL be provided for English (en) and Japanese (jp), covering: page title, upload labels, field labels, field placeholders, gender options, button text, validation messages, and success toast.

#### Scenario: Language switch
- **WHEN** the user switches language from English to Japanese
- **THEN** all form labels, placeholders, button text, and messages display in Japanese

### Requirement: Accessibility
The photo upload area SHALL be keyboard-accessible (focusable with Enter/Space activation). All form inputs SHALL have associated `<label>` elements via `htmlFor`/`id`. Invalid fields SHALL set `aria-invalid="true"` and reference error messages via `aria-describedby`.

#### Scenario: Keyboard photo upload
- **WHEN** user tabs to the photo upload area and presses Enter or Space
- **THEN** the file picker dialog opens

#### Scenario: Screen reader error association
- **WHEN** a field has a validation error
- **THEN** the input has `aria-invalid="true"` and `aria-describedby` pointing to the error message element
