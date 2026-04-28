## Context

The Team page already implements localStorage persistence via `useLocalStorage<TeamMember[]>("team-members", mockTeamMembers)` in both `AddNewMember` (write) and `Team` (read). The Contact page uses the same `PersonForm` component but discards form data on submit and reads from a static `mockContacts` array. This change mirrors the Team persistence pattern exactly.

## Goals / Non-Goals

**Goals:**
- Persist new contacts to localStorage so they survive page reloads
- Display user-added contacts alongside mock data in the Contact grid
- Follow the established Team persistence pattern for consistency

**Non-Goals:**
- Contact detail/edit page (Team has `MemberDetail`; Contact does not — out of scope)
- Search/filter over contacts
- Syncing contacts with a backend API

## Decisions

### 1. localStorage key: `"contacts"`

Mirrors `"team-members"` naming convention. The `useLocalStorage` hook handles JSON serialization/deserialization and falls back to `mockContacts` when no key exists.

### 2. Extend `Contact` type with optional person fields

Add `firstName?`, `lastName?`, `dateOfBirth?`, `gender?` to the `Contact` type. These are optional because existing mock data doesn't have them, but user-added contacts (via `PersonFormData`) will. This matches how `TeamMember` has these fields.

**Alternative considered**: Create a separate `UserContact` type — rejected because it would complicate the list rendering which expects a single type.

### 3. Enrich mock data with `firstName`/`lastName`

Split each mock contact's `name` into `firstName` and `lastName` fields. This ensures consistent data shape between mock and user-added contacts, matching the Team pattern where `mockTeamMembers` all have these fields.

### 4. Same `onSubmit` pattern as `AddNewMember`

`AddNewContact` will use `useLocalStorage` to get the current contacts array and its setter, construct a `Contact` from `PersonFormData`, and prepend it. The `PersonForm` component already supports the `onSubmit` prop — it's just not being used by Contact.

## Risks / Trade-offs

- **Blob URL avatars are ephemeral** — Photo uploads use `URL.createObjectURL()` which produces blob URLs that don't survive browser restarts. This is the same limitation the Team persistence has. → Accept: consistent with existing pattern.
- **No deduplication** — Two contacts with the same email can be added. → Accept: same as Team behavior, deduplication is out of scope.
