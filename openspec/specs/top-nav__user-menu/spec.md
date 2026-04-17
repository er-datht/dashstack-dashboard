## ADDED Requirements

### Requirement: User profile trigger opens dropdown menu
The user profile section in the TopNav header SHALL be a clickable button. When clicked, it SHALL toggle a dropdown menu below the profile section. The trigger area SHALL include the avatar, user name, and role text. A ChevronDown icon SHALL be displayed next to the profile to signal interactivity. The chevron SHALL rotate 180 degrees when the menu is open.

#### Scenario: Open dropdown on click
- **WHEN** user clicks the profile section in the TopNav
- **THEN** the UserMenu dropdown SHALL appear below the profile section, aligned to the right edge, with an animated entrance (opacity + translateY transition)

#### Scenario: Close dropdown on second click
- **WHEN** user clicks the profile section while the dropdown is open
- **THEN** the dropdown SHALL close with an animated exit

#### Scenario: Chevron indicator rotation
- **WHEN** the dropdown is open
- **THEN** the ChevronDown icon SHALL be rotated 180 degrees
- **AND** when the dropdown closes, the chevron SHALL rotate back to 0 degrees

#### Scenario: Trigger accessibility attributes
- **WHEN** the TopNav renders
- **THEN** the trigger button SHALL have `aria-haspopup="menu"` and `aria-expanded` reflecting the open/closed state

### Requirement: Dropdown menu displays four action items
The dropdown menu SHALL display exactly 4 items in this order: Manage Account, Change Password, Activity Log, Log out. Each item SHALL have a gradient SVG icon on the left (from `src/assets/icons/`) and a text label. Items SHALL be separated by a light border except after the last item.

#### Scenario: Menu items rendered in correct order
- **WHEN** the dropdown is open
- **THEN** the menu SHALL display items in order: Manage Account, Change Password, Activity Log, Log out

#### Scenario: Each item has icon and label
- **WHEN** the dropdown is open
- **THEN** each menu item SHALL display its corresponding gradient SVG icon on the left and a translated text label to the right of the icon

#### Scenario: Separator borders between items
- **WHEN** the dropdown is open
- **THEN** a border SHALL separate the first three items from the next, and the last item (Log out) SHALL have no bottom border

