## Context

The Team page displays members from a hardcoded `mockTeamMembers` array. The `AddPersonForm` component handles validation and shows a success toast, but discards form data — there is no persistence layer. The existing `useLocalStorage` hook provides a `useState`-like API backed by `localStorage`, already used by Inbox and Wishlist features.

## Goals / Non-Goals

**Goals:**
- New team members persist to localStorage and appear in the team list immediately after form submission
- Minimal changes to the shared `AddPersonForm` component — backward compatible
- Use existing `useLocalStorage` hook, no new dependencies

**Non-Goals:**
- API integration or backend persistence
- Applying this pattern to the Contact page (separate change)
- Editing or deleting team members
- Photo persistence beyond blob URLs (blob URLs don't survive page refresh — acceptable)

## Decisions

### 1. Optional `onSubmit` callback on AddPersonForm

**Choice**: Add an optional `onSubmit?: (data: PersonFormData) => void` prop. When provided, call it with the form data after validation passes, before the save simulation. When absent, behavior is unchanged.

**Why not a Context or event bus**: The form is used by exactly two pages (Team, Contact). A callback prop is the simplest coupling — no new abstractions needed. Context would over-engineer a two-consumer scenario.

**`PersonFormData` type**: Exported from `AddPersonForm`, containing `firstName`, `lastName`, `email`, `phone`, `dateOfBirth`, `gender`, `photoPreview` (blob URL or null). This keeps the form's data shape self-contained.

### 2. localStorage via existing `useLocalStorage` hook

**Choice**: Team page calls `useLocalStorage<TeamMember[]>('team-members', mockTeamMembers)` to initialize from mock data on first load and persist additions.

**Why not React Context**: Context would lose data on refresh. The user explicitly requested localStorage. The hook already exists and handles serialization/error recovery.

**Key**: `'team-members'` — namespaced to avoid collision.

### 3. Prepend new members to the list

**Choice**: New members are inserted at index 0 so they appear at the top of the grid, immediately visible without scrolling or clicking "Load More".

### 4. ID generation

**Choice**: `Date.now().toString()` — simple, unique-enough for client-side mock data. No collision risk with the existing IDs `"1"`-`"12"`.

## Risks / Trade-offs

- **Blob URL photos don't persist across page refresh** → Acceptable for mock data. After refresh, avatar will be `undefined` and the card will show a fallback. Documenting this as known behavior.
- **localStorage size limit (~5MB)** → Not a concern for team member objects (tiny JSON). Would only matter if storing actual image data, which we're not.
- **No sync between tabs** → `useLocalStorage` doesn't listen for `storage` events. Single-tab usage is the expected scenario for this dashboard.
