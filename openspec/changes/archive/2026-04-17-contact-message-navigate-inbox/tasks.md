## 1. Component Changes

- [x] 1.1 Update `ContactCard` to use `useNavigate` and `ROUTES.INBOX` instead of the `onMessage` callback prop
- [x] 1.2 Update `Contact` page: remove only the `onMessage={handleShowComingSoon}` prop from `<ContactCard>` JSX; keep `handleShowComingSoon`, toast state, and toast UI intact (still used by "Add New Contact")

## 2. Test Updates

- [x] 2.1 Update `ContactCard.test.tsx` — mock `react-router-dom` via `vi.mock` (following `UserMenu.test.tsx` pattern), remove `onMessage` prop from `defaultProps`, replace interaction test to assert `mockNavigate` was called with `ROUTES.INBOX`
- [x] 2.2 Update `Contact.test.tsx` — add `vi.mock('react-router-dom', ...)` so `ContactCard`'s `useNavigate` resolves; no toast-on-message assertions to remove (none exist currently)
