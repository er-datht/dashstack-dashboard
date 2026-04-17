## Why

The "Message" button on contact cards currently shows a placeholder "Coming soon" toast. Now that the Inbox page route exists at `/inbox`, the Message button should navigate there to provide a meaningful user flow from contacts to messaging.

## What Changes

- Change the ContactCard `onMessage` callback behavior: instead of triggering a "Coming soon" toast, navigate to `/inbox` using React Router's `useNavigate`
- Remove the toast-related logic for the Message button from the Contact page (the "Add New Contact" button still shows the toast)
- Update ContactCard to handle navigation internally rather than delegating to a parent callback

## Capabilities

### New Capabilities

### Modified Capabilities
- `contact-card-grid`: The "Message button behavior" requirement changes from showing a toast to navigating to `/inbox`

## Impact

- **Components**: `src/pages/Contact/ContactCard.tsx` — add `useNavigate`, navigate on Message click
- **Pages**: `src/pages/Contact/index.tsx` — simplify `onMessage` prop or remove it
- **Tests**: `src/pages/Contact/__tests__/ContactCard.test.tsx` — update Message button test expectations
- **Translations**: `comingSoon` key can remain (still used by "Add New Contact" button)
- **No new dependencies**: `react-router-dom` is already installed
