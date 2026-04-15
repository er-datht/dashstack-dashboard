## 1. Data Model

- [x] 1.1 Add `isToday: boolean` to the `CalendarDay` type in `CalendarGrid.tsx`
- [x] 1.2 Update `generateCalendarDays()` to compute `isToday` by comparing each day's date (year/month/day) against `new Date()`

## 2. Styling

- [x] 2.1 Add `.todayNumber` class in `Calendar.module.scss` — circular badge with primary background and white text, with forest theme override

## 3. Rendering

- [x] 3.1 Apply `.todayNumber` class conditionally to the day number `<span>` when `day.isToday` is true
