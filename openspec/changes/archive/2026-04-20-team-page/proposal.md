## Why

The Team page currently shows a placeholder. It needs to be a fully functional page mirroring the Contact page pattern — a card grid of team members with avatar photos and names, an "Add New Member" button, and a companion form page to add new members. This fills the remaining gap in the PAGES sidebar section.

## What Changes

- Replace the placeholder Team page (`src/pages/Team/index.tsx`) with a card grid layout showing team member avatars and names, with "Load More" pagination (6 per page)
- Add a `TeamCard` component for individual member cards (avatar with fallback, name display, "Message" button navigating to Inbox)
- Add mock data for 12 team members with randomuser.me avatar URLs
- Create an "Add New Member" form page at `/team/add` with photo upload, 6-field form (same structure as AddNewContact), validation, and toast feedback
- Add `ADD_TEAM` route constant and route definition in AppRoutes
- Create `TeamMember` type definition
- Add i18n translations for `team` namespace (en/jp)
- Register `team` namespace in i18n config

## Capabilities

### New Capabilities
- `team-card-grid`: Team listing page with responsive card grid, Load More pagination, and team member cards
- `add-new-member-form`: Add New Member form page with photo upload, validation, and submission flow

### Modified Capabilities

## Impact

- **Files modified**: `src/pages/Team/index.tsx` (rewrite), `src/routes/routes.ts` (add ADD_TEAM), `src/routes/AppRoutes.tsx` (add AddNewMember route), `i18n.ts` (register team namespace)
- **New files**: `src/pages/Team/TeamCard.tsx`, `src/pages/Team/teamData.ts`, `src/pages/Team/AddNewMember/index.tsx`, `src/types/team.ts`, `public/locales/en/team.json`, `public/locales/jp/team.json`
- **No new dependencies** — uses existing lucide-react, react-router-dom, react-i18next, classnames
