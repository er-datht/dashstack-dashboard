import { defineConfig, mergeConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
      restoreMocks: true,
      // Playwright specs live in e2e/ and match vitest's default
      // `**/*.spec.ts` discovery pattern, but import from @playwright/test and
      // must only ever run under `yarn test:e2e`. Spreading configDefaults
      // keeps vitest's own excludes (node_modules, dist, ...) intact.
      exclude: [...configDefaults.exclude, 'e2e/**'],
      css: {
        modules: {
          classNameStrategy: 'non-scoped',
        },
      },
      coverage: {
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/test/**', 'src/**/*.d.ts', 'src/types/**'],
      },
    },
  })
)
