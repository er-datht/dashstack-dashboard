## ADDED Requirements

### Requirement: Edit action button text contrast survives cascade layers
The Edit action button in the `ProductDetail` action bar SHALL render its label with sufficient contrast against its primary-colored background in both default and hover states across all themes (light / dark / forest). Because the button is rendered as a `<Link>` (i.e., `<a>` element), and the global `a:hover { color: var(--color-primary-600) }` rule in `src/assets/styles/_globals.scss` has higher selector specificity than a single SCSS-module class, the SCSS-module hover block for `.actionButtonPrimary` MUST restate `color: var(--color-white)` so the more-specific `.actionButtonPrimary:hover` selector (0,0,2,0) wins against `a:hover` (0,0,1,1).

#### Scenario: Default state contrast
- **WHEN** a user views a Product Detail page in any theme
- **THEN** the Edit action button label renders in white against the primary-colored background

#### Scenario: Hover state contrast
- **WHEN** a user hovers over the Edit action button on a Product Detail page
- **THEN** the label remains visible (white) and does NOT recolor to the same blue/green as the button background
