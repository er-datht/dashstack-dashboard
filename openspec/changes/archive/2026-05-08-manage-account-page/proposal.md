## Why

The TopNav user dropdown's "Manage Account" item is currently a placeholder that fires a "Coming Soon" toast. Users have no way to view or edit their own profile (display name, avatar, phone, bio), and TopNav permanently shows the seed initials and `ui-avatars.com` fallback. This change makes the entry point real, gives the user a profile page they can edit, and propagates changes to TopNav so the avatar/name reflect the saved state in-session.

## What Changes

- Add a new **Manage Account** page at `/manage-account`, lazy-loaded inside `DashboardLayout`, auth-guarded.
- Wire the TopNav UserMenu's `manageAccount` item to navigate to the new route (replaces the current "Coming Soon" placeholder).
- Page layout mirrors the Settings page idiom: drag-drop circular avatar uploader at top, two-column form (collapses to one column below `md`), centered Save button.
- Editable fields: avatar (optional, 2 MB cap, MIME whitelist `png/jpeg/gif/svg+xml/webp`, persisted as data URL), Display Name (required, trimmed, 1–60 chars), Phone (optional, no format check), Bio (optional, soft cap 200 chars with live `n / 200` counter, hard-block submit when over cap).
- Read-only display: Email, Role, "Member since {formatted createdAt}".
- Extend the canonical `User` type in `src/types/common.ts` with optional `phone` and `bio` fields.
- Add a new `updateStoredUser(patch)` helper in `src/services/auth.ts` that merges a partial patch into the existing record, preserves the existing storage location (localStorage vs sessionStorage — respects `rememberMe`), and dispatches a `window` `CustomEvent("auth-user-changed")` after the write. The existing `storeUser` is unchanged (login flow does not fire the event).
- TopNav subscribes to `auth-user-changed` (via `useEffect` + a state bump) and re-reads `getStoredUser()` so the header avatar and name reflect saved changes immediately. TopNav avatar render uses `storedUser.avatar` when present and falls back to `ui-avatars.com` initials when absent.
- New `manageAccount` i18n namespace registered in `i18n.ts` (→ 18 total), with English and Japanese parity (`public/locales/en/manageAccount.json` + `public/locales/jp/manageAccount.json`).
- Save flow: 800 ms simulated delay → success toast (matches Settings precedent). No Cancel button — the user stays on the page after save.

## Capabilities

### New Capabilities

- `manage-account-page`: User-scoped profile page. Owns the route, layout, form behavior (validation, avatar upload, bio counter), Save flow, "Member since" display, and the read-only field rendering.
- `auth-user-update`: A new `updateStoredUser(patch)` helper plus the `auth-user-changed` `CustomEvent` contract (storage detection, merge semantics, event dispatch). Owned separately from the page so TopNav's subscription and any future consumer have a single source of truth.

### Modified Capabilities

- `user-menu`: The dropdown's "Manage Account" item changes from a placeholder ("Coming Soon" toast) to real navigation to `ROUTES.MANAGE_ACCOUNT`.
- `app-shell`: TopNav header MUST subscribe to `auth-user-changed` and re-render with the latest stored user; TopNav avatar render path MUST prefer `storedUser.avatar` over the `ui-avatars.com` fallback when an avatar is set.

## Impact

**Code touched**:
- `src/types/common.ts` — extend `User` with `phone?: string` and `bio?: string`
- `src/services/auth.ts` — add `updateStoredUser(patch)` helper + `auth-user-changed` event dispatch
- `src/routes/routes.ts` — add `MANAGE_ACCOUNT: "/manage-account"` constant
- `src/routes/AppRoutes.tsx` — register the lazy route inside `DashboardLayout`
- `i18n.ts` (project root) — register `manageAccount` namespace
- `src/components/UserMenu/index.tsx` — wire `manageAccount` action from `placeholder` to navigation
- `src/components/TopNav/index.tsx` — subscribe to `auth-user-changed`, render `storedUser.avatar` with fallback

**Code added**:
- `src/pages/ManageAccount/index.tsx` (page component)
- `public/locales/en/manageAccount.json` and `public/locales/jp/manageAccount.json`
- Unit tests for the page and the `updateStoredUser` helper (TDD)

**Out of scope**:
- Change Password and Activity Log dropdown items (remain placeholders)
- Theme and language toggles (already live in TopNav, not duplicated)
- Sidebar navigation (Manage Account is reachable only via the user dropdown)
- Inbox sender identity retroactive update (already snapshots `senderName` at send time — no change)
- Server-side persistence (this is a localStorage-only mock; no API changes)

**Dependencies**: No new packages.
