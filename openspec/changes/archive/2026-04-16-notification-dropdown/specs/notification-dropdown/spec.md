## ADDED Requirements

### Requirement: Bell icon toggles notification dropdown
The TopNav bell icon SHALL be a clickable button that toggles the NotificationDropdown. When clicked while the dropdown is closed, the dropdown SHALL open. When clicked while the dropdown is open, the dropdown SHALL close.

#### Scenario: Open dropdown on bell click
- **WHEN** user clicks the bell icon in the TopNav
- **THEN** the NotificationDropdown SHALL appear below the bell icon, aligned to the right edge, with an animated entrance

#### Scenario: Close dropdown on second bell click
- **WHEN** user clicks the bell icon while the notification dropdown is open
- **THEN** the NotificationDropdown SHALL close

#### Scenario: Bell button accessibility
- **WHEN** the TopNav renders
- **THEN** the bell button SHALL have `aria-haspopup="menu"` and `aria-expanded` reflecting the open/closed state

### Requirement: Notification dropdown displays header
The dropdown SHALL display a "Notification" header text at the top, separated from the content area by a bottom border.

#### Scenario: Header renders with text and border
- **WHEN** the notification dropdown is open
- **THEN** a header row SHALL display the translated text for "Notification" with a bottom border separator

### Requirement: Notification dropdown displays four notification items
The dropdown SHALL display exactly 4 notification items in order: Settings, Event Update, Profile, Application Error. Each item SHALL have a colored circle icon (36x36px) with a white Lucide icon inside, a title (14px semibold), and a description (12px gray, single-line truncated).

#### Scenario: Items rendered in correct order
- **WHEN** the notification dropdown is open
- **THEN** the items SHALL appear in order: Settings, Event Update, Profile, Application Error

#### Scenario: Each item displays icon, title, and description
- **WHEN** the notification dropdown is open
- **THEN** each item SHALL display a colored circle icon on the left, a bold title, and a gray truncated description below the title

#### Scenario: Icon circle colors match notification type
- **WHEN** the notification dropdown is open
- **THEN** the Settings icon circle SHALL be solid blue (#4880FF), the Event Update circle SHALL be solid pink (#FE8BDB), the Profile circle SHALL be solid purple (#9E8FFF), and the Application Error circle SHALL be solid red (#FF8F8F)

#### Scenario: Item contains a Lucide icon
- **WHEN** the notification dropdown is open
- **THEN** Settings SHALL use the Lucide `Settings` icon, Event Update SHALL use `Calendar`, Profile SHALL use `User`, and Application Error SHALL use `AlertCircle`, each rendered white inside its colored circle

### Requirement: Clicking a notification item shows "Coming soon" toast
Each notification item SHALL be rendered as a `<button>` with `role="menuitem"`. Clicking an item SHALL close the dropdown and display a "Coming soon" toast notification that auto-dismisses after approximately 2 seconds (matching the UserMenu placeholder pattern).

#### Scenario: Item click closes dropdown and shows toast
- **WHEN** user clicks any notification item
- **THEN** the NotificationDropdown SHALL close
- **AND** a "Coming soon" toast SHALL appear and auto-dismiss after approximately 2 seconds

### Requirement: Clicking the "See all notification" footer shows "Coming soon" toast
Clicking the footer SHALL close the dropdown and display the same "Coming soon" toast.

#### Scenario: Footer click closes dropdown and shows toast
- **WHEN** user clicks the "See all notification" footer
- **THEN** the NotificationDropdown SHALL close
- **AND** a "Coming soon" toast SHALL appear and auto-dismiss after approximately 2 seconds

### Requirement: Notification dropdown displays "See all notification" footer
The dropdown SHALL display a "See all notification" footer text at the bottom, separated from the content area by a top border. The footer text SHALL be centered and gray.

#### Scenario: Footer renders with text and border
- **WHEN** the notification dropdown is open
- **THEN** a footer row SHALL display the translated text for "See all notification" centered with a top border separator


### Requirement: Click outside closes notification dropdown
The NotificationDropdown SHALL close when the user clicks anywhere outside the dropdown container (which includes the bell button and the dropdown panel).

#### Scenario: Click outside closes dropdown
- **WHEN** the notification dropdown is open and user clicks outside the dropdown container
- **THEN** the NotificationDropdown SHALL close

### Requirement: Escape key closes notification dropdown
The NotificationDropdown SHALL close when the user presses the Escape key.

#### Scenario: Escape key dismisses dropdown
- **WHEN** the notification dropdown is open and user presses Escape
- **THEN** the NotificationDropdown SHALL close

### Requirement: Multi-dropdown coordination includes notification dropdown
Opening the NotificationDropdown SHALL close the UserMenu and LanguageSwitcher if either is open. Opening the UserMenu or LanguageSwitcher SHALL close the NotificationDropdown. Only one dropdown SHALL be visible at a time in the TopNav.

#### Scenario: Notification dropdown closes other dropdowns
- **WHEN** the UserMenu or LanguageSwitcher is open and user clicks the bell icon
- **THEN** the open dropdown SHALL close and the NotificationDropdown SHALL open

#### Scenario: Other dropdowns close notification dropdown
- **WHEN** the NotificationDropdown is open and user opens the UserMenu or LanguageSwitcher
- **THEN** the NotificationDropdown SHALL close

### Requirement: Theme support for all three themes
The NotificationDropdown SHALL render correctly in light, dark, and forest themes. Background, text, border, hover, and separator colors SHALL adapt via CSS custom properties (reusing `--color-usermenu-*` variables). Icon circle colors SHALL remain consistent across themes.

#### Scenario: Light theme styling
- **WHEN** the app theme is "light"
- **THEN** the dropdown SHALL have a white background, dark text, and light borders

#### Scenario: Dark theme styling
- **WHEN** the app theme is "dark"
- **THEN** the dropdown SHALL have a dark background, light text, and subtle borders

#### Scenario: Forest theme styling
- **WHEN** the app theme is "forest"
- **THEN** the dropdown SHALL have a forest-themed background, light text, and themed borders

### Requirement: Notification dropdown visual styling matches Figma design
The dropdown SHALL have `rounded-[14px]` border radius, a subtle box shadow, `p-[18px]` padding on each item, and a fixed width of 320px. The dropdown SHALL use z-50 to appear above all other content. An entry animation (fade in + slide down) SHALL play when the dropdown opens. The panel SHALL have `role="menu"`.

#### Scenario: Dropdown visual appearance
- **WHEN** the notification dropdown is open
- **THEN** the dropdown SHALL have 14px border radius, a shadow, 18px padding on each item, and a width of 320px

#### Scenario: Open animation
- **WHEN** the notification dropdown opens
- **THEN** it SHALL animate from opacity 0 / translateY(-8px) to opacity 1 / translateY(0)

### Requirement: Internationalized notification text
All text in the NotificationDropdown (header, item titles, item descriptions, footer) SHALL use i18next translation keys from the `navigation` namespace so they display correctly in English and Japanese.

#### Scenario: Labels use translation keys
- **WHEN** the notification dropdown is rendered
- **THEN** all text content SHALL be rendered via the `t()` translation function

### Requirement: Notification item hover state
Each notification item SHALL display a visible hover state when the user hovers over it, using the existing `--color-usermenu-hover` CSS variable.

#### Scenario: Item hover highlight
- **WHEN** user hovers over a notification item
- **THEN** the item background SHALL change to the theme's hover color
