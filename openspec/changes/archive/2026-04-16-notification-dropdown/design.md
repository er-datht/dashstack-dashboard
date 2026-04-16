## Context

The TopNav header currently has three interactive elements: a search bar, a LanguageSwitcher dropdown, and a UserMenu dropdown. The bell icon exists but is non-interactive. Both existing dropdowns follow the same pattern: parent-managed open/close state, click-to-toggle, click-outside/Escape to dismiss, mutual exclusivity (only one open at a time), and themed via CSS custom properties prefixed `--color-usermenu-*`.

The Figma design (node 5:4081) shows a notification panel with a header, four notification items (each with a colored circle icon containing a white Lucide icon, plus title/description text), and a "See all notification" footer.

## Goals / Non-Goals

**Goals:**
- Add a NotificationDropdown component that appears when the bell icon is clicked
- Follow the exact same interaction and styling patterns as UserMenu and LanguageSwitcher
- Extend TopNav's multi-dropdown coordination to include the notification dropdown (3-way mutual exclusivity)
- Support all 3 themes with appropriate CSS custom properties
- Use static notification data (hardcoded list) with i18n-translated text

**Non-Goals:**
- No API integration or real-time notifications (future work)
- No notification read/unread state management
- No "See all" page navigation (footer link is visual-only for now)
- No badge count logic (existing red dot stays as-is)

## Decisions

### 1. Component structure: Standalone `NotificationDropdown` component

**Choice**: Create `src/components/NotificationDropdown/index.tsx` as a self-contained component with `isOpen`/`onClose` props, matching the UserMenu interface.

**Why**: This mirrors the established pattern. TopNav owns the state; the dropdown component is a pure presentational/behavioral component. Consistent API across all three dropdowns.

**Alternative**: Inline the dropdown markup in TopNav — rejected because it would bloat TopNav and break the pattern.

### 2. Icon rendering: Lucide icons inside colored circles

**Choice**: Use Lucide React icons (`Settings`, `Calendar`, `User`, `AlertCircle`) rendered inside 36x36px colored circle `<div>`s. Each notification type has a fixed gradient/color for its circle background.

**Why**: The project already uses lucide-react throughout. The Figma uses Font Awesome unicode characters inside colored circles, but the semantic mapping (gear → Settings, calendar → Calendar, person → User, exclamation → AlertCircle) maps cleanly to Lucide equivalents.

**Alternative**: Create SVG icon assets like UserMenu does — rejected because the notification icons are standard Lucide icons in colored circles, not custom gradient SVGs.

### 3. Theming: Reuse `--color-usermenu-*` variables

**Choice**: Reuse existing `usermenu-bg`, `usermenu-border`, `usermenu-text`, `usermenu-hover`, `usermenu-separator` CSS variables for the dropdown container. Add new `--color-notification-icon-*` variables only for the four icon circle background colors.

**Why**: The notification dropdown has the same card styling as UserMenu and LanguageSwitcher. Only the icon circles need unique colors. This avoids duplicating theme variables.

### 4. Notification data: Static typed array

**Choice**: Define a `NotificationItem` type and a static `notifications` array in the component file, using i18n translation keys for titles and descriptions.

**Why**: No API exists yet. A typed array makes it easy to replace with API data later. Using translation keys keeps all text translatable from day one.

### 5. Multi-dropdown coordination: Add `isNotificationOpen` state to TopNav

**Choice**: Add a third state variable `isNotificationOpen` and a `toggleNotification` function to TopNav. Each toggle function closes the other two dropdowns before opening its own. Add a third `useEffect` for click-outside detection with its own ref.

**Why**: This extends the existing 2-dropdown pattern to 3 dropdowns with minimal refactoring. The pattern is already established and works well.

## Risks / Trade-offs

- **3 separate click-outside effects in TopNav** → Slightly verbose but consistent and easy to understand. A shared hook could consolidate this but is premature abstraction for 3 instances.
- **Static data means no real notification content** → Acceptable for this phase. The component structure supports easy API integration later.
- **Icon circle colors are hardcoded per notification type** → If notification types grow, this needs a mapping system. Fine for 4 static items.
