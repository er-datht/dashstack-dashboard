# Verification commands

Shared by `/bug-fix-factory` and `/feature-build-factory`.

- Lint: `yarn lint`
- Tests: `yarn test`
- Build: `yarn build` — this is `tsc -b && vite build`, so it **covers the type
  check**. Run `yarn tsc -b` on its own only when skipping the build
- E2E: `yarn test:e2e` — Playwright, covering the modal show/hide animation and
  the loading accent colour. Run it if the change touches those surfaces, and
  **add a case** for behaviour jsdom cannot verify: real animation timing,
  `prefers-reduced-motion`, theme parity, or any computed style (Vitest swaps CSS
  Modules for a non-scoped proxy, so no unit test can read a resolved colour).
  New specs go in `e2e/`, which is excluded from vitest; shared setup lives in
  `e2e/helpers.ts`, which is not collected as a suite. **Never run
  `playwright install`** — e2e drives the system Chrome via `channel: "chrome"`,
  a security-review condition

The independent commands above may be launched together rather than in strict
order; only report a pass once every one of them has actually finished.

**Report the actual command output.** Never claim lint, types, or tests pass
without having run them; if something fails, say so and show the failure.

Tooling passing is not the same as spec conformance — `/opsx:verify` is a
separate, also-required step.
