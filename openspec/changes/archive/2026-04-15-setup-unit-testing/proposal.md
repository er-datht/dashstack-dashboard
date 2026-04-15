## Why

The project has no test framework configured. Setting up unit testing with example tests enables the team to write tests for utilities and components going forward, catching regressions early and establishing testing conventions.

## What Changes

- Install Vitest, jsdom, @testing-library/react, @testing-library/jest-dom, and @vitest/coverage-v8 as dev dependencies
- Create `vitest.config.ts` that inherits the existing Vite config (including React Compiler plugin), with jsdom environment
- Add a test setup file for @testing-library/jest-dom matchers and i18n mocking
- Add `test`, `test:watch`, and `test:coverage` scripts to `package.json`
- Update `tsconfig.app.json` to include Vitest types and `tsconfig.node.json` to include `vitest.config.ts`
- Create an example utility test for `src/utils/formatters.ts` (all 7 exported functions: formatCurrency, formatDate, formatNumber, truncate, capitalize, toTitleCase, formatFileSize)
- Create an example component test for `src/components/StatusBadge` (rendering, status-based styling, className passthrough, i18n)
- Update CLAUDE.md with new test commands

## Capabilities

### New Capabilities
- `unit-testing-setup`: Vitest configuration, test setup, example test patterns for utilities and React components

### Modified Capabilities
<!-- No existing spec requirements are changing — this is additive tooling only. -->

## Impact

- **Dependencies**: Adds vitest, @testing-library/react, @testing-library/jest-dom, jsdom, @vitest/coverage-v8 as devDependencies (@testing-library/dom is a transitive peer dep of @testing-library/react)
- **Config files**: New `vitest.config.ts`, new `src/test/setup.ts`, modified `package.json` scripts, modified `tsconfig.app.json`, modified `tsconfig.node.json`
- **Test files**: New `src/utils/__tests__/formatters.test.ts`, new `src/components/StatusBadge/__tests__/StatusBadge.test.tsx`
- **No production code changes** — only dev tooling and test files
