## Context

The Login page is a non-functional skeleton with broken CSS classes (`input`, `btn-primary` are undefined). No auth service exists. The `withAuth` HOC is a stub. Registration page does not exist. All auth types (`LoginCredentials`, `RegisterData`, `AuthResponse`), API endpoints (`AUTH.LOGIN`, `AUTH.REGISTER`), i18n keys (en + jp), and token infrastructure (axios interceptors, localStorage keys) are already defined and ready to use.

Existing form patterns in the project (Settings, AddPersonForm) use: `bg-surface-muted border border-default rounded text-primary p-2.5 w-full outline-none` for inputs, boolean-flag validation, inline error text (`text-error text-sm`), `Loader2` spinner, and toast with `setTimeout` auto-dismiss. The login and registration pages will follow these established patterns.

## Goals / Non-Goals

**Goals:**
- Functional login form with client-side validation, mock API call, token storage, and redirect
- Functional registration form with matching visual style
- Auth service module following domain service pattern
- Working `withAuth` HOC that guards protected routes
- Return-URL support (user redirected back to the page they were on before logout)
- Full i18n (en/jp) and all 3 themes (light/dark/forest)
- Accessibility: linked labels, aria attributes, focus rings

**Non-Goals:**
- Real backend integration (all API calls are mocked)
- AuthContext or global auth state management
- Password reset flow (visual-only "forgot password" modal)
- Social login (Google, GitHub, etc.)
- Token refresh logic
- Email verification after registration

## Decisions

### 1. Mock auth service with simulated delay

Mock `login()` and `register()` in `src/services/auth.ts` using `setTimeout` wrapped in a Promise, matching how other domain services simulate API calls. Login accepts any email/password and returns a fake token. Register simulates success after a delay.

**Why**: No backend exists. This matches the project's established pattern for mock services (todos, deals, products all use similar approaches). Swapping to real API calls later requires only changing the service internals.

**Alternative considered**: Using TanStack React Query mutations — rejected because other auth flows in the project (UserMenu logout) use direct localStorage manipulation, not React Query. Adding a query layer for auth alone would be inconsistent.

### 2. Token storage: localStorage vs sessionStorage based on "Remember me"

When "Remember me" is checked, tokens go to `localStorage` (persists across browser sessions). When unchecked, tokens go to `sessionStorage` (cleared when browser closes). The existing axios interceptor reads from `localStorage`, so we also need to check `sessionStorage` as a fallback.

**Why**: This is the standard UX expectation for "Remember me". The existing interceptor in `src/configs/api.ts` only reads `localStorage`, so we'll update the token retrieval to check both storages.

**Alternative considered**: Always use localStorage, send `rememberMe` flag to backend — rejected because there's no backend to handle it.

### 3. Return-URL via React Router location state

When `withAuth` redirects to `/login`, it passes `{ from: location.pathname }` in route state. After successful login, the Login page reads `location.state?.from` and navigates there (falling back to `/dashboard`). The UserMenu logout also preserves the current path: `navigate(ROUTES.LOGIN, { state: { from: location.pathname } })`.

**Why**: React Router's location state is the idiomatic way to pass ephemeral navigation context. No URL params needed, no global state pollution.

**Alternative considered**: URL search params (`/login?redirect=/inbox`) — works but clutters the URL and requires encoding/decoding. Location state is cleaner for same-app navigation.

### 4. withAuth as a Navigate-based redirect (not HOC wrapping)

Update `withAuth` to check for token presence in localStorage/sessionStorage. If no token found, return `<Navigate to="/login" state={{ from: location }} replace />`. This integrates cleanly with React Router v7.

**Why**: The existing HOC pattern is preserved (components wrap with `withAuth(Component)`), but the implementation shifts from rendering "Unauthorized" text to performing a proper redirect. This is the minimal change needed.

**Note**: `withAuth` needs to be applied to the `DashboardLayout` route element in `AppRoutes.tsx`, so a single guard protects all dashboard routes rather than wrapping each page individually.

