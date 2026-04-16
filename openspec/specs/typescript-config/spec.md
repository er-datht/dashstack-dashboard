# typescript-config Specification

## Purpose
Defines the TypeScript 5.9 strict-mode configuration with project references separating application and build-tool scopes.

## Requirements

### Requirement: Strict mode TypeScript compilation
The project SHALL use TypeScript 5.9 in strict mode for all application source code to maximize type safety.

#### Scenario: Strict type checking on build
- **WHEN** `yarn build` is executed
- **THEN** TypeScript compiler runs in strict mode and rejects any type errors

### Requirement: Dual tsconfig project references
The project SHALL maintain separate TypeScript configurations for application code (`tsconfig.app.json` targeting ES2022 with React JSX) and build tooling (`tsconfig.node.json` targeting ES2023), unified via project references in `tsconfig.json`.

#### Scenario: Application code compilation
- **WHEN** application source files in `src/` are compiled
- **THEN** they use `tsconfig.app.json` settings (ES2022 target, React JSX transform, strict mode)

#### Scenario: Build tool configuration compilation
- **WHEN** build configuration files (e.g., `vite.config.ts`) are type-checked
- **THEN** they use `tsconfig.node.json` settings (ES2023 target)
