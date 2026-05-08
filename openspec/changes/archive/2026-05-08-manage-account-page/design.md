## Context

The DashStack auth flow stores a `User` record in either localStorage or sessionStorage (controlled by the login form's `rememberMe` checkbox). The TopNav header reads this record on every render via `getStoredUser()` to display the avatar (currently always the `ui-avatars.com` initials fallback) and the name/role line. The TopNav UserMenu dropdown surfaces four actions, only one of which is wired today (Log out); the other three — Manage Account, Change Password, Activity Log — fire a "Coming Soon" toast through a shared placeholder handler.

The Settings page (`/settings`) provides the canonical pattern this project uses for "form with avatar/logo upload, validation, and a single Save button": drag-and-drop circular uploader at the top, two-column form body that collapses to one column below `md`, centered Save button with a loading state, and a top-right toast banner. EditProduct provides the canonical pattern for a 2 MB cap on a per-record image stored as a data URL in localStorage. Inbox already snapshots `senderName` at send time, so there is no risk of identity drift on existing messages when the display name changes.

There is no central auth context or global user store — `getStoredUser()` is a direct synchronous read called from many sites. This is the constraint the design has to work around.

## Goals / Non-Goals

**Goals:**

- Give the user a working profile page reachable from the TopNav UserMenu, with the same UX shape they already know from Settings.
- Persist edits to the existing `auth_user` record in whichever storage it lives in (no behavior change for `rememberMe`).
- Make the change visible everywhere TopNav reads the user — specifically the header avatar and name — without introducing a new context provider or refactoring every consumer.
- Keep the avatar usable across reloads (data URL persistence), bounded so localStorage doesn't fill up.
- Maintain en/jp i18n parity and 3-theme support as project rules require.

**Non-Goals:**

- Server-side persistence. Everything lives in localStorage/sessionStorage.
- A new `AuthContext` or wider state-management refactor. Out of scope and would expand the blast radius far past this change.
- Wiring Change Password or Activity Log. They stay as placeholders.
- Updating Inbox sender identity for already-sent messages. Snapshots are intentional.
- Adding Manage Account to the sidebar. The user dropdown is the only entry point.
- Any change to login, registration, or token handling.

## Decisions

### 1. New `updateStoredUser(patch)` helper instead of widening `storeUser`

`src/services/auth.ts` already exports `storeUser(user, storage)` with a narrow `{ name, email, role }` shape. It is called from the login flow. Adding a separate `updateStoredUser(patch: Partial<User>)`:

- keeps the login flow's signature and behavior unchanged (no event fired on login),
- detects the existing storage location (`localStorage` first, then `sessionStorage`) and writes back to the *same* one — preserving `rememberMe`,
- merges the partial patch into the existing record (returns the merged record),
- dispatches `window.dispatchEvent(new CustomEvent("auth-user-changed"))` AFTER the synchronous write so subscribers see the latest state.

**Alternative considered:** widen `storeUser` to accept `Partial<User>` and dispatch the event from there. Rejected because login would also fire the event on every successful auth, which would force every TopNav re-render path to handle a "fresh login" case that is already handled by the route navigation. Two helpers with two intents is clearer than one helper that branches on context.

### 2. `auth-user-changed` `CustomEvent` over context lift

TopNav subscribes via `useEffect` and re-reads stored user state when the event fires.

The originally prescribed pattern was a `useReducer` bump that forced a re-render so a fresh `getStoredUser()` call could run each render:

```ts
const [, bump] = useReducer(x => x + 1, 0);
useEffect(() => {
  const handler = () => bump();
  window.addEventListener("auth-user-changed", handler);
  return () => window.removeEventListener("auth-user-changed", handler);
}, []);
const storedUser = getStoredUser(); // re-read each render
```

**Implementation note (2026-05-08):** This pattern was found at implementation time to be defeated by the React Compiler, which is enabled project-wide in `vite.config.ts` via `babel-plugin-react-compiler`. The compiler memoized derived values (e.g. the avatar `<img src>`) across `bump` renders even though the underlying `getStoredUser()` call returned a new value, so the avatar would not refresh after the event fired. The shipped implementation uses `useState<User | null>` mirrored from `getStoredUser()` and updated synchronously inside the event listener:

```ts
const [storedUser, setStoredUser] = useState(() => getStoredUser());
useEffect(() => {
  const handler = () => setStoredUser(getStoredUser());
  window.addEventListener("auth-user-changed", handler);
  return () => window.removeEventListener("auth-user-changed", handler);
}, []);
```

The observable behavior is identical (verified by the `TopNav.authUserChanged.test.tsx` suite), and the `useState` mirror works around the compiler interaction by giving it a real changing dependency (`storedUser` reference) for memoized values to track. Future readers should prefer the `useState`-mirror form when adding new event-driven re-renders inside the React Compiler-enabled project.

**Alternative considered:** lift the user record into a new `AuthContext`. Rejected — would require touching every `getStoredUser()` call site (TopNav, Inbox in 6 places, plus tests that mock the function), and the project's pattern is direct localStorage reads (see ProductStock, WishlistContext stores a Set in memory + Array in localStorage). A scoped event matches existing patterns and keeps the diff small.

**Alternative considered:** the native `storage` event. Rejected — fires only on cross-tab writes, not same-tab, so it wouldn't trigger TopNav re-render after Save in the same session.

### 3. Avatar persisted as data URL with 2 MB cap

Settings' logo uploader uses `URL.createObjectURL` (blob URL), which is fine for an in-page preview but is lost on reload. For an avatar that needs to survive reloads we must serialize. We use `FileReader.readAsDataURL` and store the resulting data URL on `User.avatar`.

The cap is 2 MB (matches EditProduct precedent), not 5 MB (Settings precedent), because:

- localStorage per-origin quota is roughly 5–10 MB across all keys; a 5 MB avatar would leave very little headroom for other features (calendar events, wishlist, todos, product stock, draft messages, etc.).
- 2 MB compressed to base64 is ~2.7 MB stored — still substantial but bounded.

The MIME whitelist matches Settings (`image/png`, `image/jpeg`, `image/gif`, `image/svg+xml`, `image/webp`) for consistency.

**Trade-off:** SVG avatars cannot be size-validated by `FileReader` (the file size cap covers it). SVG also opens an XSS surface if the data URL is ever rendered as `dangerouslySetInnerHTML`. We render via `<img src=...>` so this is safe.

### 4. Extend the canonical `User` type rather than a side-table

`src/types/common.ts` is the source of truth. Adding `phone?: string` and `bio?: string` keeps the User contract single-rooted. The fields are optional so existing seed users (and the login mock that constructs a `User` from credentials) compile without changes. Inbox and other consumers only read `name`, `email`, `avatar` — they're insensitive to the new fields.

**Alternative considered:** a separate `auth_user_profile` localStorage key. Rejected — extra plumbing for no benefit, and forces Manage Account to read/write two records atomically.

### 5. Bio counter behavior — soft cap with hard submit-block

The bio textarea allows typing past 200 characters (no `maxLength` HTML attribute) but:

- the live counter (`n / 200`) turns the error color when `n > 200`,
- the form's `validate()` returns false if `bio.length > 200`,
- the field gets `aria-invalid="true"` and an `aria-describedby` error message.

This matches the Settings pattern's "validate on save, surface errors" idiom rather than blocking keystrokes mid-type, which is more accessible.

### 6. Layout matches Settings exactly

Page background = `bg-page`. Card body = `card p-8`. 2-col grid below the avatar. Save button = same primary style centered. The deliberate consistency makes Manage Account feel native to the dashboard and reduces visual debt.

The avatar block centers the circular dropzone, with an "Upload Photo" / "Remove Photo" label below — the same pattern Settings uses for the logo. The "Member since {date}" line lives BELOW the read-only Email and Role badges so the visual hierarchy reads: editable form → identity facts → metadata.

### 7. New `manageAccount` i18n namespace

Settings owns site/SEO copy. Manage Account owns user-profile copy. They are conceptually distinct domains; piggybacking would couple two unrelated translation surfaces. Cost is one register-list entry plus two JSON files (en + jp).

## Risks / Trade-offs

- **[localStorage quota with avatar]** → Mitigation: 2 MB file cap + the user is informed via a toast or inline error if the upload is rejected. If `localStorage.setItem` throws (`QuotaExceededError`), `updateStoredUser` catches and returns `false`; Manage Account surfaces a "Save failed: storage full" error toast.
- **[`auth-user-changed` event listener leaks]** → Mitigation: every subscriber pairs the `addEventListener` with a `removeEventListener` cleanup in the same `useEffect`. Verified by unit tests.
- **[TopNav re-render performance]** → The event fires only on Save, not on every keystroke. Re-render cost is one component tree (TopNav). No measurable risk.
- **[Inbox sees stale name in long-running sessions]** → Inbox calls `getStoredUser()` at send time, not at compose-open. After Save, the next send picks up the new name. Already-sent messages keep their snapshot. No spec/design change required.
- **[SVG avatar XSS]** → Rendered exclusively via `<img src=...>`. No `dangerouslySetInnerHTML`. Safe.
- **[Existing User-typed code does not handle new fields]** → Optional fields, so all existing destructuring/spreading continues to work. No callsites need to change.

## Migration Plan

No data migration is needed. The User type's new fields are optional, so:

- Existing localStorage records (no `phone`/`bio` keys) read back as `undefined` for those fields. The form prefills empty strings.
- On first Save, the merged record gains `phone`/`bio`/`avatar` keys.
- No rollback strategy needed — pure additive change. If the feature must be reverted, removing the page + the helper + the event listener leaves the auth state unchanged.

## Open Questions

None. All design decisions were resolved during the requirements-analyst pass.
