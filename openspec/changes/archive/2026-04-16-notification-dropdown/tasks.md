## 1. Theming & Styles

- [x] 1.1 Add CSS custom properties for notification icon circle colors in `src/index.css` — define `--color-notification-icon-settings`, `--color-notification-icon-event`, `--color-notification-icon-profile`, `--color-notification-icon-error` across all 3 theme selectors (light/dark/forest). Icon circle colors stay consistent across themes.

## 2. Internationalization

- [x] 2.1 Add notification translation keys to `public/locales/en/navigation.json`:
  - `notifications.title`: "Notification"
  - `notifications.seeAll`: "See all notification"
  - `notifications.items.settings.title`: "Settings"
  - `notifications.items.settings.description`: "Update Dashboard"
  - `notifications.items.eventUpdate.title`: "Event Update"
  - `notifications.items.eventUpdate.description`: "An event date update again"
  - `notifications.items.profile.title`: "Profile"
  - `notifications.items.profile.description`: "Update your profile"
  - `notifications.items.applicationError.title`: "Application Error"
  - `notifications.items.applicationError.description`: "Check your running application"
- [x] 2.2 Add Japanese notification translation keys to `public/locales/jp/navigation.json`:
  - `notifications.title`: "通知"
  - `notifications.seeAll`: "すべての通知を見る"
  - `notifications.items.settings.title`: "設定"
  - `notifications.items.settings.description`: "ダッシュボードの更新"
  - `notifications.items.eventUpdate.title`: "イベントの更新"
  - `notifications.items.eventUpdate.description`: "イベントの日付が更新されました"
  - `notifications.items.profile.title`: "プロフィール"
  - `notifications.items.profile.description`: "プロフィールを更新"
  - `notifications.items.applicationError.title`: "アプリケーションエラー"
  - `notifications.items.applicationError.description`: "実行中のアプリケーションを確認してください"

## 3. NotificationDropdown Component

- [x] 3.1 Create `src/components/NotificationDropdown/index.tsx` — implement the NotificationDropdown component with `isOpen`/`onClose` props. Include: "Notification" header with border, 4 notification items (each with colored circle + Lucide icon, title, truncated description), "See all notification" footer with top border. Use `cn()` helper, `useTranslation`, reuse `usermenu-*` theme vars for card styling, `notification-icon-*` vars for circles. Add Escape key handler. Add hover state on items. Entry animation via `animate-usermenu-enter`.

## 4. TopNav Integration

- [x] 4.1 Update `src/components/TopNav/index.tsx` — add `isNotificationOpen` state, `toggleNotification` function (closes other two dropdowns), click-outside detection with ref, bell button onClick/aria attributes, and render `NotificationDropdown` component. Extend existing toggle functions to also close notification dropdown.

## 5. Tests

- [x] 5.1 Create `src/components/NotificationDropdown/__tests__/NotificationDropdown.test.tsx` — test: renders nothing when closed, renders header/items/footer when open, displays all 4 notification items with titles, calls onClose on Escape key press, calls onClose on footer click, items have hover class
- [x] 5.2 Update `src/components/TopNav/__tests__/TopNav.test.tsx` — test: bell click opens notification dropdown, bell click closes other dropdowns (mutual exclusivity), click-outside closes notification dropdown
