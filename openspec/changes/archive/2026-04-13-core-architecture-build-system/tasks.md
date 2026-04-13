## 1. Verify Build Pipeline

- [ ] 1.1 Confirm `yarn dev` starts development server with HMR
- [ ] 1.2 Confirm `yarn build` produces optimized bundle in `dist/`
- [ ] 1.3 Confirm `yarn lint` runs ESLint without configuration errors
- [ ] 1.4 Confirm `yarn preview` serves the production build

## 2. Validate Configuration Files

- [ ] 2.1 Verify `vite.config.ts` has React Compiler enabled via `babel-plugin-react-compiler`
- [ ] 2.2 Verify `tsconfig.app.json` targets ES2022 with strict mode and React JSX
- [ ] 2.3 Verify `tsconfig.node.json` targets ES2023 for build tooling
- [ ] 2.4 Verify `tsconfig.json` has project references to both app and node configs
- [ ] 2.5 Verify `postcss.config.js` includes `@tailwindcss/postcss` plugin
- [ ] 2.6 Verify `eslint.config.js` uses flat config with TypeScript ESLint, React Hooks, and React Refresh plugins

## 3. Validate Bootstrap Sequence

- [ ] 3.1 Verify `index.html` contains inline theme detection script that sets `data-theme` before React loads
- [ ] 3.2 Verify `src/index.tsx` imports `i18n.ts` from project root before rendering
- [ ] 3.3 Verify `src/App.tsx` nests providers in order: ThemeProvider → QueryClientProvider → WishlistProvider → AppRoutes

## 4. Document Known Gaps

- [ ] 4.1 Note that no test framework is configured
- [ ] 4.2 Note that `src/ui/` directory is empty with no clear purpose
- [ ] 4.3 Note that relative imports are used throughout (no path aliases by design)
