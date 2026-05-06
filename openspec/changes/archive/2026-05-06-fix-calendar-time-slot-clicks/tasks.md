## 1. CSS pointer-events fix

- [x] 1.1 In `src/pages/Calendar/Calendar.module.scss`, add `pointer-events: none;` to `.weekDayEventsColumn` (do not change `position`, `top`, or `bottom`)
- [x] 1.2 In the same file, add `pointer-events: none;` to `.dayEventsColumn`
- [x] 1.3 In the same file, add `pointer-events: auto;` to `.timedEventBlock` so child event blocks remain clickable through the now-transparent parent

## 2. Regression-locking unit tests — DayView

- [x] 2.1 In `src/pages/Calendar/__tests__/DayView.test.tsx`, add a `describe('slot click interactions', ...)` block
- [x] 2.2 Add test: clicking a non-event hour slot fires `onTimeSlotClick` exactly once with a `Date` whose `getHours()` matches the clicked row and whose `getFullYear()/getMonth()/getDate()` match `currentDate`. Locate slots via `getAllByRole('button', { name: /timeSlot/ })` (the existing aria-label pattern)
- [x] 2.3 Add test: clicking a rendered timed event block fires `onEventClick` (with the event and a `{ top, left }` position) and does NOT fire `onTimeSlotClick`. Use a single timed event at 9-10 AM and `getByText('event title')` to find the block

## 3. Regression-locking unit tests — WeekView

- [x] 3.1 In `src/pages/Calendar/__tests__/WeekView.test.tsx`, add a `describe('slot click interactions', ...)` block
- [x] 3.2 Add test: clicking a slot in the Wednesday column at 2 PM fires `onTimeSlotClick` with a `Date` whose day-of-week is Wednesday (`getDay() === 3`) and `getHours() === 14`. Locate slots via the aria-label pattern that includes the day name and hour
- [x] 3.3 Add test: clicking a rendered Wednesday timed event block fires `onEventClick` and does NOT fire `onTimeSlotClick`

## 4. Verification

- [x] 4.1 Run `yarn test src/pages/Calendar` — all new and existing tests pass
- [x] 4.2 Run `yarn lint` — no new warnings
- [x] 4.3 Run `yarn build` — type check and build succeed
- [x] 4.4 Start `yarn dev`, switch to Day view, click an empty 3 PM slot — AddEventModal opens with start time 3:00 PM on the current day
- [x] 4.5 In Day view, click a rendered event block — EventDetailPopover opens (slot handler did not fire)
- [x] 4.6 Switch to Week view, click an empty slot in a non-today column at 10 AM — AddEventModal opens with start time 10:00 AM on the clicked day
- [x] 4.7 In Week view (current week), click the row at the current-time indicator's vertical position where no event block is rendered — AddEventModal opens for today at that hour (proves indicator does not capture)
- [x] 4.8 Visual smoke check across all three themes (light, dark, forest) — no visual regression in either view
