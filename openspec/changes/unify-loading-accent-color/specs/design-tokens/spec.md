## ADDED Requirements

### Requirement: Theme-adaptive tokens have no static SCSS twin
A CSS custom property whose value differs per theme SHALL be declared only in `src/index.css`. It SHALL NOT be mirrored as a literal value in `_variables.scss`. Where an equivalent SCSS entry would otherwise be expected, `_variables.scss` SHALL instead carry a comment pointing to the CSS custom property.

This is a clarification of the existing sync rule, not an exception to it. SCSS map values are resolved at build time and cannot vary with `data-theme`, so copying a theme-adaptive token into `_variables.scss` would freeze one theme's value and produce exactly the drift the sync rule exists to prevent.

#### Scenario: Adding a theme-adaptive token
- **WHEN** a new token is defined with different values under `:root`, `[data-theme="dark"]`, and `[data-theme="forest"]`
- **THEN** no matching SCSS variable is added to `_variables.scss`, and a pointer comment there directs the reader to the CSS custom property instead

#### Scenario: Static token still mirrored
- **WHEN** a token holds the same value across all themes
- **THEN** the existing sync rule applies unchanged and the SCSS variable MUST be kept in step with the CSS custom property

### Requirement: Loading accent token
`src/index.css` SHALL define `--color-loading-accent` in each of the three theme blocks as the single source of truth for loading indicator colour. The `.icon-brand` utility SHALL be redefined to consume this token rather than declaring its own per-theme primary shades.

#### Scenario: Utility consumes the token
- **WHEN** `.icon-brand` is applied to an element
- **THEN** its colour resolves through `var(--color-loading-accent)`, so the utility and the raw token can never disagree

#### Scenario: Existing icon-brand consumers are unaffected visually
- **WHEN** a component that already uses `.icon-brand` renders under any theme
- **THEN** its colour is unchanged, because the token is defined with the same per-theme shades the utility previously hardcoded

## MODIFIED Requirements

### Requirement: Custom utility classes
The design system SHALL provide semantic utility classes (`.card`, `.bg-sidebar`, `.text-primary`, `.bg-topnav`, `.icon-brand`, etc.) in `src/index.css` that automatically adapt to the active theme. Each such utility SHALL be declared at a cascade position where a later, more generic utility cannot silently override it.

#### Scenario: Theme-aware card styling
- **WHEN** a component uses the `.card` utility class
- **THEN** the card background, border, and shadow adjust to the active theme

#### Scenario: Cascade order does not defeat a utility
- **WHEN** a utility class is added to or edited in `src/index.css`
- **THEN** its position relative to other colour utilities is checked, because a later-declared rule of equal specificity wins — the cause of two prior contrast defects in this project

#### Scenario: Numbered palette is not available as a Tailwind utility
- **WHEN** a developer writes a class such as `border-primary-600` or `bg-surface-dark`
- **THEN** no utility is generated, because the numbered scale is declared in `:root` rather than in `@theme`; the value MUST be referenced as `var(--color-...)` or through a semantic utility that is defined in `src/index.css`
