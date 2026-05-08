## 1. DayView wiring

- [x] 1.1 In `src/pages/Calendar/DayView.tsx`, after the existing `allDayEvents` filter, build `dayAllDaySpans = allDayEvents.map((event) => ({ event, startCol: 0, span: 1 }))` and pipe through `packAllDayRows` to get spans annotated with `rowIdx`. Import `packAllDayRows` from `./calendarUtils`.
- [x] 1.2 Compute `rowCount = packed.reduce((max, s) => Math.max(max, s.rowIdx), -1) + 1 || 1` (clamps to 1 when there are zero events). Mirror the WeekView name (`packedAllDaySpans`).
- [x] 1.3 Apply `style={{ minHeight: \`${rowCount * 24 + 4}px\` }}` to the `.allDayContent` div (the `+ 4` accounts for the existing 2px top + 2px bottom padding so the bottom row isn't visually clipped). Mirror WeekView's binding comment naming.
- [x] 1.4 Replace the existing all-day bar map with one that consumes `packedAllDaySpans`. Each bar's inline `style` SHALL include `position: absolute`, `top: \`${rowIdx * 24}px\``, `left: 0`, `right: 0` (or `width: 100%`), plus the existing `borderLeftColor`/`backgroundColor`/`color` from `event.color`. Keep the existing `onClick={(e) => handleEventBlockClick(event, e)}` and the `event.title` text content. Remove any reliance on flex flow.

## 2. SCSS adjustment

- [x] 2.1 In `src/pages/Calendar/Calendar.module.scss`, modify `.allDayContent`: drop `display: flex`, `flex-wrap: wrap`, and the `gap: 2px` rule. Add `position: relative` so absolutely-positioned bar children use it as the containing block. Keep the existing `padding` (2px top + 2px bottom contribute to the `+ 4` math). Keep `flex: 1` if currently set so the content area still fills the row width.
- [x] 2.2 Verify `.allDayRow`'s `min-height: 40px` floor is unchanged (no edit needed). The empty-state and n=1 rendering must remain visually identical.

## 3. Tests

- [x] 3.1 In `src/pages/Calendar/__tests__/DayView.test.tsx`, add tests inside the existing all-day describe block (or create one if not present):
  - "renders multiple overlapping all-day events at distinct vertical positions": render DayView with two all-day events on the displayed day. Assert both bars are present in the DOM. Assert their inline `style.top` values are distinct — `'0px'` and `'24px'`.
  - "all-day content minHeight reflects row count for two events": with the same two-event setup, query `.allDayContent` (use `container.querySelector` per `vitest.config.ts` `classNameStrategy: 'non-scoped'`) and assert its inline `style.minHeight === '52px'` (= 2 * 24 + 4).
  - "renders three stacked all-day events at top values 0/24/48": with three all-day events, assert sorted `top` values are `['0px', '24px', '48px']` and `.allDayContent` `minHeight === '76px'`.
  - "single all-day event renders at top 0px and minHeight 28px": with one all-day event, assert the bar's `style.top === '0px'` and `.allDayContent` `style.minHeight === '28px'` (= 1 * 24 + 4).

## 4. Manual verification

- [x] 4.1 Run `yarn dev`, navigate to `/calendar`, switch to Day view, create three all-day events on the same day, and verify they stack into three visible rows with no overlap. Verify the time grid below shifts down by the additional rows' height.
- [x] 4.2 Toggle through light, dark, and forest themes. Confirm the stacked all-day bars retain correct contrast and dividers.
- [x] 4.3 Confirm auto-scroll-to-current-time still lands at "now − 2 hours" on today regardless of how many all-day rows are stacked.
- [x] 4.4 Verify the empty-state Day view (no all-day events) is visually identical to before this change (40px outer-row floor still wins).

## 5. Lint and types

- [x] 5.1 `yarn lint` clean for touched files.
- [x] 5.2 `yarn build` (TypeScript compile) clean.
- [x] 5.3 `yarn test` — full suite passes, including the new DayView all-day stacking cases.
