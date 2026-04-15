## Context

DashStack has no test framework. The project uses Vite 7 + React 19 + TypeScript 5.9. The team needs a testing foundation with example patterns so members can write tests independently.

## Goals / Non-Goals

**Goals:**
- Establish a working Vitest + React Testing Library setup
- Provide one utility test and one component test as reference patterns
- Keep configuration minimal and aligned with the existing Vite toolchain

**Non-Goals:**
- Full test coverage of the codebase
- E2E or integration testing (Playwright, Cypress)
- CI pipeline integration (can be added later)
- Visual regression testing

## Decisions

### 1. Vitest over Jest
**Choice**: Vitest
**Rationale**: Vitest shares the Vite pipeline (same transforms, same config conventions), offers native TypeScript/ESM support, and is faster for Vite-based projects. Jest would require additional babel/transform config.

### 2. jsdom over happy-dom
**Choice**: jsdom as the test environment
**Rationale**: jsdom is the most widely used and battle-tested DOM implementation for testing. happy-dom is faster but has edge cases with certain DOM APIs. jsdom is the safer default.

### 3. Test file location: co-located `__tests__/` directories
**Choice**: Place tests in `__tests__/` folders next to source files (e.g., `src/utils/__tests__/formatters.test.ts`)
**Rationale**: Co-location keeps tests close to the code they test, making them easy to find. The `__tests__/` subfolder keeps the source directory clean while remaining discoverable.

### 4. i18n mocking strategy
**Choice**: Mock `react-i18next` globally in the test setup file, returning translation keys as-is.
**Rationale**: Most component tests care about whether the correct translation key is used, not the translated string. A global mock avoids per-test boilerplate. Tests that need real translations can override.
**Mock behavior**: `t("status.delivered")` returns `"status.delivered"` (the key without namespace prefix). `useTranslation(ns)` returns `{ t, i18n: { changeLanguage: vi.fn(), language: 'en' } }`.

### 5. Setup file at `src/test/setup.ts`
**Choice**: Single setup file importing `@testing-library/jest-dom/vitest` matchers and i18n mocks.
**Rationale**: Centralizes test bootstrapping. `@testing-library/jest-dom` extends Vitest's `expect` with DOM-specific matchers (`.toBeInTheDocument()`, `.toHaveClass()`, etc.).

### 6. Vitest config inherits Vite config
**Choice**: Use `mergeConfig(viteConfig, defineConfig({ test: {...} }))` in `vitest.config.ts` to inherit the existing `vite.config.ts` (which includes the React plugin with React Compiler).
**Rationale**: This ensures test files are transformed with the same React Compiler babel plugin used in the app, avoiding behavior divergence between dev/build and tests.

## Risks / Trade-offs

- **[React Compiler compatibility]** → The React Compiler babel plugin runs during Vite builds. Vitest uses the same Vite pipeline, so this should work transparently. If issues arise, the test config can exclude the compiler plugin.
- **[CSS/SCSS modules in tests]** → Component tests may import SCSS modules. Vitest's default CSS handling (disabled) is fine since we test behavior, not styles. The `css: false` option in vitest config keeps things simple.
- **[Tailwind v4 classes]** → Tests asserting on class names (e.g., `toHaveClass("bg-teal-500")`) work because we check the className attribute, not computed styles. No Tailwind build step needed in tests.
- **[verbatimModuleSyntax]** → `tsconfig.app.json` has `verbatimModuleSyntax: true`. Test files must use `import type` for type-only imports. Side-effect imports (like the jest-dom setup) work fine.
- **[Intl API locale sensitivity]** → Functions like `formatCurrency` and `formatDate` use `Intl.NumberFormat`/`Intl.DateTimeFormat`. Tests should explicitly pass locale parameters to ensure deterministic output across environments.
