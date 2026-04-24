## Why

The Login page is currently a non-functional skeleton — no form state, no validation, no API integration, no i18n, broken CSS classes, and poor accessibility. Users cannot authenticate. A Registration page does not exist despite the API endpoint and types being defined. The `withAuth` HOC is a stub that always returns `isAuthenticated = true`, meaning protected routes are not guarded. These gaps block the entire authentication flow.

## What Changes

- **Redesign Login page** — functional form with email/password fields, password visibility toggle, "Remember me" checkbox, "Forgot password?" modal (visual-only), client-side validation, inline error display, loading state, mock API submission, token storage (localStorage or sessionStorage based on "Remember me"), success toast, return-URL redirect support, full i18n (en/jp), accessibility (linked labels, aria attributes, focus rings), all 3 themes
- **Add Registration page** — new `/register` route with full name, email, password, confirm password fields, client-side validation, mock API submission, redirect to login with success message, i18n, same visual style as login
- **Create auth service** — `src/services/auth.ts` following domain service pattern with mock `login()` and `register()` functions
- **Fix withAuth HOC** — check for real token in localStorage, redirect unauthenticated users to `/login` with `from` location state for return-URL support
- **Auto-redirect from login** — if user already has a token, redirect from `/login` to `/dashboard`
- **Add "Sign up" link** on Login page and "Sign in" link on Registration page for navigation between auth pages

## Capabilities

### New Capabilities
- `auth-login`: Login page UI, form logic, validation, mock submission, token storage, return-URL redirect, auto-redirect if authenticated
- `auth-register`: Registration page UI, form logic, validation, mock submission, redirect to login
- `auth-service`: Mock authentication service module (login, register functions)

### Modified Capabilities
- `route-config`: Adding `/register` route constant and lazy-loaded route entry
- `app-shell`: Fixing `withAuth` HOC to check real token and capture return URL

## Impact

- **New files**: `src/pages/Register/index.tsx`, `src/services/auth.ts`
- **Modified files**: `src/pages/Login/index.tsx`, `src/hoc/withAuth.tsx`, `src/routes/routes.ts`, `src/routes/AppRoutes.tsx`, `public/locales/en/auth.json`, `public/locales/jp/auth.json`
- **No new dependencies** — uses existing lucide-react, react-router, react-i18next, classnames
- **Behavioral change**: Protected routes will now actually redirect to `/login` when no token is present (currently all routes are accessible)
