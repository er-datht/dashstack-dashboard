## 1. Verify Design Token System

- [ ] 1.1 Confirm CSS custom properties in `src/index.css` define values for all three themes (`:root`, `[data-theme="dark"]`, `[data-theme="forest"]`)
- [ ] 1.2 Confirm SCSS variables in `_variables.scss` mirror the CSS custom property token values
- [ ] 1.3 Confirm helper functions `color()`, `spacing()`, `font-size()` work correctly in SCSS files
- [ ] 1.4 Confirm custom utility classes (`.card`, `.bg-sidebar`, `.text-primary`) adapt to all three themes

## 2. Verify Theme Switching

- [ ] 2.1 Confirm ThemeContext provides theme state and `cycleTheme()` function
- [ ] 2.2 Confirm `useTheme()` hook throws when used outside ThemeProvider
- [ ] 2.3 Confirm theme persists to localStorage under `"theme"` key
- [ ] 2.4 Confirm system preference detection works as fallback
- [ ] 2.5 Confirm `data-theme` attribute on `<html>` updates when theme changes

## 3. Verify Styling Conventions

- [ ] 3.1 Confirm `cn()` helper in `src/utils/cn.ts` uses `classnames` library
- [ ] 3.2 Confirm SCSS mixins in `_mixins.scss` cover responsive, layout, typography, and effects
- [ ] 3.3 Confirm SCSS modules are co-located with their components as `ComponentName.module.scss`

## 4. Document Known Gaps

- [ ] 4.1 Note that `appConfig.theme.defaultTheme` type includes only `"light" | "dark"` but forest theme exists
- [ ] 4.2 Note that CSS and SCSS tokens must be manually kept in sync (no auto-generation)
