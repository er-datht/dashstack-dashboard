## Context

DashStack's Calendar page (`/calendar`) is a dashboard page within DashboardLayout. The route, lazy import, and sidebar navigation entry already exist. The current implementation is a placeholder with just a title and description text. The page needs to be replaced with a full calendar UI matching the Figma design, following the project's 3-tier styling approach (Tailwind utilities + CSS custom properties + SCSS modules) and supporting all 3 themes.

## Goals / Non-Goals

**Goals:**
- Implement a two-column calendar layout with events sidebar and monthly calendar grid
- Build a functional calendar grid with real date calculations and month navigation
- Display mock events as colored bars on calendar days
- Show upcoming events list with participant avatars in the sidebar
- Support all 3 themes via CSS custom properties and Tailwind utility classes
- Full i18n support across en/jp/ko

**Non-Goals:**
- Drag-and-drop event creation or modification
- Day/Week view implementations (toggle buttons are visual-only, Month is active)
- Real API integration (mock data only)
- Event creation modal/form (button is visual-only)
- Responsive/mobile layout (desktop dashboard focus)

## Decisions

### Decision 1: Component Structure
**Choice**: Split into 3 main components: `Calendar` (page shell + state), `EventsSidebar` (left panel), `CalendarGrid` (right panel with sub-components for header, day cells, and event bars).
**Rationale**: Keeps each component focused. The Calendar page manages the shared state (current month, events) and passes it down. Matches the project pattern of co-locating sub-components within page folders.

### Decision 2: Date Calculation with Native Date API
**Choice**: Use native JavaScript `Date` for all calendar calculations (days in month, first day of week, adjacent month days). No date library dependency.
**Rationale**: The calendar only needs basic month grid calculations. Adding date-fns or dayjs would be over-engineering. The Orders page's DateFilterPopup already uses native Date for a similar calendar grid successfully.

### Decision 3: Mock Events as Static Data
**Choice**: Define mock events in `src/data/calendarEvents.ts` with hardcoded dates, colors, and participant info. No React Query integration since there's no API endpoint.
**Rationale**: Keeps it simple and consistent with the Figma design's static data. The data file can be easily replaced with an API service + React Query hook later.

### Decision 4: SCSS Module for Calendar Grid
**Choice**: Use `Calendar.module.scss` for the calendar grid borders, event bar positioning, day cell layout, and diagonal stripe pattern for out-of-month days.
**Rationale**: The calendar grid has complex visual states (current month vs adjacent month, event bar overlays with absolute positioning, stripe patterns) that are cleaner in SCSS. Follows the project's tier-3 guideline for complex components.

### Decision 5: Event Bar Colors as Inline Styles
**Choice**: Event bar colors (border, background, text) are defined per-event as data and applied via inline styles with RGBA backgrounds.
**Rationale**: There are 4+ distinct event colors that don't map to theme tokens. Similar to OrderStatusBadge's approach of using inline styles for fixed design colors that don't vary by theme.

### Decision 6: Theme Support via Existing Design Tokens
**Choice**: Use existing utility classes (`card`, `bg-page`, `text-primary`, `text-secondary`, `bg-surface-muted`) and CSS custom properties (`--color-border`, `--color-surface`, `--color-text-primary`) for theme adaptation.
**Rationale**: The existing token system already covers all the surface, text, and border colors needed. No new CSS custom properties required.

## Risks / Trade-offs

- **[Static events only]** → Events are hardcoded mock data, not fetched from API. Mitigation: data layer is structured for easy API integration.
- **[Month view only]** → Day and Week toggle buttons are present but non-functional. Mitigation: UI matches Figma exactly; views can be added later.
- **[No event CRUD]** → "+ Add New Event" button has no action. Mitigation: matches Figma's static design; modal can be added later.
- **[Adjacent month stripe pattern]** → Uses CSS diagonal stripes instead of the Figma's image-based pattern. Mitigation: visually equivalent and theme-adaptable without external assets.
