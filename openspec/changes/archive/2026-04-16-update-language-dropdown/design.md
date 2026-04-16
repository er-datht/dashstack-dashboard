## Context

The current LanguageSwitcher (`src/components/LanguageSwitcher/index.tsx`) uses emoji flags and a hover-based interaction that is inconsistent with the UserMenu dropdown. The Figma design specifies a polished card-style dropdown with a "Select Language" header, real flag images, and a checkmark for the selected language.

The TopNav (`src/components/TopNav/index.tsx`) already coordinates multiple dropdowns via `forceClose`/`onOpen` props, and the UserMenu (`src/components/UserMenu/index.tsx`) establishes the click-based dropdown pattern with animation, Escape key, and click-outside handling.

## Goals / Non-Goals

**Goals:**
- Match the Figma design (node 5:3858): header, flag images, checkmark, rounded card with shadow
- Align interaction model with UserMenu: click-based open/close, Escape key, click-outside
- Maintain the existing TopNav dropdown coordination (forceClose/onOpen) without changing the TopNav component's coordination logic
- Support all 3 themes (light/dark/forest)
- Change LanguageSwitcher API from hover-based props to click-based props (matching UserMenu's `isOpen`/`onClose` pattern)

**Non-Goals:**
- Adding new languages (French/Spanish shown in Figma are reference only; keep en/jp)
- Changing the i18n configuration or translation files
- Adding accessibility features beyond what UserMenu currently has (future work)

## Decisions

### 1. Click-based interaction matching UserMenu pattern

**Decision**: Refactor LanguageSwitcher to use an `isOpen`/`onClose` prop API (same as UserMenu) instead of managing its own open state with hover events. TopNav will own the open/close state.

**Why**: Consistent dropdown behavior across TopNav. The current hover-based model is janky on mobile and inconsistent with UserMenu's click-to-toggle approach. Moving state ownership to TopNav simplifies the forceClose coordination — instead of a `forceClose` prop that triggers an effect, TopNav directly controls `isLangOpen` state alongside `isUserMenuOpen`.

**Alternative considered**: Keep self-managed state with click events inside LanguageSwitcher — rejected because it would require complex coordination logic duplicated between both dropdown components.

### 2. SVG flag assets stored locally

**Decision**: Store flag SVGs as static assets in `src/assets/icons/flags/` (en.svg, jp.svg), imported the same way UserMenu imports its menu icons.

**Why**: Emoji flags render inconsistently across platforms. SVG assets are crisp at any resolution and match the Figma design. Local SVGs avoid external dependencies and load instantly.

**Alternative considered**: Use a flag icon library (e.g., flag-icons) — rejected to avoid a new dependency for just 2 flags.

### 3. Reuse existing CSS variables (no new theme tokens)

**Decision**: Reuse the existing `usermenu-*` CSS variables for the language dropdown panel styling, since both dropdowns share the same visual design (white card, same border, same shadow, same hover state).

**Why**: The Figma design for the language dropdown uses the same visual card style as UserMenu. Adding separate `lang-dropdown-*` variables would duplicate identical values. Both components live in the same TopNav context.

### 4. Animation reuse

**Decision**: Reuse the `animate-usermenu-enter` animation class for the language dropdown panel entry.

**Why**: Same animation behavior desired. If we later want distinct animations, we can rename to a shared class name, but for now reusing avoids duplication.

### 5. TopNav coordination refactor

**Decision**: Replace the current `forceClose`/`onOpen`/`langForceClose` state coordination in TopNav with a simpler approach: TopNav owns `isLangOpen` state, and when either dropdown opens, it closes the other. LanguageSwitcher gets `isOpen`/`onClose` props just like UserMenu.

**Why**: Eliminates the awkward `forceClose` effect-based coordination. Both dropdowns have the same API, and TopNav has a single place that manages mutual exclusivity.

## Risks / Trade-offs

- **[Risk] Emoji-to-SVG flag switch requires sourcing/creating 2 SVG files** → Mitigation: Use simple, well-known public domain flag SVGs. Only 2 flags needed (UK, Japan).
- **[Risk] Breaking existing LanguageSwitcher tests** → Mitigation: Tests will be rewritten to match the new click-based behavior as part of the unit-test-writer phase.
- **[Risk] TopNav prop API change is a breaking refactor** → Mitigation: LanguageSwitcher is only used in TopNav (one call site), so the API change has minimal blast radius.
