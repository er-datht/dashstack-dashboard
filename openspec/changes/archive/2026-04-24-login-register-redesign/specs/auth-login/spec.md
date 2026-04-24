## ADDED Requirements

### Requirement: Login page layout and branding
The Login page SHALL render a centered card with `shadow-lg` on a `bg-page` background. The card SHALL display the `loginTitle` i18n key as the heading and `loginSubtitle` as the subtitle. The page SHALL support all 3 themes (light/dark/forest) via CSS custom properties. Interactive links SHALL use `--color-primary-500` for adequate contrast across all themes.

#### Scenario: Login page renders with branding
- **WHEN** a user navigates to `/login`
- **THEN** a centered card displays with the localized login title, subtitle text, and the login form

#### Scenario: Theme support
- **WHEN** the user has `data-theme="dark"` set
- **THEN** the Login page renders with dark theme colors via CSS variables

### Requirement: Login form fields
The Login page SHALL render an email input, a password input with visibility toggle (eye icon), a "Remember me" checkbox, and a "Sign In" submit button. All labels SHALL be linked to inputs via `htmlFor`/`id` pairing.

#### Scenario: Form field rendering
- **WHEN** the Login page renders
- **THEN** email input, password input, "Remember me" checkbox, and "Sign In" button are visible

#### Scenario: Password visibility toggle
- **WHEN** the user clicks the eye icon next to the password field
- **THEN** the password field toggles between `type="password"` and `type="text"`, and the icon toggles between `Eye` and `EyeOff`

### Requirement: Login form i18n
All Login page text SHALL use the `t()` function from `react-i18next` with the `auth` namespace. Translation keys SHALL include: `loginTitle`, `loginSubtitle`, `email`, `password`, `rememberMe`, `forgotPassword`, `loginButton`, `emailRequired`, `passwordRequired`, `emailInvalid`, `invalidCredentials`, `loginSuccess`.

#### Scenario: Japanese locale
- **WHEN** the user's language is set to Japanese
- **THEN** all Login page text displays in Japanese using `jp/auth.json` translations

### Requirement: Login form validation
The Login page SHALL validate on submit: email is required and must match a valid email format, password is required. Validation errors SHALL display as inline text below the respective field using `text-error text-sm mt-1`. Errors SHALL be cleared on the next form submission attempt.

#### Scenario: Empty email submission
- **WHEN** the user submits with an empty email field
- **THEN** an error message displays below the email field using the `emailRequired` i18n key

#### Scenario: Invalid email format
- **WHEN** the user submits with an invalid email format
- **THEN** an error message displays below the email field using the `emailInvalid` i18n key

#### Scenario: Empty password submission
- **WHEN** the user submits with an empty password field
- **THEN** an error message displays below the password field using the `passwordRequired` i18n key

#### Scenario: Errors cleared on resubmit
- **WHEN** the user fixes a field and resubmits
- **THEN** previous validation errors are cleared before re-validation

### Requirement: Login form submission with mock API
The Login page SHALL call the mock `login()` service on valid form submission. During submission, the "Sign In" button SHALL be disabled and display a `Loader2` spinner. On success, a toast notification SHALL appear, the token SHALL be stored, and the user SHALL be redirected.

#### Scenario: Loading state during submission
- **WHEN** the form is submitted with valid data
- **THEN** the "Sign In" button is disabled and shows a spinner icon

#### Scenario: Successful login
- **WHEN** the mock login API returns success
- **THEN** a success toast appears with the `loginSuccess` message, and the user is redirected

#### Scenario: Failed login (mock error)
- **WHEN** the mock login API returns an error
- **THEN** an inline error message appears below the form using the `invalidCredentials` i18n key

### Requirement: Token storage based on Remember Me
When "Remember me" is checked, the auth token and refresh token SHALL be stored in `localStorage`. When unchecked, tokens SHALL be stored in `sessionStorage`. The storage keys SHALL use `appConfig.auth.tokenKey` and `appConfig.auth.refreshTokenKey`.

#### Scenario: Remember me checked
- **WHEN** the user logs in with "Remember me" checked
- **THEN** tokens are stored in `localStorage`

#### Scenario: Remember me unchecked
- **WHEN** the user logs in with "Remember me" unchecked
- **THEN** tokens are stored in `sessionStorage`

### Requirement: Return-URL redirect after login
After successful login, the Login page SHALL redirect to the URL stored in `location.state.from` (if present), or to `/dashboard` as the default fallback.

#### Scenario: Redirect to return URL
- **WHEN** the user logs in after being redirected from `/inbox`
- **THEN** after login, the user is redirected back to `/inbox`

#### Scenario: Redirect to dashboard (default)
- **WHEN** the user logs in directly (no return URL in state)
- **THEN** the user is redirected to `/dashboard`

### Requirement: Auto-redirect if already authenticated
If the user already has a valid token in localStorage or sessionStorage when visiting `/login`, the Login page SHALL redirect to `/dashboard` immediately.

#### Scenario: Authenticated user visits login
- **WHEN** a user with a token in localStorage navigates to `/login`
- **THEN** they are immediately redirected to `/dashboard`

### Requirement: Forgot password modal
The Login page SHALL include a "Forgot password?" link that opens a modal. The modal SHALL contain an email input and a submit button. On submission, the modal SHALL display a "Check your email" success message without making any API call. The modal SHALL trap focus within its content when open (Tab cycles through focusable elements, Shift+Tab cycles in reverse). Escape key and clicking outside the modal SHALL close it.

#### Scenario: Open forgot password modal
- **WHEN** the user clicks the "Forgot password?" link
- **THEN** a modal opens with an email input field and a submit button

#### Scenario: Submit forgot password
- **WHEN** the user enters an email and submits the forgot password modal
- **THEN** the modal displays a confirmation message (no API call is made)

#### Scenario: Modal focus trap
- **WHEN** the modal is open and the user presses Tab on the last focusable element
- **THEN** focus wraps to the first focusable element in the modal

### Requirement: Sign up link
The Login page SHALL include a "Don't have an account? Sign up" link that navigates to `/register`.

#### Scenario: Navigate to registration
- **WHEN** the user clicks the "Sign up" link
- **THEN** they are navigated to the `/register` route

### Requirement: Login page accessibility
All form inputs SHALL have linked labels via `htmlFor`/`id`, `aria-required="true"` on required fields, and visible focus rings. Error messages SHALL be linked to inputs via `aria-describedby`.

#### Scenario: Screen reader form labels
- **WHEN** a screen reader encounters the email input
- **THEN** it announces the associated label text

#### Scenario: Focus ring visibility
- **WHEN** the user tabs to the email input
- **THEN** a visible focus ring appears around the input
