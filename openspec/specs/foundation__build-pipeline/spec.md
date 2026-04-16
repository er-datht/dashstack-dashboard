# build-pipeline Specification

## Purpose
Defines the Vite 7 + React Compiler build pipeline, including dev server, production build, PostCSS/Tailwind v4 integration, and ESLint flat config.

## Requirements

### Requirement: Vite development server with HMR
The build system SHALL use Vite 7 as the development server with Hot Module Replacement enabled for rapid development iteration.

#### Scenario: Development server startup
- **WHEN** developer runs `yarn dev`
- **THEN** Vite starts a development server with HMR enabled on the default port

#### Scenario: Hot module replacement on file change
- **WHEN** a source file is modified during development
- **THEN** the browser reflects the change without a full page reload

### Requirement: React Compiler optimization
The build system SHALL enable React Compiler via `babel-plugin-react-compiler` in the Vite config to automatically optimize React components, reducing the need for manual `useMemo` and `useCallback`.

#### Scenario: Automatic component memoization
- **WHEN** a React component is compiled
- **THEN** the React Compiler automatically applies memoization optimizations without manual `useMemo`/`useCallback` annotations

### Requirement: Production build pipeline
The build system SHALL produce an optimized production bundle via `yarn build` that runs TypeScript compilation followed by Vite's production build.

#### Scenario: Successful production build
- **WHEN** developer runs `yarn build`
- **THEN** TypeScript compiles without errors AND Vite produces an optimized bundle in the `dist/` directory

### Requirement: PostCSS with Tailwind CSS v4
The build system SHALL integrate Tailwind CSS v4 via the `@tailwindcss/postcss` PostCSS plugin for utility-first CSS processing.

#### Scenario: Tailwind utility class processing
- **WHEN** a component uses Tailwind utility classes
- **THEN** PostCSS processes them through the Tailwind v4 plugin and includes them in the output CSS

### Requirement: ESLint flat config linting
The build system SHALL use ESLint with flat config format, including TypeScript ESLint, React Hooks, and React Refresh plugins, ignoring `dist` and `resource` directories.

#### Scenario: Lint check execution
- **WHEN** developer runs `yarn lint`
- **THEN** ESLint analyzes all source files (excluding `dist` and `resource`) using TypeScript ESLint, React Hooks, and React Refresh rules
