## 1. Header label color fix

- [x] 1.1 In `src/pages/Calendar/Calendar.module.scss`, locate the `.datePickerLabel` rule (currently lines 798-805) and remove the single declaration `color: inherit;`. Keep all other declarations (`cursor: pointer; border: none; background: transparent; padding: 0; font: inherit;` plus the `&:hover { opacity: 0.7; }` block) exactly as they are. Do NOT add a replacement `color:` line in the SCSS — the JSX already supplies `text-primary` (= `color: var(--color-text-primary)`), which now applies cleanly because there is no longer a competing declaration in the CSS module.

## 2. Out-of-month stripe theme overrides

- [x] 2.1 In the same file, leave the existing `.outOfMonth` rule (lines 57-65) unchanged so the light theme continues to use its current pale-blue stripe.
- [x] 2.2 Append two new theme-scoped blocks immediately after the `.outOfMonth` rule (used nested `[data-theme="X"] &` form inside `.outOfMonth` to match the CSS Modules hashed class — this is the established pattern in this file, e.g. `.todayNumber [data-theme="forest"] &`):
  ```scss
  [data-theme="dark"] .outOfMonth {
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 4px,
      rgba(255, 255, 255, 0.04) 4px,
      rgba(255, 255, 255, 0.04) 8px
    );
  }

  [data-theme="forest"] .outOfMonth {
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 4px,
      rgba(255, 255, 255, 0.04) 4px,
      rgba(255, 255, 255, 0.04) 8px
    );
  }
  ```

## 3. Verification

- [x] 3.1 Run `yarn test src/pages/Calendar` — all existing tests still pass (no test changes; behavior is JSDOM-unobservable).
- [x] 3.2 Run `yarn lint` — no new warnings.
- [x] 3.3 Run `yarn build` — TypeScript compile + Vite build succeed.
- [x] 3.4 In the running dev server (http://localhost:5174/), open the Calendar in **light** theme; confirm "May 2026" (or the current header label) is readable and the out-of-month cells in Month view show the existing pale-blue diagonal stripe (no regression).
- [x] 3.5 Switch to **dark** theme; confirm the header label is now light-colored and clearly readable against the dark surface.
- [x] 3.6 In **dark** theme Month view, confirm the out-of-month cells' diagonal stripes are subtle (a faint white-on-dark pattern) and the day numbers (26, 27, 28, 29, 30) are clearly the highest-contrast element of each cell.
- [x] 3.7 Switch to **forest** theme; confirm the same readable-label behavior in the header and the same subtle-stripe behavior in Month view's out-of-month cells.
- [x] 3.8 Switch the theme back and forth between light, dark, and forest with the calendar open; confirm the header label color and out-of-month stripe color update without a page reload (CSS-variable cascade).
- [x] 3.9 Regression checks: the chevron buttons (◀ ▶), the Today button, and the day-of-week column headers (MON, TUE, ...) remain readable in all three themes; the today badge remains visible if today falls in an out-of-month cell.
