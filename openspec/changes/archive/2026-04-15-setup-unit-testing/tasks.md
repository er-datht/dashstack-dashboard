## 1. Install Dependencies

- [x] 1.1 Install vitest, jsdom, @testing-library/react, @testing-library/jest-dom, and @vitest/coverage-v8 as devDependencies via yarn

## 2. Configuration

- [x] 2.1 Create `vitest.config.ts` at project root using `mergeConfig` to inherit existing vite.config.ts, with jsdom environment, globals enabled, and setup file reference
- [x] 2.2 Create test setup file at `src/test/setup.ts` with jest-dom matchers import and react-i18next mock (t returns key as-is)
- [x] 2.3 Add `test`, `test:watch`, and `test:coverage` scripts to `package.json`
- [x] 2.4 Add `vitest/globals` to `compilerOptions.types` in `tsconfig.app.json`
- [x] 2.5 Add `vitest.config.ts` to `include` array in `tsconfig.node.json`

## 3. Example Tests

- [x] 3.1 Create utility test at `src/utils/__tests__/formatters.test.ts` covering all 7 functions (formatCurrency, formatDate, formatNumber, truncate, capitalize, toTitleCase, formatFileSize) with edge cases
- [x] 3.2 Create component test at `src/components/StatusBadge/__tests__/StatusBadge.test.tsx` covering rendering, class assertions for all status types, className passthrough, and i18n keys

## 4. Documentation & Verification

- [x] 4.1 Update CLAUDE.md Development Commands section with `yarn test`, `yarn test:watch`, `yarn test:coverage`
- [x] 4.2 Run `yarn test` and confirm all tests pass
