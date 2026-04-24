## ADDED Requirements

### Requirement: Registration page layout
The Registration page SHALL render at `/register` with the same centered card layout as the Login page: `bg-page` background, `shadow-lg` card, `registerTitle` i18n key as heading, `registerSubtitle` as subtitle. It SHALL support all 3 themes. Interactive links SHALL use `--color-primary-500` for adequate contrast across all themes.

#### Scenario: Registration page renders
- **WHEN** a user navigates to `/register`
- **THEN** a centered card displays with the localized register title and the registration form

### Requirement: Registration form fields
The Registration page SHALL render inputs for: full name, email, password, and confirm password. All labels SHALL be linked to inputs via `htmlFor`/`id`. A "Sign Up" submit button SHALL appear below the fields.

#### Scenario: Form field rendering
- **WHEN** the Registration page renders
- **THEN** name, email, password, confirm password inputs and "Sign Up" button are visible

### Requirement: Registration form i18n
All Registration page text SHALL use the `t()` function with the `auth` namespace. New i18n keys SHALL be added to both `en/auth.json` and `jp/auth.json` for: `registerTitle`, `registerSubtitle`, `registerButton`, `name`, `namePlaceholder`, `confirmPassword`, `nameRequired`, `passwordMinLength`, `passwordMismatch`, `registerSuccess`.

#### Scenario: Translation keys present
- **WHEN** the Registration page renders in English
- **THEN** all text comes from `en/auth.json` translation keys

#### Scenario: Japanese locale
- **WHEN** the user's language is set to Japanese
- **THEN** all Registration page text displays in Japanese

### Requirement: Registration form validation
The Registration page SHALL validate on submit: name is required, email is required and must be a valid format, password is required and must be at least 8 characters, confirm password must match password. Password mismatch SHALL only be checked when the password itself is valid (not empty and at least 8 characters). Validation errors SHALL display inline below each field. Errors SHALL be cleared on next submission attempt. `aria-invalid` SHALL use `"true" | undefined` (not boolean coercion) for consistency with the Login page.

#### Scenario: Empty name
- **WHEN** the user submits with an empty name
- **THEN** an error message displays below the name field

#### Scenario: Password too short
- **WHEN** the user submits with a password shorter than 8 characters
- **THEN** an error message displays below the password field using `passwordMinLength` and no mismatch error is shown

#### Scenario: Passwords don't match
- **WHEN** the user submits with a valid-length password that does not match confirm password
- **THEN** an error message displays below the confirm password field using `passwordMismatch`

#### Scenario: Invalid email format
- **WHEN** the user submits with an invalid email format
- **THEN** an error message displays below the email field using `emailInvalid`

### Requirement: Registration form submission with mock API
The Registration page SHALL call the mock `register()` service on valid form submission. During submission, the button SHALL be disabled with a spinner. On success, the user SHALL be redirected to `/login` with a success message passed via route state.

#### Scenario: Loading state during submission
- **WHEN** the form is submitted with valid data
- **THEN** the "Sign Up" button is disabled and shows a spinner

#### Scenario: Successful registration
- **WHEN** the mock register API returns success
- **THEN** the user is redirected to `/login` with a success message in route state

#### Scenario: Login page shows registration success message
- **WHEN** the user arrives at `/login` after successful registration
- **THEN** a success toast displays the registration success message

### Requirement: Sign in link
The Registration page SHALL include an "Already have an account? Sign in" link that navigates to `/login`.

#### Scenario: Navigate to login
- **WHEN** the user clicks the "Sign in" link
- **THEN** they are navigated to the `/login` route

### Requirement: Auto-redirect if already authenticated
If the user already has a valid token when visiting `/register`, the page SHALL redirect to `/dashboard`.

#### Scenario: Authenticated user visits register
- **WHEN** a user with a token navigates to `/register`
- **THEN** they are immediately redirected to `/dashboard`

### Requirement: Registration page accessibility
All form inputs SHALL have linked labels, `aria-required="true"`, visible focus rings, and error messages linked via `aria-describedby`.

#### Scenario: Accessible form structure
- **WHEN** a screen reader encounters the registration form
- **THEN** all inputs have properly announced labels and error states
