## MODIFIED Requirements

### Requirement: TopNav composition
The TopNav component SHALL render a fixed header containing a search input, notification bell (with red indicator dot), LanguageSwitcher dropdown, and user profile section (avatar, name, role). Its left position SHALL adjust dynamically based on sidebar collapse state. The user-profile avatar SHALL render `getStoredUser()?.avatar` via `<img src=...>` when present and SHALL fall back to the existing `ui-avatars.com` initials URL when absent. TopNav SHALL subscribe to the global `auth-user-changed` `CustomEvent` and re-render so any change to the stored user (name, avatar, etc.) is reflected immediately in the same tab without a route navigation.

#### Scenario: TopNav elements
- **WHEN** TopNav renders
- **THEN** search input, notification bell, LanguageSwitcher, and user profile are all visible

#### Scenario: Sidebar-aware positioning
- **WHEN** the sidebar is collapsed
- **THEN** TopNav adjusts its left offset to 80px (collapsed sidebar width)

#### Scenario: Avatar from stored user
- **WHEN** TopNav renders and `getStoredUser()?.avatar` is a non-empty string
- **THEN** the user-profile avatar `<img>` SHALL use that value as its `src`

#### Scenario: Avatar fallback to ui-avatars
- **WHEN** TopNav renders and `getStoredUser()?.avatar` is `undefined` or empty
- **THEN** the user-profile avatar SHALL use the `ui-avatars.com` initials URL constructed from the user's name

#### Scenario: Re-render on auth-user-changed
- **WHEN** the `auth-user-changed` `CustomEvent` is dispatched on `window`
- **THEN** TopNav SHALL re-render
- **AND** the next render SHALL re-read `getStoredUser()` so the avatar and the name/role line reflect the latest values

#### Scenario: Listener cleanup on unmount
- **WHEN** TopNav unmounts
- **THEN** its `auth-user-changed` listener SHALL be removed from `window`
