## ADDED Requirements

### Requirement: Edit button text contrast survives cascade layers
The Edit button on `ProductCard` SHALL render its label with sufficient contrast against its primary-colored background in both default and hover states across all themes (light / dark / forest). Because the button is rendered as a `<Link>` (i.e., `<a>` element), the text color utility MUST defeat the unlayered global `a { color: inherit }` and `a:hover { color: var(--color-primary-600) }` rules in `src/assets/styles/_globals.scss` — concretely, the className SHALL use `!text-on-primary` (the `!important` variant of `text-on-primary`) rather than `text-on-primary` so the white text wins the cascade.

#### Scenario: Default state contrast
- **WHEN** a user views the products listing page in any theme
- **THEN** the "Edit Product" label on each ProductCard renders in white (or the theme's on-primary color) against the primary-colored button background

#### Scenario: Hover state contrast
- **WHEN** a user hovers over the Edit button on a ProductCard
- **THEN** the "Edit Product" label remains visible (white / on-primary) and does NOT recolor to the same blue as the button background
