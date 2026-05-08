# auth-user-update Specification

## Purpose
Defines the same-tab user-update channel: extends the canonical `User` type with optional profile fields, adds an `updateStoredUser` helper that merges a patch into the existing localStorage/sessionStorage record, and broadcasts changes via a same-tab `auth-user-changed` `CustomEvent` so subscribers (e.g. TopNav) can re-render without a route navigation.

## Requirements

### Requirement: User type extended with optional profile fields
The canonical `User` type in `src/types/common.ts` SHALL include two new optional fields: `phone?: string` and `bio?: string`. Both fields SHALL remain optional so existing User-typed code paths (login mock, Inbox sender identity, TopNav rendering) compile and behave unchanged.

#### Scenario: Optional fields on User
- **WHEN** the `User` type is referenced
- **THEN** it SHALL declare `phone?: string` and `bio?: string` as optional fields alongside the existing fields

#### Scenario: Existing consumers unaffected
- **WHEN** existing code that destructures or spreads `User` is compiled
- **THEN** TypeScript SHALL NOT raise errors due to the added optional fields

### Requirement: updateStoredUser helper merges patch and persists
The `src/services/auth.ts` module SHALL export a function `updateStoredUser(patch: Partial<User>): boolean`. The function SHALL locate the existing user record by checking localStorage first under the `auth_user` key, then sessionStorage if not found in localStorage. If a record exists, it SHALL merge the patch into the existing record (patch fields override; unmodified fields preserved) and write the merged record back to the SAME storage location. The function SHALL return `true` on success and `false` on failure.

#### Scenario: Merge into localStorage record
- **WHEN** an existing user record lives in localStorage and `updateStoredUser({ name: "New Name" })` is called
- **THEN** localStorage `auth_user` SHALL be updated with `{ ...existing, name: "New Name" }`
- **AND** sessionStorage SHALL NOT be modified
- **AND** the function SHALL return `true`

#### Scenario: Merge into sessionStorage record
- **WHEN** an existing user record lives only in sessionStorage and `updateStoredUser({ phone: "555" })` is called
- **THEN** sessionStorage `auth_user` SHALL be updated with `{ ...existing, phone: "555" }`
- **AND** localStorage SHALL NOT be modified
- **AND** the function SHALL return `true`

#### Scenario: Patch preserves untouched fields
- **WHEN** the existing record has `{ name, email, role, createdAt, updatedAt }` and `updateStoredUser({ avatar: "data:..." })` is called
- **THEN** the merged record SHALL contain all original fields plus `avatar`

#### Scenario: No existing record
- **WHEN** `updateStoredUser` is called and no `auth_user` record exists in either storage
- **THEN** the function SHALL return `false`
- **AND** no storage write SHALL occur

#### Scenario: Storage quota exceeded
- **WHEN** `updateStoredUser` attempts a write that throws `QuotaExceededError` (or any storage error)
- **THEN** the function SHALL catch the error and return `false`
- **AND** the existing record SHALL remain unchanged

### Requirement: updateStoredUser dispatches auth-user-changed event
After a successful write, `updateStoredUser` SHALL synchronously dispatch a `CustomEvent` named `auth-user-changed` on the global `window` object. The event SHALL NOT fire when the function returns `false`. The existing `storeUser` (used by login) SHALL NOT dispatch this event.

#### Scenario: Event fires after successful write
- **WHEN** `updateStoredUser` succeeds
- **THEN** `window.dispatchEvent(new CustomEvent("auth-user-changed"))` SHALL be called exactly once

#### Scenario: Event suppressed on failure
- **WHEN** `updateStoredUser` returns `false`
- **THEN** no `auth-user-changed` event SHALL be dispatched

#### Scenario: Login does not fire event
- **WHEN** `storeUser` is called by the login flow
- **THEN** no `auth-user-changed` event SHALL be dispatched

### Requirement: Subscribers receive event in same tab
Components MAY subscribe to the `auth-user-changed` event by attaching a `window` listener. The event SHALL be observable in the same tab (unlike the native `storage` event which fires only cross-tab).

#### Scenario: Same-tab observability
- **WHEN** a component is mounted in the same tab and `updateStoredUser` succeeds
- **THEN** the component's `auth-user-changed` listener SHALL be invoked synchronously
