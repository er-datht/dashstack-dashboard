## ADDED Requirements

### Requirement: Single loading accent token
The design system SHALL define one semantic CSS custom property, `--color-loading-accent`, in `src/index.css`, and every page-, panel-, and overlay-level loading indicator SHALL derive its colour from that token. No loading indicator SHALL specify a colour as a hardcoded hex value, as a Tailwind numbered-palette class, or through a compile-time SCSS `color()` lookup. The sole exception is the literal `rgba()` form required for translucent values — see "Translucent loading values are authored as literal rgba" below.

#### Scenario: Token is the sole colour source
- **WHEN** any in-scope loading indicator is rendered
- **THEN** its spinner colour resolves from `var(--color-loading-accent)`, directly or through a utility class that itself consumes the token

#### Scenario: No frozen colour literals
- **WHEN** a stylesheet sets a loading indicator's colour
- **THEN** it does so via a CSS custom property, and never via a hex literal or a SCSS map lookup such as `color('primary', '600')`, because SCSS map values are resolved at build time and cannot change with the active theme

### Requirement: Per-theme accent resolution
The `--color-loading-accent` token SHALL be defined once in each of the three theme blocks in `src/index.css` and SHALL resolve to a different primary shade per theme: `var(--color-primary-600)` under `:root` (light), `var(--color-primary-400)` under `[data-theme="dark"]`, and `var(--color-primary-light)` under `[data-theme="forest"]`. Individual loading indicators SHALL NOT declare their own per-theme overrides.

#### Scenario: Light theme resolution
- **WHEN** no `data-theme` attribute is set on `<html>`
- **THEN** `--color-loading-accent` resolves to the light primary shade `#2b5ff7`

#### Scenario: Dark theme resolution
- **WHEN** `data-theme` is `"dark"`
- **THEN** `--color-loading-accent` resolves to the lighter shade `#6691ff`, not the light theme's `#2b5ff7`, which reads muddy against the dark surface

#### Scenario: Forest theme resolution
- **WHEN** `data-theme` is `"forest"`
- **THEN** `--color-loading-accent` resolves to the forest primary `#4ade80`

#### Scenario: No per-indicator theme overrides
- **WHEN** a loading indicator's stylesheet is inspected
- **THEN** it contains no `[data-theme="dark"]` or `[data-theme="forest"]` block that re-declares the spinner colour, because the token already varies by theme

### Requirement: Loading indicators follow the app theme, not the OS
Loading indicators SHALL respond to the application's `data-theme` attribute. They SHALL NOT use Tailwind's `dark:` variant for colour, because in this project `dark:` compiles to a `prefers-color-scheme` media query and therefore tracks the operating system rather than the theme the user selected in the app.

#### Scenario: Theme switch with a contrary OS setting
- **WHEN** the OS colour scheme is light and the user selects the dark theme in the app
- **THEN** every loading indicator's colour, backdrop, and text render in their dark-theme values

#### Scenario: Forest theme is reachable
- **WHEN** the user selects the forest theme
- **THEN** loading indicators render in forest values, rather than falling back to light-theme values as a two-state `dark:` variant would force

### Requirement: Ring spinner track derived from the accent
Every ring-style spinner — one that renders a full circular border with one differently-coloured segment — SHALL draw its track from `var(--color-loading-track)` and its moving arc from `var(--color-loading-accent)`. The track SHALL be the accent at 20% alpha and SHALL NOT use a fixed neutral gray.

#### Scenario: Track follows the theme
- **WHEN** a ring spinner renders under any of the three themes
- **THEN** its track is a translucent tint of that theme's accent, and no theme shows the previous static `#e5e7eb` gray track against a dark surface

#### Scenario: Arc remains distinguishable from track
- **WHEN** a ring spinner is rendered
- **THEN** the arc at full opacity is visibly distinct from the 20% track, so the rotation reads as motion

