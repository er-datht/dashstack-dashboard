## ADDED Requirements

### Requirement: Auth service module
A new `src/services/auth.ts` module SHALL export `login()` and `register()` functions following the existing domain service pattern (e.g., `src/services/todo.ts`).

#### Scenario: Service module exports
- **WHEN** a component imports from `src/services/auth.ts`
- **THEN** `login` and `register` functions are available

### Requirement: Mock login function
The `login()` function SHALL accept `LoginCredentials` (from `src/types/auth.ts`) and return a `Promise<AuthResponse>`. It SHALL simulate an API delay (800-1200ms) and return a mock response with a fake JWT token, a mock user object, and an expiry value. The user name SHALL be resolved from the `registered_user` localStorage key if the email matches, falling back to the email prefix (before `@`).

#### Scenario: Successful login
- **WHEN** `login()` is called with valid credentials
- **THEN** it resolves after a delay with an `AuthResponse` containing a token, user, and expiresIn

#### Scenario: Login with previously registered email
- **WHEN** `login()` is called with an email that matches a previously registered user
- **THEN** the returned user name matches the name provided during registration

#### Scenario: Login without prior registration
- **WHEN** `login()` is called with an email that has no matching registration
- **THEN** the returned user name is the email prefix (before `@`)

### Requirement: Mock register function
The `register()` function SHALL accept `RegisterData` (from `src/types/auth.ts`) and return a `Promise<{ success: boolean; message: string }>`. It SHALL simulate an API delay, store the user's name and email in localStorage under `registered_user`, and return a success response.

#### Scenario: Successful registration
- **WHEN** `register()` is called with valid registration data
- **THEN** it resolves after a delay with `{ success: true, message: 'Registration successful' }`

#### Scenario: Registration persists user data
- **WHEN** `register()` completes successfully
- **THEN** the user's name and email are saved to localStorage under `registered_user`

### Requirement: Token utility functions
The auth service SHALL export helper functions: `getStoredToken()` to retrieve the token from localStorage or sessionStorage, `storeTokens(token, refreshToken, storage)` to save tokens to the specified storage, and `clearTokens()` to remove tokens, user data, and registered user data from both storages.

#### Scenario: Get token from localStorage
- **WHEN** a token exists in localStorage under `appConfig.auth.tokenKey`
- **THEN** `getStoredToken()` returns that token

#### Scenario: Get token from sessionStorage fallback
- **WHEN** no token exists in localStorage but one exists in sessionStorage
- **THEN** `getStoredToken()` returns the sessionStorage token

#### Scenario: Store tokens in localStorage
- **WHEN** `storeTokens(token, refreshToken, 'local')` is called
- **THEN** both tokens are saved to localStorage using appConfig keys

#### Scenario: Clear all tokens
- **WHEN** `clearTokens()` is called
- **THEN** tokens and user data are removed from both localStorage and sessionStorage

### Requirement: User data storage functions
The auth service SHALL export `storeUser(user, storage)` to save user data (name, email, role) to the specified storage, and `getStoredUser()` to retrieve it from localStorage or sessionStorage.

#### Scenario: Store user data
- **WHEN** `storeUser({ name, email, role }, 'local')` is called
- **THEN** the user object is saved to localStorage under `auth_user`

#### Scenario: Get stored user
- **WHEN** user data exists in localStorage under `auth_user`
- **THEN** `getStoredUser()` returns the user object

#### Scenario: TopNav displays stored user
- **WHEN** a logged-in user views any dashboard page
- **THEN** the TopNav shows the stored user's name and role instead of hardcoded values
