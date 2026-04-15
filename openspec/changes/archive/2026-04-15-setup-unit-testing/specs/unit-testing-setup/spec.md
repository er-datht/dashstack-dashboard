## ADDED Requirements

### Requirement: Vitest configuration
The project SHALL have a `vitest.config.ts` at the root that uses `mergeConfig` to inherit the existing Vite config (including React Compiler plugin), uses jsdom as the test environment, enables globals, and references a setup file at `src/test/setup.ts`.

#### Scenario: Vitest resolves project config with React Compiler
- **WHEN** a developer runs `yarn test`
- **THEN** Vitest loads `vitest.config.ts`, inherits the Vite React plugin with React Compiler, uses jsdom environment, and executes all `*.test.ts` / `*.test.tsx` files

### Requirement: Test setup file
The project SHALL have a test setup file at `src/test/setup.ts` that imports `@testing-library/jest-dom/vitest` matchers and provides a global mock for `react-i18next`.

#### Scenario: jest-dom matchers available
- **WHEN** a test file uses `expect(element).toBeInTheDocument()`
- **THEN** the assertion resolves without import errors because the setup file registers jest-dom matchers

#### Scenario: i18n mock returns keys
- **WHEN** a component under test calls `useTranslation("dashboard")` and invokes `t("status.delivered")`
- **THEN** the mock returns `"status.delivered"` as the rendered text (key without namespace prefix)

### Requirement: Package.json test scripts
`package.json` SHALL include a `test` script (`vitest run`), a `test:watch` script (`vitest`), and a `test:coverage` script (`vitest run --coverage`).

#### Scenario: Run tests via yarn
- **WHEN** a developer runs `yarn test`
- **THEN** Vitest executes all test files and reports results

#### Scenario: Run tests in watch mode
- **WHEN** a developer runs `yarn test:watch`
- **THEN** Vitest starts in watch mode and re-runs tests on file changes

### Requirement: TypeScript types for Vitest
`tsconfig.app.json` SHALL include `vitest/globals` in `compilerOptions.types`. `tsconfig.node.json` SHALL include `vitest.config.ts` in its `include` array.

#### Scenario: Global test types resolve
- **WHEN** a test file uses `describe`, `it`, `expect` without importing them
- **THEN** TypeScript does not report type errors

### Requirement: Example utility test
The project SHALL include `src/utils/__tests__/formatters.test.ts` demonstrating how to test pure utility functions, covering all 7 exported functions: `formatCurrency`, `formatDate`, `formatNumber`, `truncate`, `capitalize`, `toTitleCase`, and `formatFileSize`.

#### Scenario: Standard inputs
- **WHEN** `formatCurrency(1234.5, 'USD', 'en-US')` is called
- **THEN** it returns a string containing `1,234.50` and `$`

#### Scenario: truncate edge cases
- **WHEN** `truncate("hello", 10)` is called with maxLength greater than string length
- **THEN** it returns `"hello"` unchanged
- **WHEN** `truncate("hello world", 5)` is called
- **THEN** it returns `"hello..."`

#### Scenario: capitalize and toTitleCase
- **WHEN** `capitalize("hello")` is called
- **THEN** it returns `"Hello"`
- **WHEN** `toTitleCase("hello world")` is called
- **THEN** it returns `"Hello World"`

#### Scenario: formatFileSize edge cases
- **WHEN** `formatFileSize(0)` is called
- **THEN** it returns `"0 Bytes"`
- **WHEN** `formatFileSize(1024)` is called
- **THEN** it returns `"1 KB"`

#### Scenario: All utility tests pass
- **WHEN** a developer runs `yarn test`
- **THEN** all formatter utility tests pass

### Requirement: Example component test
The project SHALL include `src/components/StatusBadge/__tests__/StatusBadge.test.tsx` demonstrating how to test a React component with React Testing Library, covering rendering for each status type, verifying CSS classes, className prop passthrough, and custom translation namespace.

#### Scenario: Renders with correct status classes
- **WHEN** `StatusBadge` is rendered with `status="Delivered"`
- **THEN** the badge element has class `bg-teal-500`
- **WHEN** `StatusBadge` is rendered with `status="Pending"`
- **THEN** the badge element has class `bg-yellow-500`
- **WHEN** `StatusBadge` is rendered with `status="Rejected"`
- **THEN** the badge element has class `bg-red-500`

#### Scenario: Renders correct i18n translation keys
- **WHEN** `StatusBadge` is rendered with `status="Delivered"`
- **THEN** the badge text content is `"status.delivered"` (the translation key)

#### Scenario: className prop is merged
- **WHEN** `StatusBadge` is rendered with `className="custom-class"`
- **THEN** the badge element has both the status class and `"custom-class"`

#### Scenario: All component tests pass
- **WHEN** a developer runs `yarn test`
- **THEN** all StatusBadge component tests pass
