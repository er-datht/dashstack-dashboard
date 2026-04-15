## 1. Theme Tokens & Styling

- [x] 1.1 Add CSS custom properties for UserMenu dropdown in `src/index.css` — define `--color-usermenu-bg`, `--color-usermenu-border`, `--color-usermenu-text`, `--color-usermenu-hover`, `--color-usermenu-separator` in `:root` and all three `[data-theme]` blocks (light, dark, forest). Add corresponding Tailwind utility classes (`.bg-usermenu-bg`, `.text-usermenu-text`, `.border-usermenu-border`, `.bg-usermenu-hover`, `.border-usermenu-separator`).

## 2. Internationalization

- [x] 2.1 Add translation keys for UserMenu labels in `public/locales/en/navigation.json` and `public/locales/jp/navigation.json` — keys: `userMenu.manageAccount`, `userMenu.changePassword`, `userMenu.activityLog`, `userMenu.logOut`, `userMenu.comingSoon`. Reuse existing `navigation:logout` key for the sidebar (no change there).

## 3. UserMenu Component

- [x] 3.1 Create `src/components/UserMenu/index.tsx` — a dropdown component that receives `isOpen` and `onClose` props. Renders 4 menu items (Manage Account, Change Password, Activity Log, Log out) each with its gradient SVG icon from `src/assets/icons/`. Items are `<button>` elements supporting Tab navigation and Enter/Space activation. Uses theme-aware CSS variable classes. Fixed width dropdown, `rounded-[14px]`, `p-[18px]` item padding, `z-50`. Log out clears both `auth_token` and `refresh_token` from localStorage and navigates to `ROUTES.LOGIN`. Placeholder items (Manage Account, Change Password, Activity Log) close the dropdown and show a "coming soon" toast (~2s auto-dismiss).
- [x] 3.2 Add animated open/close transitions — opacity (0→1) + translateY(-8px→0) with ~150ms ease-out on open, reverse on close. Use CSS transitions with a state-driven approach (render while animating out, remove from DOM after transition ends).

## 4. TopNav Integration

- [x] 4.1 Update `src/components/TopNav/index.tsx` — wrap the user profile section and UserMenu in a container `<div ref={containerRef}>`. Make the profile section a `<button>` with `aria-haspopup="menu"`, `aria-expanded`, and a `ChevronDown` icon that rotates 180deg when open (CSS transition). Manage `isOpen` state. Add click-outside detection (mousedown listener on document, check if target is outside container). Add Escape key handler. Render UserMenu absolutely positioned below the profile, aligned right.
- [x] 4.2 Add multi-dropdown coordination — when UserMenu opens, force LanguageSwitcher to close; when LanguageSwitcher opens, close UserMenu. Update LanguageSwitcher to accept a `forceClose` boolean prop and an `onOpen` callback prop. TopNav coordinates both states.

## 5. Verification

- [x] 5.1 Verify all 3 themes render correctly — check dropdown appearance in light, dark, and forest themes
- [x] 5.2 Verify keyboard accessibility — Tab through items, Enter/Space activate, Escape closes and returns focus to trigger
- [x] 5.3 Verify multi-dropdown coordination — opening one closes the other
- [x] 5.4 Run `yarn build` to confirm no TypeScript errors
