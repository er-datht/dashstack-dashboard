# Diff constraint checklist

Shared by `/bug-fix-factory` and `/feature-build-factory` for the **find
violations** step. Review the diff against every item below and list every
violation — change nothing while checking.

These restate `CLAUDE.md`'s **Common Gotchas** and styling rules for use as a
checklist; `CLAUDE.md` remains the source of truth. If the two ever disagree,
`CLAUDE.md` wins and this file is the one to correct.

## General

- No inline styles — **except** the documented tier-2 case: a dynamic value
  referencing a CSS custom property, e.g. `style={{ color: 'var(--color-primary-600)' }}`.
  Static styling goes through Tailwind utilities or an SCSS module
- Every interactive element has an accessible name
- Every image has meaningful `alt`, or `alt=""` if decorative
- No user-facing string hardcoded — keys go through `react-i18next`'s `t()`, with
  the key added to **both** `public/locales/en/` and `public/locales/jp/`
- No hardcoded color or spacing value outside `src/index.css` /
  `src/assets/styles/_variables.scss`
- No `console.log` left behind
- No `any` / `@ts-ignore` added
- Every list render has a stable `key` — not the array index
- No direct DOM manipulation where React owns the node
- Loading and error states are handled for every new data fetch
- No secret, API key, or internal URL added to client-side code
- Only files related to this one change are touched

## Repo-specific

- Class names composed with the `cn()` helper from `src/utils/cn.ts`
  (`classnames`), never `clsx`
- Imports are relative — this repo has no path aliases
- Props typed with `type`, not `interface`; components carry an explicit
  `React.JSX.Element` return type
- The change renders correctly in **all three** themes (light, dark, forest)
- Any new page is lazy-loaded in `src/routes/AppRoutes.tsx`, with its constant in
  `src/routes/routes.ts` and a nav item in `src/components/Sidebar/navigationData.ts`
- No manual `useMemo` / `useCallback` added without a stated reason — React
  Compiler is enabled
- Directory is `src/configs/` (plural); `i18n.ts` lives at the project root, not
  in `src/`
- A theme-adaptive design token has **no** `$colors` entry in `_variables.scss`,
  and SCSS modules read it as `var(--token)` — never `color()`, which freezes one
  theme's value at build time

## Output

A plain numbered list, each entry with `file:line` and what rule it breaks. If
there are none, say so explicitly and continue.

The calling command adds its own **OpenSpec** section to this list — those
bullets are pipeline-specific and stay in the command.
