## MODIFIED Requirements

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