### Requirement: Menu item icons use gradient SVG assets
Each menu item SHALL use a pre-built SVG icon file with embedded gradient colors: `manage-account.svg` (blue #4e96ff → #80c9fc), `change-password.svg` (pink #f97fd9 → #ffc1e6), `activity-log.svg` (purple #9e8fff → #ebcbff), `log-out.svg` (red #ff8f8f → #ffc1c1).

#### Scenario: Icon assets loaded correctly
- **WHEN** the dropdown is open
- **THEN** each menu item SHALL render its SVG icon from `src/assets/icons/` at the appropriate size

### Requirement: Click outside closes dropdown
The dropdown SHALL close when the user clicks anywhere outside the dropdown container (which includes both the trigger and the menu panel).

#### Scenario: Click outside closes menu
- **WHEN** the dropdown is open and user clicks outside the dropdown container
- **THEN** the dropdown SHALL close with animation

### Requirement: Escape key closes dropdown
The dropdown SHALL close when the user presses the Escape key.

#### Scenario: Escape key closes menu
- **WHEN** the dropdown is open and user presses Escape
- **THEN** the dropdown SHALL close
- **AND** focus SHALL return to the profile trigger button

### Requirement: Keyboard navigation via Tab and Enter
Menu items SHALL be focusable via Tab key. Users SHALL be able to activate items with Enter or Space.

#### Scenario: Tab through menu items
- **WHEN** the dropdown is open
- **THEN** user SHALL be able to Tab through each menu item in order

#### Scenario: Activate item with Enter or Space
- **WHEN** a menu item is focused and user presses Enter or Space
- **THEN** the menu item's action SHALL be triggered

### Requirement: Theme support for all three themes
The dropdown SHALL render correctly in light, dark, and forest themes. Background, text, border, and hover colors SHALL adapt via CSS custom properties (`--color-usermenu-*`).

#### Scenario: Light theme styling
- **WHEN** the app theme is "light"
- **THEN** the dropdown SHALL have a white background, dark text, and light borders

#### Scenario: Dark theme styling
- **WHEN** the app theme is "dark"
- **THEN** the dropdown SHALL have a dark background, light text, and subtle borders

#### Scenario: Forest theme styling
- **WHEN** the app theme is "forest"
- **THEN** the dropdown SHALL have a forest-themed dark background, light text, and themed borders

### Requirement: Menu item hover state
Each menu item SHALL display a visible hover state when the user hovers over it, using the `--color-usermenu-hover` CSS variable.

#### Scenario: Item hover highlight
- **WHEN** user hovers over a menu item
- **THEN** the item background SHALL change to the theme's hover color

### Requirement: Log out action clears tokens and navigates to login
When the user clicks "Log out", the system SHALL clear both `auth_token` and `refresh_token` from localStorage and navigate to the login page (`ROUTES.LOGIN`). The dropdown SHALL close.

#### Scenario: Log out redirects to login
- **WHEN** user clicks "Log out"
- **THEN** both `auth_token` and `refresh_token` SHALL be removed from localStorage
- **AND** the user SHALL be navigated to the login route
- **AND** the dropdown SHALL close

### Requirement: Placeholder items show "coming soon" toast
When the user clicks Manage Account, Change Password, or Activity Log, the dropdown SHALL close and a "coming soon" toast notification SHALL appear briefly (~2 seconds).

#### Scenario: Clicking placeholder item shows toast
- **WHEN** user clicks "Manage Account", "Change Password", or "Activity Log"
- **THEN** the dropdown SHALL close
- **AND** a "coming soon" toast notification SHALL appear and auto-dismiss after approximately 2 seconds

### Requirement: Internationalized menu labels
All menu item labels and the "coming soon" toast message SHALL use i18next translation keys so they display correctly in all supported languages (English, Japanese).

#### Scenario: Labels use translation keys
- **WHEN** the dropdown is rendered
- **THEN** each menu item label SHALL be rendered via the `t()` translation function from the `navigation` namespace

### Requirement: Dropdown visual styling matches Figma design
The dropdown SHALL have `rounded-[14px]` border radius, a subtle box shadow, `p-[18px]` padding on each item, and a fixed width. The dropdown SHALL use z-50 or higher to appear above all other content.

#### Scenario: Dropdown visual appearance
- **WHEN** the dropdown is open
- **THEN** the dropdown SHALL have 14px border radius, a shadow, each item SHALL have 18px padding, and the dropdown SHALL have a fixed width

### Requirement: Animated open/close transitions
The dropdown SHALL animate on open (fade in + slide down) and close (fade out + slide up) using CSS transitions (~150ms ease-out).

#### Scenario: Open animation
- **WHEN** the dropdown opens
- **THEN** it SHALL transition from opacity 0 / translateY(-8px) to opacity 1 / translateY(0)

#### Scenario: Close animation
- **WHEN** the dropdown closes
- **THEN** it SHALL transition from opacity 1 / translateY(0) to opacity 0 / translateY(-8px) before being removed from the DOM

### Requirement: Multi-dropdown coordination
Opening the UserMenu SHALL close the LanguageSwitcher dropdown if it is open. Opening the LanguageSwitcher SHALL close the UserMenu if it is open. Only one dropdown SHALL be visible at a time in the TopNav.

#### Scenario: User menu closes language switcher
- **WHEN** the LanguageSwitcher dropdown is open and user clicks the profile trigger
- **THEN** the LanguageSwitcher SHALL close and the UserMenu SHALL open

#### Scenario: Language switcher closes user menu
- **WHEN** the UserMenu is open and user hovers over the LanguageSwitcher
- **THEN** the UserMenu SHALL close and the LanguageSwitcher SHALL open
