## Why

The TopNav header displays a static user profile section (avatar, name, role) with no interactivity. Users need a dropdown menu to access account-related actions — Manage Account, Change Password, Activity Log, and Log out — matching the Figma design (node 5:3635). This is a core UX feature expected in any dashboard application.

## What Changes

- Add a clickable user profile trigger in the TopNav that opens a dropdown menu
- Create a `UserMenu` dropdown component with 4 menu items, each with a gradient-colored icon:
  - **Manage Account** (blue gradient) — placeholder action
  - **Change Password** (pink gradient) — placeholder action
  - **Activity Log** (purple gradient) — placeholder action
  - **Log out** (red gradient) — navigates to login page
- Dropdown supports click-outside and Escape key to close
- Dropdown is theme-aware (light/dark/forest) using CSS variables
- Dropdown is accessible with keyboard navigation and ARIA attributes
- Uses lucide-react icons consistent with the rest of the app

## Capabilities

### New Capabilities
- `user-menu`: User profile dropdown menu in TopNav header — trigger, dropdown panel, menu items with gradient icons, close behaviors, keyboard accessibility, and theme support

### Modified Capabilities
<!-- No existing spec-level requirements are changing. The TopNav layout remains the same;
     we are adding new interactive behavior to the existing user profile section. -->

## Impact

- **Code**: `src/components/TopNav/index.tsx` (add click handler to profile section, render UserMenu), new `src/components/UserMenu/index.tsx` component
- **Styling**: New CSS variables for dropdown background/border/text across all 3 themes in `src/index.css`
- **Dependencies**: No new dependencies — uses existing lucide-react, cn() utility, and React hooks
- **i18n**: New translation keys in `common` or `navigation` namespace for menu item labels
