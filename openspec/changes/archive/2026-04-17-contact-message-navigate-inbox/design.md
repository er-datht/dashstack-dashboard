## Context

The Contact page's "Message" button currently shows a "Coming soon" toast. The Inbox page already exists at `/inbox` with a route and sidebar nav entry. This change wires the Message button to navigate there.

## Goals / Non-Goals

**Goals:**
- Navigate to `/inbox` when clicking the Message button on a contact card

**Non-Goals:**
- No changes to the Inbox page itself
- No passing of contact context to the Inbox page (e.g., pre-selecting a conversation)

## Decisions

### 1. Navigation inside ContactCard via `useNavigate`
ContactCard will import `useNavigate` from `react-router-dom` and call `navigate(ROUTES.INBOX)` on Message click. The `onMessage` callback prop is removed since the parent no longer needs to handle this action.

**Alternative considered**: Keep `onMessage` prop and have the parent navigate — rejected because the behavior is self-contained and doesn't need parent coordination.

### 2. Use ROUTES constant
Import `ROUTES` from `../../routes/routes` to reference `ROUTES.INBOX` rather than hardcoding `"/inbox"`. This follows the existing pattern throughout the app.

## Risks / Trade-offs

- **ContactCard now depends on React Router** — acceptable since all pages in this app are rendered within a Router context. Tests will mock `react-router-dom` (via `vi.mock`) following the existing project convention (see `UserMenu.test.tsx`, `TopNav.test.tsx`).
