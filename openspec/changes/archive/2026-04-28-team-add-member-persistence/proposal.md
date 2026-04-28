## Why

The "Add New Member" form on the Team page collects data but never persists it — after submission, the form shows a success toast and navigates back, but the new member does not appear in the team list. The team list reads from a static `mockTeamMembers` array, so user-added members are lost.

## What Changes

- **AddPersonForm gains an optional `onSubmit` callback** that receives form data on successful submission, keeping backward compatibility with the Contact page.
- **AddNewMember wrapper passes an `onSubmit` handler** that constructs a `TeamMember` object and saves it to localStorage.
- **Team listing page reads from localStorage** (via existing `useLocalStorage` hook) instead of the static `mockTeamMembers` import, initializing from mock data on first load.
- **New members are prepended** to the list so they appear at the top immediately after navigation.

## Capabilities

### New Capabilities

- `team-member-persistence`: Client-side persistence of team members via localStorage, bridging AddPersonForm submission to the team list display.

### Modified Capabilities

- `add-person-form`: AddPersonForm gains an optional `onSubmit` callback prop for passing form data to the parent.
- `team-card-grid`: Team listing reads from localStorage-backed state instead of static mock data.

## Impact

- **Files modified**: `src/components/AddPersonForm/index.tsx`, `src/pages/Team/index.tsx`, `src/pages/Team/AddNewMember/index.tsx`
- **No new dependencies** — uses existing `useLocalStorage` hook
- **No API changes** — purely client-side
- **Contact page unaffected** — `onSubmit` is optional, Contact's `AddNewContact` wrapper doesn't pass it
