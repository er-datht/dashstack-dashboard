## Why

When navigating to sub-route pages like Team detail (`/team/:id`), Add Team (`/team/add`), Contact detail (`/contact/:id`), or Add Contact (`/contact/add`), the sidebar defaults to highlighting "Dashboard" instead of the parent nav item (Team or Contact). This breaks the user's sense of location within the app.

## What Changes

- Fix the `activeItemId` derivation in the Sidebar component to support prefix-based route matching as a fallback when no exact route match is found
- Sub-routes like `/team/:id`, `/team/add`, `/contact/:id`, `/contact/add` will keep their parent nav item highlighted

## Capabilities

### New Capabilities

_(none — this is a bug fix within an existing capability)_

### Modified Capabilities

- `sidebar-navigation`: Add requirement for active-state highlighting on sub-routes — the sidebar must keep the parent nav item selected when the current path is a child of that item's route

## Impact

- `src/components/Sidebar/index.tsx` — `activeItemId` useMemo logic
- No new dependencies, no API changes, no breaking changes
