## Context

The Contact page exists as a placeholder stub (`src/pages/Contact/index.tsx`) with route, sidebar nav, and types already configured. The design reference shows a card-grid layout with photos, names, emails, and message buttons. No backend API exists, so mock data will be used.

## Goals / Non-Goals

**Goals:**
- Implement a visually complete Contact page matching the design reference
- Responsive 3-column card grid with contact photos, names, emails
- Incremental "Load More" loading (6 contacts per batch)
- Full theme support (light/dark/forest)
- i18n support (en/jp)

**Non-Goals:**
- No "Add New Contact" form/modal (button is visual placeholder only, shows toast)
- No "Message" action (shows "Coming soon" toast)
- No real API integration — mock data only
- No contact search, filtering, or sorting
- No contact detail view or editing

## Decisions

### 1. Mock data approach: Static array in a dedicated data file
Mock contact data will live in `src/pages/Contact/contactData.ts` as a typed array of `Contact` objects. This keeps mock data co-located with the page and easy to replace with API calls later.

**Alternative considered**: Service layer with fake API delay — rejected as over-engineering for static data with no backend.

### 2. Load More via local state slicing
A `visibleCount` state variable tracks how many contacts to show. The displayed list is `mockContacts.slice(0, visibleCount)`. Each "Load More" click increments by 6. The button hides when all contacts are shown.

**Alternative considered**: Infinite scroll with IntersectionObserver — rejected because the design explicitly shows a button, and the contact list is small enough that a button is simpler.

### 3. ContactCard as a sub-component
`ContactCard` will be a separate component in `src/pages/Contact/ContactCard.tsx`. It receives a single `Contact` prop and renders the card UI. This keeps the page component clean.

### 4. Toast for placeholder actions
"Add New Contact" button triggers a "Coming soon" toast using the existing inline toast pattern (state-based, auto-dismiss). "Message" buttons also show "Coming soon" toast. This provides user feedback without dead clicks.

### 5. Avatar images from public URL placeholders
Mock data will use `https://randomuser.me/api/portraits/` URLs for avatar photos. These are stable, free, and match the design's realistic photo style. When an avatar fails to load, a generic Lucide `User` icon is shown as fallback.

### 6. Button styles
- **"Add New Contact"**: Primary/filled blue button (matches design screenshot)
- **"Load More"**: Outline secondary style — differentiates from the primary action
- **"Message" (on cards)**: Outlined with border — subtle, doesn't compete with card content

### 7. Page header retains icon badge
The header keeps the existing icon badge pattern (yellow `bg-warning-light` with `Users` icon) alongside the title, with "Add New Contact" button on the right. This maintains consistency with other page headers in the app.

### 8. Card hover effect
Cards have a subtle hover effect (shadow lift / border highlight) on desktop to indicate interactivity.

### 9. Text truncation with tooltips
Contact name and email on cards are truncated to 1 line max with CSS `truncate`. On hover, a tooltip shows the full text. This prevents layout breakage from long strings.

## Risks / Trade-offs

- **External avatar URLs** — Images depend on randomuser.me availability. Mitigation: Cards render gracefully with a fallback initial/icon if image fails to load.
- **No real API** — When a real API is added, the mock data file will need to be replaced and a service/hook layer added. Mitigation: The `Contact` type is already defined and will be used consistently, making the migration straightforward.
- **Load More vs Pagination** — Load More accumulates DOM nodes. Mitigation: With ~18 mock contacts, performance is not a concern. A real implementation could switch to pagination if the dataset grows large.
