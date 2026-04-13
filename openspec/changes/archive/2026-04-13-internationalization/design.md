## Context

DashStack supports English and Japanese across all 18 pages and shared components. The i18n system uses i18next with HTTP backend for translation file loading, namespace-based organization to keep translation files manageable, and automatic language detection with localStorage persistence. The configuration lives at the project root (not in src/) because it's imported before the React tree renders.

## Goals / Non-Goals

**Goals:**
- Document the i18n configuration and initialization flow
- Capture the namespace organization and when to use registered vs. on-demand loading
- Explain the LanguageSwitcher UX pattern
- Record conventions for adding translations to new features

**Non-Goals:**
- Adding new languages beyond English and Japanese
- Migrating to a different i18n library
- Adding server-side rendering i18n support

## Decisions

### Decision 1: i18n.ts at Project Root
**Choice**: Place the i18n configuration at the project root (`/i18n.ts`) rather than in `src/`.
**Rationale**: The config is imported by `src/index.tsx` before the React tree mounts, making it a bootstrapping concern at the same level as the entry point. Keeping it at root makes this initialization order explicit.
**Alternatives considered**: Inside `src/` (muddies the src boundary), inline in index.tsx (too coupled).

### Decision 2: HttpBackend for Translation Loading
**Choice**: Load translations via HTTP from `/public/locales/` rather than bundling them.
**Rationale**: Translations are loaded on demand, keeping the initial bundle small. New translations can be updated without rebuilding. Each namespace is a separate HTTP request, enabling selective loading.
**Alternatives considered**: Bundled imports (larger bundle, must rebuild for translation changes), remote translation service (infrastructure dependency).

### Decision 3: Namespace-Based Organization
**Choice**: Split translations into 11 registered namespaces (common, navigation, auth, dashboard, products, orders, settings, todo, theme, errors, messages) plus 2 on-demand (favorites, pricing).
**Rationale**: Keeps individual translation files small and scoped. Components load only the namespaces they need. On-demand loading for infrequently used namespaces (favorites, pricing) reduces initial load.

### Decision 4: Hover-Based Language Switcher
**Choice**: Open the language dropdown on hover rather than click.
**Rationale**: Provides quick language switching without an additional click. Common pattern for navigation-level controls in dashboards.

## Risks / Trade-offs

- **[Missing translations]** → No build-time check for missing translation keys. Mitigation: i18next shows the key itself as fallback, making missing translations visible during development.
- **[HTTP loading latency]** → Translation files loaded via HTTP may flash untranslated text. Mitigation: registered namespaces are loaded before the app renders via i18next initialization.
- **[Two language limitation]** → Only en/jp supported. Mitigation: the architecture supports adding languages by creating new locale directories and updating the config.
