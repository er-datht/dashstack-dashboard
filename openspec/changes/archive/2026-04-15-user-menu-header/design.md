## Context

The TopNav header (`src/components/TopNav/index.tsx`) displays a static user profile section (avatar + "Moni Roy" + "Admin") with no interactivity. The Figma design (node 5:3635) specifies a dropdown menu that appears when the user clicks this profile section, containing 4 action items with gradient-colored icons.

Existing dropdown patterns in the codebase:
- **LanguageSwitcher** (`src/components/LanguageSwitcher/index.tsx`): hover-based open/close, absolute positioning, z-50
- **EventDetailPopover** (`src/pages/Calendar/EventDetailPopover.tsx`): click-outside detection via mousedown listener, Escape key handling

The app supports 3 themes (light/dark/forest) via CSS custom properties on `[data-theme]`.

## Goals / Non-Goals

**Goals:**
- Add a clickable user profile trigger that toggles a dropdown menu
- Render 4 menu items (Manage Account, Change Password, Activity Log, Log out) with gradient icons matching Figma
- Support all 3 themes with appropriate background/text/border colors
- Close on click outside and Escape key press
- Keyboard accessible (Tab navigation, Enter/Space to activate items)
- Internationalized menu item labels via i18next
- Animate dropdown open/close with CSS transitions
- Coordinate with LanguageSwitcher so only one dropdown is open at a time
- Chevron indicator rotates 180deg when menu is open

**Non-Goals:**
- Wiring Manage Account, Change Password, or Activity Log to real pages (show "coming soon" toast)
- User profile data from an API (keep hardcoded for now)
- Mobile-specific drawer or sheet behavior
- Removing the existing sidebar Logout item

## Decisions

### 1. Click-to-toggle (not hover)

The LanguageSwitcher uses hover, but the user menu is a more deliberate action. Click-to-toggle with click-outside-to-close is the standard UX pattern for profile menus and matches the Figma interaction model.

**Alternative considered:** Hover-based (like LanguageSwitcher) — rejected because accidental hover triggers are disruptive for a menu with destructive actions like "Log out".

### 2. Separate `UserMenu` component

Create `src/components/UserMenu/index.tsx` as a self-contained dropdown component. TopNav passes `isOpen` / `onClose` props. This keeps TopNav lean and the menu testable in isolation.

**Alternative considered:** Inline in TopNav — rejected because TopNav is already dense and the menu has its own state/event logic.

### 3. Gradient icons as SVG asset files

Pre-built SVG files with embedded `<linearGradient>` definitions are stored in `src/assets/icons/`. Each icon uses the exact gradient colors from the Figma design (e.g., `manage-account.svg` with blue #4e96ff → #80c9fc). The icons are based on lucide icon paths (UserCog, KeyRound, History, LogOut) to stay visually consistent with the rest of the app. Import as `<img>` sources in the component.

Icons created:
- `src/assets/icons/manage-account.svg` — blue gradient (#4e96ff → #80c9fc)
- `src/assets/icons/change-password.svg` — pink gradient (#f97fd9 → #ffc1e6)
- `src/assets/icons/activity-log.svg` — purple gradient (#9e8fff → #ebcbff)
- `src/assets/icons/log-out.svg` — red gradient (#ff8f8f → #ffc1c1)

**Alternative considered:** Solid-color lucide-react icons — rejected per user preference for exact Figma gradient icons.

### 4. Theme-aware dropdown styling via existing CSS variable patterns

Add new CSS custom properties following the existing `--color-topnav-*` naming convention:
- `--color-usermenu-bg` — dropdown background
- `--color-usermenu-border` — dropdown border
- `--color-usermenu-text` — item text color
- `--color-usermenu-hover` — item hover background
- `--color-usermenu-separator` — border between items

These are defined per theme in `src/index.css` alongside existing topnav variables. Add corresponding Tailwind utility classes.

Exact Figma values: `rounded-[14px]` border radius, `p-[18px]` item padding, fixed dropdown width (e.g., 220px).

### 5. Log out action clears both tokens and redirects

Log out clears both `auth_token` and `refresh_token` from localStorage (matching the existing 401 handler in `src/configs/api.ts`) and navigates to `ROUTES.LOGIN`.

### 6. Container ref approach for click-outside detection

Wrap the trigger button and UserMenu dropdown in a single container `<div ref={containerRef}>` in TopNav. The click-outside handler checks if the click target is outside this container. This avoids passing trigger refs between components and prevents the toggle-reopen bug.

**Alternative considered:** Passing trigger ref as prop from TopNav to UserMenu — rejected because the container approach is simpler and handles the "click trigger while open" edge case naturally.

### 7. Multi-dropdown coordination via callback props

TopNav manages both the user menu `isOpen` state and a new `onUserMenuOpen` callback. When the user menu opens, TopNav forces the LanguageSwitcher to close by passing a controlled `forceClose` prop. The LanguageSwitcher needs a minor update to accept this prop and reset its internal `isOpen` state. Conversely, when LanguageSwitcher opens (on hover), it calls an `onOpen` callback that TopNav uses to close the user menu.

### 8. Animated open/close with CSS transitions

The dropdown uses CSS transitions for open/close animation: opacity (0 → 1), transform (translateY(-8px) → translateY(0)), with a ~150ms ease-out duration. The chevron rotates 180deg via `transition: transform 200ms` when the menu is open.

### 9. Placeholder items show "coming soon" toast

Manage Account, Change Password, and Activity Log items close the dropdown and display a brief "coming soon" toast notification. The toast uses a simple inline implementation (no new library needed) — a temporary div positioned at the top of the viewport that auto-dismisses after ~2 seconds.

## Risks / Trade-offs

- **[Hardcoded user data]** → Menu shows hardcoded "Moni Roy" / "Admin". Mitigation: When a user API is added, the data source can be swapped without changing the component structure.
- **[LanguageSwitcher modification]** → Adding `forceClose`/`onOpen` props to LanguageSwitcher is a minor change to an existing component. Mitigation: The change is backward-compatible (props are optional).
- **[SVG gradient icons as static assets]** → Using `<img src>` for icons means they can't inherit theme colors. Mitigation: The gradient icons are intentionally design-specific and don't need to change per theme — the gradient colors are the same across all themes per the Figma design.
