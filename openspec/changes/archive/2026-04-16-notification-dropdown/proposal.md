## Why

The TopNav bell icon currently has no interactive behavior — clicking it does nothing. The Figma design (node 5:4081) specifies a notification dropdown that matches the visual style and interaction pattern of the existing UserMenu and LanguageSwitcher dropdowns. Adding this dropdown completes the TopNav icon row and provides users with a notification summary panel.

## What Changes

- Create a new `NotificationDropdown` component that renders a themed dropdown panel when the bell icon is clicked
- The dropdown displays a "Notification" header, a list of static notification items (each with a colored circle icon, title, and description), and a "See all notification" footer link
- Integrate the dropdown into TopNav's multi-dropdown coordination so opening it closes UserMenu and LanguageSwitcher (and vice versa)
- Add click-outside detection, Escape key close, and entry animation consistent with existing dropdowns
- Add CSS custom properties for notification-specific theming (icon circle colors, item backgrounds) across all 3 themes
- Add i18n translation keys for notification text in both English and Japanese

## Capabilities

### New Capabilities

- `notification-dropdown`: Notification dropdown panel triggered by the TopNav bell icon, displaying a static list of notification items with colored icons, titles, descriptions, and a "See all" footer

### Modified Capabilities

_(none — existing specs are not changing at the requirement level; TopNav integration is an implementation detail)_

## Impact

- **Components**: New `src/components/NotificationDropdown/index.tsx`; modified `src/components/TopNav/index.tsx` (add state, onClick handler, render dropdown)
- **Styles**: New CSS custom properties in `src/index.css` for notification dropdown theming (icon circle colors per notification type, dropdown bg/border/text)
- **i18n**: New keys in `public/locales/en/navigation.json` and `public/locales/jp/navigation.json` for notification header, item titles/descriptions, and footer text
- **Tests**: New `src/components/NotificationDropdown/__tests__/NotificationDropdown.test.tsx`; updated TopNav tests for notification toggle behavior
- **Dependencies**: None new — uses existing lucide-react icons, classnames/cn helper, react-i18next
