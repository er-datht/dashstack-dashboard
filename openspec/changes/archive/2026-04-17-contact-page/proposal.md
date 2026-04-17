## Why

The Contact page is currently a placeholder stub. Users need a fully functional contact management view to browse contacts in a visually appealing card grid, with incremental "Load More" loading to handle large contact lists without overwhelming the UI.

## What Changes

- Replace the Contact page placeholder with a full card-grid layout matching the design reference
- Implement a 3-column responsive grid of contact cards (photo, name, email, "Message" button)
- Add a "Load More" button for incremental loading (6 contacts per batch)
- Use mock/static contact data (no real API backend)
- Add "Add New Contact" button in page header (visual only — no modal/form in this change)
- Add "Message" button on each card (shows "Coming soon" toast on click)
- Create translation files for the contact namespace (en + jp)

## Capabilities

### New Capabilities
- `contact-card-grid`: Contact page with responsive card grid, load-more pagination, mock data layer, and contact card component

### Modified Capabilities

## Impact

- **Pages**: `src/pages/Contact/index.tsx` — full rewrite from stub to functional page
- **New components**: `ContactCard` sub-component within the Contact page directory
- **Mock data**: New mock data file with ~18 sample contacts
- **Translations**: New `public/locales/en/contact.json` and `public/locales/jp/contact.json`
- **i18n config**: Register `contact` namespace in root `i18n.ts`
- **No new dependencies**: Uses existing libraries (lucide-react, react-i18next, classnames)
- **No API changes**: Pure frontend with static mock data
