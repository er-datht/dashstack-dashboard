## 1. Auth Service & Token Utilities

- [x] 1.1 Create `src/services/auth.ts` with mock `login()` function that accepts `LoginCredentials`, simulates delay, returns `AuthResponse` with fake token and mock user
- [x] 1.2 Add mock `register()` function that accepts `RegisterData`, simulates delay, returns success response
- [x] 1.3 Add token utility functions: `getStoredToken()` (checks localStorage then sessionStorage), `storeTokens(token, refreshToken, storage)`, `clearTokens()` (removes from both storages)

## 2. withAuth HOC & Route Config

- [x] 2.1 Update `src/hoc/withAuth.tsx` to check token via `getStoredToken()`, redirect to `/login` with `{ from: location.pathname }` in state if no token, render component if token exists
- [x] 2.2 Add `REGISTER: "/register"` to `ROUTES` object in `src/routes/routes.ts`
- [x] 2.3 Add lazy-loaded Register import, Register public route, and wrap DashboardLayout route element with `withAuth` in `src/routes/AppRoutes.tsx`

## 3. i18n Translation Keys

- [x] 3.1 Add registration-related keys to `public/locales/en/auth.json`: `registerTitle`, `registerSubtitle`, `registerButton`, `name`, `namePlaceholder`, `confirmPassword`, `nameRequired`, `passwordMinLength`, `passwordMismatch`, `registerSuccess`, `forgotPasswordTitle`, `forgotPasswordSubtitle`, `forgotPasswordButton`, `forgotPasswordSuccess`, `signUpLink`, `signInLink`, `emailPlaceholder`, `passwordPlaceholder`, `confirmPasswordPlaceholder`
- [x] 3.2 Add corresponding Japanese translations to `public/locales/jp/auth.json`

## 4. Login Page Redesign

- [x] 4.1 Rewrite `src/pages/Login/index.tsx` with: DashStack branding heading + subtitle, form state management (`useState` for email, password, rememberMe, errors, isSubmitting), password visibility toggle with Eye/EyeOff icons, "Remember me" checkbox
- [x] 4.2 Add form validation (email required + format, password required) with inline error display using `text-error text-sm mt-1`, aria attributes (`aria-required`, `aria-describedby`, `aria-invalid`), linked labels via `htmlFor`/`id`
- [x] 4.3 Add form submission handler: call mock `login()`, show loading state (disabled button + Loader2 spinner), store tokens based on "Remember me", show success toast, redirect to `location.state.from` or `/dashboard`
- [x] 4.4 Add auto-redirect if already authenticated (check `getStoredToken()` on mount, redirect to `/dashboard`)
- [x] 4.5 Add "Forgot password?" modal: email input, submit shows "Check your email" message (no API call), close button
- [x] 4.6 Add "Don't have an account? Sign up" link navigating to `/register`
- [x] 4.7 Handle registration success message: if `location.state.registrationSuccess`, show success toast on mount

## 5. Registration Page

- [x] 5.1 Create `src/pages/Register/index.tsx` with same centered card layout as Login, DashStack branding, form fields (name, email, password, confirm password), form state management
- [x] 5.2 Add form validation: name required, email required + format, password required + min 8 chars, confirm password must match. Inline error display, aria attributes, linked labels
- [x] 5.3 Add form submission handler: call mock `register()`, loading state, redirect to `/login` with `{ registrationSuccess: true }` in route state
- [x] 5.4 Add auto-redirect if already authenticated
- [x] 5.5 Add "Already have an account? Sign in" link navigating to `/login`

## 6. Axios Interceptor Update

- [x] 6.1 Update token retrieval in `src/configs/api.ts` request interceptor to use `getStoredToken()` (checks both localStorage and sessionStorage) instead of only localStorage
- [x] 6.2 Update UserMenu logout to use `clearTokens()` from auth service and pass `{ from: location.pathname }` when navigating to login

## 7. Verification

- [x] 7.1 Verify all 3 themes render correctly on Login and Register pages
- [x] 7.2 Verify form validation, submission, token storage, and redirect flows work end-to-end
- [x] 7.3 Verify `withAuth` guards dashboard routes and return-URL works after login
- [x] 7.4 Run `yarn build` and `yarn lint` to confirm no errors
