## Context

### Bug 1 — `.datePickerLabel` swallows the theme-aware `text-primary` class

`CalendarHeader.tsx:110-116` renders the date-label as a `<button>` with both a CSS-module class and Tailwind utility classes:

```tsx
<button
  className={cn(styles.datePickerLabel, "font-bold text-2xl text-primary min-w-[200px] text-center")}
  onClick={() => setIsPickerOpen((prev) => !prev)}
>
  {label}
</button>
```

The CSS module rule (`Calendar.module.scss:798-805`) currently looks like:

```scss
.datePickerLabel {
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  color: inherit;
  ...
}
```

The Tailwind `text-primary` utility (`src/index.css:245-247`) is `color: var(--color-text-primary)`. Both selectors have specificity 0,1,0; CSS modules are appended to the cascade *after* the global utility layer. Because both declare the same property, the later one (CSS module) wins for `color`. So the button's effective `color` is `inherit`, which walks up through color-less parent divs to `body`. `body` (`src/index.css:866-872`) sets `background-color` only, no `color`, so `color: inherit` ultimately falls to the browser's user-agent default for `<button>` (`buttontext`, ≈ black).

In light mode the cell background is light, so black-ish text is fine and unnoticed. In dark/forest the surface is dark navy / dark green — the label becomes near-invisible.

The other header buttons (chevrons, Today, view toggle) work correctly because they don't carry `.datePickerLabel`, so their `text-primary` applies cleanly with no override.

### Bug 2 — `.outOfMonth` hardcodes a brand-50 stripe

`Calendar.module.scss:57-65` defines the diagonal-stripe background for cells that fall outside the current month:

```scss
.outOfMonth {
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 4px,
    var(--color-primary-50, rgba(90, 141, 255, 0.05)) 4px,
    var(--color-primary-50, rgba(90, 141, 255, 0.05)) 8px
  );
}
```

`--color-primary-50` is part of the brand color palette (`src/index.css:381` for the default light theme: `#eff4ff` — pale lavender-blue). Brand colors are intentionally NOT redefined per theme — they're constants representing the brand identity. So in dark mode the stripe is the same pale lavender-blue rendered against `#1e293b`-ish navy, producing high luminance contrast that dominates the cell visually.

`today-highlight/spec.md` references "out-of-month striped background" as if its appearance is defined elsewhere, but no spec actually pins down the stripe's per-theme behavior. This change adds that.

## Goals / Non-Goals

**Goals:**
- The header date label SHALL use `var(--color-text-primary)` in all three themes via the existing Tailwind utility — readable in light, dark, and forest.
- Out-of-month cells SHALL render a subtle stripe pattern that does not obscure the day number in any of the three themes.
- All other calendar styling unchanged.

**Non-Goals:**
- Changing the brand color tokens (`--color-primary-50`, etc.).
- Adding a new design token for "out-of-month stripe color" (overkill for two `[data-theme]` blocks; can be promoted later if reused).
- Touching the `react-calendar` popup styling.
- Modifying `today-highlight` or any other calendar styling beyond the two declared rules.
- JSX / component-tree changes.

## Decisions

### Decision 1: Remove `color: inherit` from `.datePickerLabel` rather than replace it with a theme token
- **Choice**: Delete the line. Don't substitute `color: var(--color-text-primary)` in the SCSS.
- **Why**: The button's JSX already declares `text-primary` (which IS `color: var(--color-text-primary)`). Adding the same declaration in CSS would duplicate intent across two layers — when the JSX is the canonical source for typography utilities in this codebase. Removing the override is the smallest, cleanest fix.
- **Alternative considered**: Replace `color: inherit` with `color: var(--color-text-primary)` directly. Rejected — duplicates the Tailwind utility and creates two places to update if the token name ever changes.
- **Alternative considered**: Add `color: var(--color-text-primary)` to `body` so `inherit` propagates correctly. Rejected — wider blast radius for a single-component bug; would mask similar `color: inherit` bugs elsewhere instead of fixing the actual override pattern.

### Decision 2: Use `[data-theme]` attribute selectors with rgba overrides for `.outOfMonth`, not a new design token
- **Choice**: Append two rules:
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
- **Why**: This is the established pattern in `Calendar.module.scss` for theme-specific overrides (see `.todayNumber [data-theme="forest"] &`, `.viewToggleButtonActive [data-theme="forest"] &`, `.currentTimeDot [data-theme="forest"] &`). Adding two blocks keeps the solution local to the rule that needs theming.
- **Why combined as one solid color**: dark and forest both have dark surfaces; a single white-overlay alpha works for both. Different rgba values per theme would be a micro-optimization without visible benefit.
- **Why `rgba(255, 255, 255, 0.04)`**: Empirically subtle enough that the day number remains the highest-contrast element in the cell, while still distinguishing the cell as "outside the current month". Matches the alpha density of similar overlay patterns elsewhere in the project (e.g., the existing fallback `rgba(90, 141, 255, 0.05)` is functionally similar — light overlay at low alpha; we keep that for light mode).
- **Alternative considered**: Define a new CSS variable `--color-out-of-month-stripe` per theme. Rejected — single use site, no reuse; introducing a token for one selector adds noise. Promote to a token only if a third use site appears.
- **Alternative considered**: Reuse `--color-surface-secondary` as the stripe color. Rejected — `--color-surface-secondary` is a solid surface color, not designed for stripe overlays; using it would either be too prominent (when set as a high-contrast surface in some themes) or theme-coupled in unintended ways.
- **Alternative considered**: Use `[data-theme="dark"], [data-theme="forest"] { ... }` combined selector. Equivalent — keeping them separate makes future per-theme tuning trivial without restructuring the CSS, at the cost of three extra lines.

### Decision 3: Do not write tests
- **Choice**: Skip unit tests for both fixes.
- **Why**: JSDOM does not honor CSS custom-property cascade through attribute selectors (`[data-theme]`) and does not compute the visual color of a button after CSS-module + Tailwind utility resolution. Any test asserting the bug fix would either assert against the literal CSS string (brittle) or assert nothing meaningful. Verification is browser-side per `tasks.md` across all three themes.

## Risks / Trade-offs

- **Risk**: Some other component or future change could re-introduce `color: inherit` on `.datePickerLabel`. → **Mitigation**: the new spec scenario in `calendar-view-state` documents the contract ("label adapts to theme") and a reviewer touching `.datePickerLabel` will see the spec citation.
- **Risk**: A future theme (beyond light/dark/forest) is added and the `[data-theme]` overrides on `.outOfMonth` don't account for it. → **Mitigation**: the light-mode default uses the brand-50 token, which IS theme-able if a future theme overrides it; the dark/forest overrides are explicit and will need a new override block per future dark-leaning theme. Acceptable for a project that has shipped the same three themes since inception.
- **Trade-off**: `rgba(255, 255, 255, 0.04)` is a magic-number color rather than a token. The design.md alternative considered captures the rationale; if a third use site appears, promote to a token in a future change.