### 5. Centered card layout, no split layout

Single centered card on `bg-page` background (uses `--color-background`, the darkest shade per theme) with `shadow-lg` for visual lift. Heading uses i18n keys (`loginTitle` / `registerTitle`) for full localization, subtitle text below, then form fields. Consistent between login and registration pages.

**Why**: Matches the user's preference. `bg-page` was chosen over `bg-surface-secondary` because in dark and forest themes, `bg-surface-secondary` is too close to the card's `--color-surface` background, producing poor contrast. `bg-page` uses `--color-background` which provides clear card/page separation across all 3 themes. `shadow-lg` reinforces the card elevation.

**Alternative considered**: `bg-surface-secondary` (original choice) — rejected after visual testing showed near-zero contrast in dark theme.

### 9. Link color uses `--color-primary-500` for cross-theme contrast

Interactive links ("Forgot password?", "Sign up", "Sign in") use `text-[var(--color-primary-500)]` instead of `text-brand-primary` (which uses `--color-primary-600`).

**Why**: `primary-600` in forest theme is `#16a34a` (dark green), which is nearly invisible against the dark green card (`#0f2817`). `primary-500` provides better contrast across all themes: light (`#4880ff`), dark (`#4880ff`), forest (`#22c55e`). `primary-400` was tested but appeared washed out in dark theme.

### 10. User data persistence across register → login flow

The mock `register()` stores the user's name and email in localStorage under `registered_user`. The mock `login()` reads this key and, if the email matches, uses the registered name in the `AuthResponse`. If no match, falls back to the email prefix (before `@`). On successful login, user data (name, email, role) is stored alongside tokens via `storeUser()`. The TopNav reads stored user data via `getStoredUser()` to display the correct name and role.

**Why**: Without a backend, there is no way to persist registration data across the register → login flow. Storing it in localStorage simulates what a real backend would do. This ensures the user sees their registered name (not "Demo User") after logging in.

### 6. Forgot password as a visual-only modal

Clicking "Forgot password?" opens a simple modal with an email input. Submitting shows a "Check your email" success message within the modal. No actual API call is made.

**Why**: No backend exists. Building a full reset flow (new page, email sending, token verification) is out of scope. A modal provides the visual completeness without over-engineering. When a backend is added later, the modal can be wired to the real `PasswordReset` type and API endpoint.

### 7. Auto-redirect from /login if authenticated

Login page checks for an existing token in localStorage/sessionStorage on mount. If found, immediately redirects to `/dashboard` via `<Navigate>`.

**Why**: Prevents the confusing UX of showing a login form to an already-authenticated user.

### 8. Form validation follows existing project patterns

- Boolean error flags: `type LoginErrors = { email?: boolean; password?: boolean }`
- Validation on submit via `validate()` function
- Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Errors cleared on next submit attempt
- Inline error text below fields using `text-error text-sm mt-1`
- Required field indicators with `<span className="text-error">*</span>` on labels

**Why**: Consistency with Settings and AddPersonForm patterns. No new validation library needed.

## Risks / Trade-offs

- **[Risk] Token-only auth check is simplistic** — `withAuth` only checks token presence, not validity or expiry. A stale token will pass the guard but fail on API calls. → Mitigation: The axios 401 interceptor already redirects to `/login` on failed API calls. This provides a second layer of protection. Full token validation can be added when a real backend exists.

- **[Risk] Modifying axios interceptor to check sessionStorage** — Currently reads only from `localStorage`. Adding sessionStorage fallback is a small behavioral change. → Mitigation: The change is additive (check sessionStorage only if localStorage has no token). No existing behavior is broken since sessionStorage was never used before.

- **[Risk] Wrapping DashboardLayout with withAuth** — All dashboard routes become protected at once. → Mitigation: This is the desired behavior. The current state (no protection) is the actual problem. Testing will verify no redirect loops occur.

- **[Trade-off] Mock auth accepts any credentials** — Any email/password combination succeeds. → Acceptable for a demo app with no backend. A "demo mode" notice could be added later if needed.
