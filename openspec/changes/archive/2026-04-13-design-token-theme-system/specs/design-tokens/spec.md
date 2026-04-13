## ADDED Requirements

### Requirement: 3-tier styling hierarchy
The styling system SHALL follow a 3-tier approach: (1) Tailwind utility classes as the primary method (~90% of styling), (2) CSS custom properties for dynamic/inline styles, and (3) SCSS modules only for complex components requiring animations or pseudo-elements.

#### Scenario: Standard component styling
- **WHEN** a developer styles a typical component
- **THEN** they use Tailwind utility classes composed via the `cn()` helper

#### Scenario: Dynamic inline styling
- **WHEN** a component needs dynamic style values that cannot be expressed as utility classes
- **THEN** the developer uses CSS custom properties via inline styles (e.g., `style={{ color: 'var(--color-primary-600)' }}`)

#### Scenario: Complex component styling
- **WHEN** a component requires animations, pseudo-elements, or complex selectors
- **THEN** a co-located SCSS module (`ComponentName.module.scss`) is used

### Requirement: Parallel token formats in sync
The design token system SHALL maintain CSS custom properties (in `src/index.css`) and SCSS variables (in `src/assets/styles/_variables.scss`) in parallel, and these two formats MUST stay in sync.

#### Scenario: Token value consistency
- **WHEN** a design token value is changed in `src/index.css`
- **THEN** the corresponding SCSS variable in `_variables.scss` MUST be updated to match

### Requirement: Theme-adaptive CSS custom properties
The CSS custom properties SHALL define theme-specific values using `:root` (light), `[data-theme="dark"]`, and `[data-theme="forest"]` selectors in `src/index.css`.

#### Scenario: Theme-specific token resolution
- **WHEN** the `data-theme` attribute on `<html>` is set to "dark"
- **THEN** all CSS custom properties resolve to their dark theme values

#### Scenario: Light theme as default
- **WHEN** no `data-theme` attribute is set
- **THEN** the `:root` values (light theme) are used as defaults

### Requirement: Custom utility classes
The design system SHALL provide semantic utility classes (`.card`, `.bg-sidebar`, `.text-primary`, `.bg-topnav`, etc.) in `src/index.css` that automatically adapt to the active theme.

#### Scenario: Theme-aware card styling
- **WHEN** a component uses the `.card` utility class
- **THEN** the card background, border, and shadow adjust to the active theme

### Requirement: classnames via cn() helper
All class name composition SHALL use the `classnames` library through the `cn()` helper exported from `src/utils/cn.ts`. The `clsx` library MUST NOT be used.

#### Scenario: Conditional class composition
- **WHEN** a component needs to conditionally apply classes
- **THEN** it imports `cn` from the utils and uses `cn('base-class', { 'conditional-class': condition })`

### Requirement: SCSS helper functions
The SCSS variable file SHALL export helper functions `color()`, `spacing()`, and `font-size()` for ergonomic access to token maps.

#### Scenario: Accessing a color token in SCSS
- **WHEN** an SCSS file needs to reference a color
- **THEN** it uses `color('primary', '600')` to access the value from the `$colors` map
