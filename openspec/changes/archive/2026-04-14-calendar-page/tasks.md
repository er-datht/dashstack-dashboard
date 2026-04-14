## 1. Create Calendar Types and Mock Data

- [x] 1.1 Create `src/types/calendar.ts` with `CalendarEvent` type (id, title, startDate, endDate, location, organizer, color with border/bg/text fields, participants array with id/name/avatar)
- [x] 1.2 Create `src/data/calendarEvents.ts` with 4 mock events matching Figma: Design Conference (purple, Mon Jan 6), Weekend Festival (pink, Sun Jan 12), Glastonbury Festival (orange, Fri-Sat Jan 16-18), Ultra Europe 2025 (blue, Wed-Thu Jan 22-23), each with participant data

## 2. Create i18n Translation Files

- [x] 2.1 Create `public/locales/en/calendar.json` with keys: title, addNewEvent, youAreGoingTo, seeMore, today, dayNames (sun-sat), monthNames (jan-dec), viewDay, viewWeek, viewMonth
- [x] 2.2 Create `public/locales/jp/calendar.json` with matching Japanese translations
- [x] 2.3 Create `public/locales/ko/calendar.json` with matching Korean translations
- [x] 2.4 Register `calendar` namespace in root `i18n.ts` config

## 3. Implement EventsSidebar Component

- [x] 3.1 Create `src/pages/Calendar/EventsSidebar.tsx` with "+ Add New Event" button (blue bg, white text, rounded), "You are going to" section title, and scrollable event list
- [x] 3.2 Implement event card items showing: circular event image placeholder (gray bg), event title, date/time, location, organizer, and participant avatars row with overflow "20+" badge
- [x] 3.3 Add "See More" button at bottom with light blue background
- [x] 3.4 Apply theme support using `card`, `text-primary`, `text-secondary` utility classes

## 4. Implement CalendarGrid Component

- [x] 4.1 Create `src/pages/Calendar/CalendarGrid.tsx` with top bar: "Today" button (left), month/year with prev/next chevron navigation (center), Day/Week/Month toggle group (right)
- [x] 4.2 Implement day-of-week header row (SUN-SAT) with muted background
- [x] 4.3 Implement calendar grid with date calculation: get first day of month, fill previous month days, current month days, and next month days to complete 5-6 week rows
- [x] 4.4 Style out-of-month days with diagonal stripe pattern background and lighter text
- [x] 4.5 Render event bars on appropriate day cells with colored left border + translucent background + event title text, supporting multi-day events spanning across cells

## 5. Implement Calendar Page Shell and SCSS

- [x] 5.1 Create `src/pages/Calendar/Calendar.module.scss` with styles for: calendar grid borders, day cells, event bars with absolute positioning, stripe pattern for out-of-month days, day-of-week header, view toggle buttons
- [x] 5.2 Replace existing `src/pages/Calendar/index.tsx` placeholder with the full calendar page: page title "Calendar", flex row layout with EventsSidebar (fixed width ~284px) and CalendarGrid (flex-1)
- [x] 5.3 Wire up state: currentMonth/currentYear with navigation handlers, pass mock events to both sidebar and grid components

## 6. Verify Theme and i18n Support

- [x] 6.1 Confirm all text uses `t()` from the `calendar` namespace
- [x] 6.2 Confirm components render correctly across light, dark, and forest themes
- [x] 6.3 Confirm month navigation works correctly (boundary: Dec→Jan year increment, Jan→Dec year decrement)
- [x] 6.4 Confirm "Today" button navigates to current month
