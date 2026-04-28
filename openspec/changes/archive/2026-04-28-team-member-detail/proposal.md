## Why

Team members can be added but there is no way to view or edit their details after creation. Clicking a team card has no navigation — the only action is "Message" which goes to Inbox. Users need to view and update member information (name, email, phone, etc.) from the team list.

## What Changes

- **Rename `AddPersonForm` to `PersonForm`** across the codebase (component, directory, all imports) since it now serves both add and edit modes. **BREAKING** for import paths only — no external API change.
- **Extend `PersonForm` with `initialValues` and `submitKey` props** to support pre-populating fields and configurable button text ("Add Now" vs "Save").
- **Extend `TeamMember` type** with optional `firstName`, `lastName`, `phone`, `dateOfBirth`, `gender` fields. Update `AddNewMember` to persist these extra fields. Add mock values for existing mock members.
- **New `MemberDetail` page** at `/team/:id` — reads member from localStorage, pre-fills the form, saves updates back on submit.
- **TeamCard becomes clickable** — clicking anywhere on the card (except the Message button) navigates to `/team/:id`.
- **New route** `TEAM_DETAIL: "/team/:id"` added to routes and AppRoutes with lazy loading.
- **Invalid member ID** redirects to `/team`.

## Capabilities

### New Capabilities

- `team-member-detail`: View and edit team member details at `/team/:id`, reusing PersonForm in edit mode.

### Modified Capabilities

- `add-person-form`: Renamed to `person-form`. Component gains `initialValues` and `submitKey` props for edit mode support.
- `team-card-grid`: TeamCard becomes clickable, navigating to detail page. TeamMember type extended with additional fields. Mock data enriched.
- `team-member-persistence`: AddNewMember persists extra fields (firstName, lastName, phone, dateOfBirth, gender). MemberDetail updates members in localStorage.

## Impact

- **Files renamed**: `src/components/AddPersonForm/` → `src/components/PersonForm/`
- **Files modified**: `src/types/team.ts`, `src/pages/Team/teamData.ts`, `src/pages/Team/TeamCard.tsx`, `src/pages/Team/AddNewMember/index.tsx`, `src/pages/Contact/AddNewContact/index.tsx`, `src/routes/routes.ts`, `src/routes/AppRoutes.tsx`, `public/locales/en/team.json`, `public/locales/jp/team.json`
- **Files created**: `src/pages/Team/MemberDetail/index.tsx`
- **No new dependencies**
- **Contact page**: import path updates only, no behavior change
