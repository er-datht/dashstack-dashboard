## Why

Document the core architecture and build system of the DashStack dashboard application. This brownfield spec captures the existing Vite 7 + React 19 + TypeScript 5.9 build pipeline, configuration structure, and application bootstrap flow so that onboarding developers and future changes have a clear reference of the current foundation.

## What Changes

- Document the Vite 7 build pipeline with React Compiler integration
- Document TypeScript 5.9 strict mode configuration with dual tsconfig project references
- Document PostCSS + Tailwind CSS v4 integration
- Document ESLint flat config setup
- Document application entry point and provider nesting hierarchy
- Document the inline theme detection script in index.html that prevents flash of unstyled content

## Capabilities

### New Capabilities
- `build-pipeline`: Vite 7 configuration, React Compiler, HMR, production build, and dev server setup
- `typescript-config`: TypeScript 5.9 strict mode, dual tsconfig project references, and compilation settings
- `app-bootstrap`: Application entry flow from index.html through provider hierarchy to route rendering

### Modified Capabilities

## Impact

- **Files**: `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `postcss.config.js`, `eslint.config.js`, `index.html`, `src/index.tsx`, `src/App.tsx`
- **Dependencies**: `vite`, `@vitejs/plugin-react`, `babel-plugin-react-compiler`, `typescript`, `@tailwindcss/postcss`, `eslint`
- **No runtime code changes** — this is documentation of existing architecture
