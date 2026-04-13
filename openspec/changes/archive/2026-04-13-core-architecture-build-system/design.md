## Context

DashStack is a React 19 + TypeScript dashboard application using Vite 7 as its build tool. The project uses a modern build stack with React Compiler for automatic optimizations, Tailwind CSS v4 for styling, and a dual TypeScript configuration for separate app and tooling compilation targets. This design documents the existing architecture decisions.

## Goals / Non-Goals

**Goals:**
- Document the build pipeline configuration and its key integration points
- Capture the rationale behind dual tsconfig project references
- Explain the provider hierarchy and bootstrap sequence
- Record why React Compiler is used instead of manual memoization

**Non-Goals:**
- Changing any build configuration
- Adding a test framework (documented as a known gap)
- Introducing path aliases (the project deliberately uses relative imports)

## Decisions

### Decision 1: Vite 7 with React Compiler
**Choice**: Use Vite 7 with `babel-plugin-react-compiler` enabled in the React plugin config.
**Rationale**: React Compiler automatically optimizes component re-renders, eliminating the need for manual `useMemo`/`useCallback` in most cases. This reduces developer cognitive load and prevents stale memoization bugs.
**Alternatives considered**: Manual memoization (error-prone, verbose), SWC-based compilation (doesn't support React Compiler yet).

### Decision 2: Dual TypeScript Configuration
**Choice**: Separate `tsconfig.app.json` (ES2022, React JSX) and `tsconfig.node.json` (ES2023) unified by project references in `tsconfig.json`.
**Rationale**: Application code targets ES2022 for broad browser compatibility, while Node.js build tools (Vite config, ESLint config) can use newer ES2023 features. Project references enable incremental compilation.
**Alternatives considered**: Single tsconfig (forces compromise on target), separate compilation scripts (more complex).

### Decision 3: Tailwind CSS v4 via PostCSS
**Choice**: Integrate Tailwind v4 through `@tailwindcss/postcss` rather than a Vite plugin.
**Rationale**: PostCSS integration is the officially recommended approach for Tailwind v4 and works seamlessly with the existing CSS processing pipeline.

### Decision 4: Inline Theme Detection Script
**Choice**: Include a synchronous theme detection script directly in `index.html` before the React bundle loads.
**Rationale**: Prevents flash of wrong theme (FOWT) by setting `data-theme` on `<html>` before any CSS is evaluated. Reading localStorage is synchronous and fast.
**Alternatives considered**: Setting theme in React (causes visible flash), using CSS `prefers-color-scheme` only (doesn't support custom themes like forest).

### Decision 5: No Path Aliases
**Choice**: Use relative imports throughout the project instead of path aliases like `@/`.
**Rationale**: Avoids configuration complexity across TypeScript, Vite, and ESLint. Relative imports work everywhere without additional tooling setup.

## Risks / Trade-offs

- **[React Compiler maturity]** → React Compiler is relatively new. Mitigation: the compiler is opt-in per-component if issues arise, and manual memoization can be added back selectively.
- **[No test framework]** → No tests exist to validate build output. Mitigation: documented as a known gap; `yarn build` serves as a basic validation step.
- **[Tailwind v4 breaking changes]** → Tailwind v4 has significant API changes from v3. Mitigation: the project is built on v4 from the start, no migration needed.
- **[Empty src/ui/ directory]** → An empty `src/ui/` directory exists with no clear purpose. Mitigation: documented as a known gap for future cleanup.
