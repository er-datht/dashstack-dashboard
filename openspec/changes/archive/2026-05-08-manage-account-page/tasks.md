## 1. Type and Auth Service

- [x] 1.1 Extend `User` type in `src/types/common.ts` with `phone?: string` and `bio?: string`
- [x] 1.2 Add `updateStoredUser(patch: Partial<User>): boolean` helper to `src/services/auth.ts` that detects existing storage (localStorage first, then sessionStorage), merges the patch, writes back to the same storage location, catches storage errors and returns `boolean`, and dispatches `window.dispatchEvent(new CustomEvent("auth-user-changed"))` only on successful writes
- [x] 1.3 Verify `storeUser` is unchanged (login flow still does NOT dispatch `auth-user-changed`)

## 2. Routing

- [x] 2.1 Add `MANAGE_ACCOUNT: "/manage-account"` to the `ROUTES` object in `src/routes/routes.ts`
- [x] 2.2 Register a lazy-loaded `<Route path={ROUTES.MANAGE_ACCOUNT}>` inside `DashboardLayout` in `src/routes/AppRoutes.tsx` and ensure the route is wrapped by `withAuth`
- [x] 2.3 Confirm Sidebar `navigationData.ts` is NOT modified (Manage Account is only reachable via the user dropdown)

## 3. UserMenu Wiring

- [x] 3.1 In `src/components/UserMenu/index.tsx`, change the `manageAccount` menu item's `action` from `"placeholder"` to a navigation action
- [x] 3.2 In the click handler, when `action` indicates navigation, call `navigate(ROUTES.MANAGE_ACCOUNT)` and `onClose()`; do NOT show a toast
- [x] 3.3 Leave the Change Password and Activity Log items as placeholder actions

## 4. TopNav Avatar and Subscription

- [x] 4.1 In `src/components/TopNav/index.tsx`, add a `useReducer`-based bump (or `useState` counter) and a `useEffect` that subscribes to `window` `auth-user-changed` and triggers a re-render; clean up the listener on unmount
- [x] 4.2 Update the user-profile avatar render path to use `<img src={storedUser?.avatar} />` when `storedUser?.avatar` is a non-empty string, falling back to the existing `ui-avatars.com` URL otherwise
- [x] 4.3 Verify TopNav still re-reads `getStoredUser()` on every render (no caching that would defeat the bump)

## 5. i18n

- [x] 5.1 Register the new `manageAccount` namespace in the `ns` array in `i18n.ts` (project root)
- [x] 5.2 Create `public/locales/en/manageAccount.json` with all keys: page heading, avatar upload labels, field labels (displayName, email, phone, bio, role, memberSince), placeholders, error messages (required, tooLong, fileTooLarge, fileWrongType, storageFull), Save button label, success/error toast messages, character-counter format
- [x] 5.3 Create `public/locales/jp/manageAccount.json` with full key parity to the en file (Japanese translations)

## 6. Manage Account Page Component

- [x] 6.1 Scaffold `src/pages/ManageAccount/index.tsx` as a default-exported functional component returning `React.JSX.Element`
- [x] 6.2 Initialize state via `useState` initializers reading `getStoredUser()` once for: `displayName`, `phone`, `bio`, `avatarPreview` (data URL or null); read `email`, `role`, `createdAt` for read-only display
- [x] 6.3 Implement avatar uploader: hidden `<input type="file" accept="image/*">`, drag-drop circular dropzone, dashed-vs-solid border state, click handler, drag handlers, keyboard activation (Enter/Space), `FileReader.readAsDataURL` for valid files, MIME whitelist check (`image/png`, `image/jpeg`, `image/gif`, `image/svg+xml`, `image/webp`), 2 MB size cap, "Upload Photo" / "Remove Photo" toggle button, inline avatar error message
- [x] 6.4 Render the form card with heading and `card p-8` container; 2-col grid `grid-cols-1 md:grid-cols-2 gap-6`
- [x] 6.5 Render Display Name editable input with required asterisk, `aria-invalid` and `aria-describedby` on error, inline error text
- [x] 6.6 Render Email and Role read-only badges (visually disabled-input or badge styling) with values from the stored user
- [x] 6.7 Render Phone optional input
- [x] 6.8 Render Bio textarea (full-width row 3) with a live `n / 200` counter beneath it, no `maxLength` HTML attribute, counter colored normally for `n ≤ 200` and error-colored for `n > 200`, `aria-invalid` and `aria-describedby` when over cap
- [x] 6.9 Render "Member since {formatted createdAt}" line; format via the browser locale-aware date formatter; omit the line when `createdAt` is missing
- [x] 6.10 Implement `validate()`: trims display name, blocks empty / >60 / bio>200; sets per-field error flags; returns boolean
- [x] 6.11 Implement `handleSave()`: run `validate()`; if pass, set `isSaving=true`, build patch `{ name, phone: phone || undefined, bio: bio || undefined, avatar: avatarPreview ?? undefined }`, after 800 ms call `updateStoredUser(patch)`; on `true` show success toast and clear `isSaving`; on `false` show error toast and clear `isSaving`
- [x] 6.12 Render centered Save button matching Settings styling; disable while `isSaving` and show a `Loader2` spinner
- [x] 6.13 Render top-right toast with auto-dismiss after 3000 ms; clear timer on unmount; reuse `useRef<ReturnType<typeof setTimeout> | null>(null)` pattern
- [x] 6.14 Verify all literal strings are wrapped in `t()` from the `manageAccount` namespace (no English strings inline)
- [x] 6.15 Verify the component uses theme-aware tokens / utility classes (no hardcoded hex)

## 7. Tests

- [x] 7.1 Unit-test `updateStoredUser` for: localStorage merge, sessionStorage merge, no-existing-record returns false, quota error returns false, event dispatched on success, event suppressed on failure
- [x] 7.2 Unit-test that `storeUser` does NOT dispatch `auth-user-changed`
- [x] 7.3 Unit-test ManageAccount page: prefill from stored user, Display Name required, Display Name >60 blocked, Bio >200 blocked with counter color change, optional Phone allowed, Save calls `updateStoredUser` with the merged patch, Save success shows toast, Save failure shows error toast
- [x] 7.4 Unit-test ManageAccount avatar: oversize file rejected, wrong-MIME file rejected, valid file applied as data URL, Remove Photo clears preview
- [x] 7.5 Unit-test UserMenu: clicking Manage Account calls `navigate("/manage-account")`, clicking Change Password / Activity Log still shows the Coming Soon toast
- [x] 7.6 Unit-test TopNav: subscribes to and unsubscribes from `auth-user-changed`, re-renders with new avatar after dispatch, falls back to `ui-avatars` when avatar is absent

## 8. Validation

- [x] 8.1 Run `yarn lint` and address any warnings/errors introduced
- [x] 8.2 Run `yarn test` and confirm all tests pass
- [x] 8.3 Run `yarn build` and confirm the production build succeeds
- [x] 8.4 Manually verify in dev: navigate from UserMenu → Manage Account, change Display Name + upload avatar + save, verify TopNav avatar and name update without page reload, switch themes (light/dark/forest) and switch languages (en/jp), verify the page renders correctly in each combination, hard-reload and confirm changes persist
- [x] 8.5 Run `npx openspec validate manage-account-page` and confirm "is valid"