#### Scenario: Ring degrades legibly without color-mix support
- **WHEN** the stylesheet is rendered by an engine that does not support `color-mix` (Safari <16.4, Chrome <111, Firefox <113 — all within this project's default browser target)
- **THEN** the track is still distinct from the arc, because the translucent values are authored as literal `rgba()` rather than as a `color-mix()` over a custom property

### Requirement: Translucent loading values are authored as literal rgba
Translucent colours in the loading system — the ring track and the overlay scrim — SHALL be declared per theme as literal `rgba()` values. They SHALL NOT be declared as `color-mix(in srgb, var(--some-token) N%, transparent)`.

This is a deliberate exception to the "no hardcoded colour" rule, not an oversight. Lightning CSS cannot statically resolve a mix whose input is a custom property, so it emits an `@supports`-guarded progressive-enhancement fallback of the bare **opaque** colour. For these two values that fallback is actively harmful: the track would equal the arc (a uniform ring with no visible rotation) and the scrim would become fully opaque (hiding the content it is meant to dim).

#### Scenario: Authoring a new translucent loading value
- **WHEN** a translucent colour is added to the loading system
- **THEN** it is written as a literal `rgba()` in each of the three theme blocks, with a comment naming the source colour it is derived from

#### Scenario: Drift between a token and its translucent twin is caught
- **WHEN** an accent or background changes without its `rgba()` twin being updated
- **THEN** the end-to-end spec's channel assertions fail, because they compare the resolved track and scrim channels against the resolved accent and background

### Requirement: Overlay scrim derives from the page background
The loading overlay scrim SHALL derive from `--color-background`, not `--color-surface`.

In the dark and forest themes the surface is *lighter* than the background, so a surface-derived scrim over a page-background-coloured page lightens the content instead of dimming it — the opposite of the intent.

#### Scenario: Scrim dims rather than lightens
- **WHEN** the overlay renders over page-background content in the dark or forest theme
- **THEN** the scrim is a translucent form of that theme's page background, so the content behind fades toward the page rather than being washed lighter

### Requirement: Loading text stays neutral
Text accompanying a loading indicator SHALL use `var(--color-text-secondary)`. It SHALL NOT use the loading accent, and SHALL NOT use a Tailwind numbered-gray class paired with a `dark:` variant.

#### Scenario: Text colour under each theme
- **WHEN** a loading indicator renders an accompanying label such as "Loading…"
- **THEN** the label uses the theme's secondary text colour, so it reads as supporting copy rather than as a link sitting beside a primary-coloured spinner

### Requirement: Accent contrast floor
The loading accent SHALL maintain a contrast ratio of at least 3:1 against the surface it is drawn on in every theme, meeting the WCAG 2.1 non-text contrast threshold for graphical objects. The governing measurement is against `--color-surface`, not `--color-background`: the surface is the tighter pairing and is what the overlay and scrim actually paint.

#### Scenario: Contrast holds in all three themes
- **WHEN** the accent is measured against `--color-surface`
- **THEN** the ratio is at least 3:1 in light (`#2b5ff7` on `#ffffff`, 5.14:1), dark (`#6691ff` on `#344152`, 3.49:1), and forest (`#4ade80` on `#0f2817`, 9.02:1)

#### Scenario: Dark theme margin is treated as nearly spent
- **WHEN** `--color-surface` is darkened or the dark accent is changed
- **THEN** the accent is re-measured against the surface, because dark clears the floor by only 0.49 and is the theme that would cross it first

### Requirement: Scope of the loading accent
The accent SHALL apply to loading indicators that sit on a page, panel, card, or overlay surface. It SHALL NOT apply to a spinner rendered inside a filled primary-background button, which SHALL keep its `text-on-primary` colour.

#### Scenario: Page-level indicator adopts the accent
- **WHEN** a route's Suspense fallback, a `LoadingWrapper`, a `TableCommon` loading overlay, a chart loading state, or a page-level ring spinner renders
- **THEN** it uses the loading accent

#### Scenario: Button-internal spinner keeps its contrast colour
- **WHEN** a submit button with a filled primary background enters its loading state
- **THEN** its spinner stays `text-on-primary`, because an accent-coloured spinner on an accent-coloured button would be invisible

### Requirement: Computed spinner colour is verified per theme in the browser
The project SHALL carry a Playwright end-to-end spec that reads the computed colour of a rendered spinner under each of the three themes and asserts it matches that theme's accent. This verification SHALL NOT be attempted as a unit test, because Vitest replaces CSS Modules with a non-scoped proxy and cannot resolve computed styles.

#### Scenario: Per-theme assertion in a real browser
- **WHEN** the e2e suite runs against a page with a visible loading indicator
- **THEN** it sets each theme in turn and asserts the spinner's computed colour equals that theme's expected accent value

#### Scenario: E2E spec excluded from the unit run
- **WHEN** `yarn test` runs
- **THEN** the new spec under `e2e/` is not collected, because `e2e/**` is excluded from the Vitest configuration
