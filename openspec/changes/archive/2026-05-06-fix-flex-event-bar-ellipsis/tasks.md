## 1. CSS rule update — `.eventBar` (month view)

- [x] 1.1 In `src/pages/Calendar/Calendar.module.scss`, edit the `.eventBar` rule (currently lines 67-89): remove the `display: flex;` declaration, remove the `align-items: center;` declaration, and add `line-height: 18px;` (matching the existing `height: 18px`). Keep all other declarations exactly as they are (`position: absolute; bottom: 4px; height: 18px; padding-left: 8px; border-left-width: 4px; border-left-style: solid; border-radius: 2px; font-weight: 600; font-size: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; z-index: 2; pointer-events: auto; cursor: pointer;` plus the `&:hover { opacity: 0.85; }` block).

## 2. CSS rule update — `.allDayEventBar` (day/week all-day pinned row)

- [x] 2.1 In the same file, edit the `.allDayEventBar` rule (currently lines 521-538): remove the `display: flex;` declaration, remove the `align-items: center;` declaration, and add `line-height: 22px;` (matching the existing `height: 22px`). Keep all other declarations exactly as they are (`height: 22px; padding: 0 8px; border-left: 3px solid; border-radius: 2px; font-weight: 600; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;` plus the `&:hover { opacity: 0.85; }` block).
- [x] 2.2 In the same `.allDayEventBar` rule, add `min-width: 0;` and `max-width: 100%;`. These defeat the `min-width: auto` default that, in `DayView.tsx`'s flex parent (`.allDayContent { display: flex; flex-wrap: wrap }`), expands the bar to its full intrinsic content width and prevents `text-overflow: ellipsis` from triggering. Week view is unaffected (its bar uses `position: absolute` with explicit inline width). See design.md Decision 5.
- [x] 2.3 In the existing `.allDayContent` rule (currently lines 512-518), add `min-width: 0;` (no other changes). This breaks the flex `min-width: auto` chain at the parent level — without it, `.allDayContent` expands to its child's intrinsic content width (the full nowrap text) and `.allDayEventBar { max-width: 100% }` resolves against an already-oversized parent. With `min-width: 0` on `.allDayContent`, the flex layout in `.allDayRow` shrinks `.allDayContent` to the available row width, the bar then caps at that constrained width, and the existing `text-overflow: ellipsis` triggers. See design.md Decision 6.

## 3. Verification

- [x] 3.1 Run `yarn test src/pages/Calendar` — all existing tests still pass (no test changes; behavior is JSDOM-unobservable).
- [x] 3.2 Run `yarn lint` — no new warnings.
- [x] 3.3 Run `yarn build` — TypeScript compile + Vite build succeed.
- [x] 3.4 In the running dev server (http://localhost:5174/), open Month view; confirm a long event title (e.g., "The First Event The First Event …") in a day cell ends with "…" at the right edge and is vertically centered inside the bar.
- [x] 3.5 In Month view, confirm a short event title still renders in full with no ellipsis indicator and is vertically centered.
- [x] 3.6 Switch to Day view; create or pick a long-titled all-day event in the pinned all-day row at the top; confirm the title ends with "…" at the right edge and is vertically centered.
- [x] 3.7 Switch to Week view; confirm long single-day all-day titles end with "…" at the right edge of their column.
- [x] 3.8 In Week view, confirm a multi-day all-day event with a long title ends with "…" at the right edge of the spanned bar (not at each column boundary).
- [x] 3.9 Confirm that timed event blocks in Day and Week views (`.timedEventBlock` / `.timedEventTitle`) still wrap multi-line per the previous `wrap-timed-event-title` change — this fix MUST NOT regress that behavior.
- [x] 3.10 Visual smoke check across all three themes (light, dark, forest) — confirm vertical centering and ellipsis appearance in each theme.
