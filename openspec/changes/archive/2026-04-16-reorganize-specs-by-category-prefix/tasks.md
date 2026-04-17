## 1. Pre-flight

- [x] 1.1 Verify working tree is clean (`git status` shows no unstaged spec changes)
- [x] 1.2 Capture baseline snapshot: `npx -y @fission-ai/openspec list --specs > /tmp/openspec-specs-before.txt` (verification in §3 diffs against this)
- [x] 1.3 Confirm the 43-entry rename table in `design.md` Decision 2 is the final list (no last-minute recategorisations)
- [x] 1.4 Grep the repo for any scripts or tooling that glob `openspec/specs/` with patterns that assume single-dash names: `grep -rn "openspec/specs" --include='*.{sh,js,ts,json,yaml,yml}' .` (expected: no matches in source code)

## 2. Rename the 43 spec directories via `git mv`

All 43 commands run in one session; produce a single commit titled `chore(openspec): reorganize specs by category prefix`.

- [x] 2.1 `git mv openspec/specs/calendar-day-view openspec/specs/calendar__day-view`
- [x] 2.2 `git mv openspec/specs/calendar-view-state openspec/specs/calendar__view-state`
- [x] 2.3 `git mv openspec/specs/calendar-week-view openspec/specs/calendar__week-view`
- [x] 2.4 `git mv openspec/specs/today-highlight openspec/specs/calendar__today-highlight`
- [x] 2.5 `git mv openspec/specs/event-image-upload openspec/specs/calendar__event-image-upload`
- [x] 2.6 `git mv openspec/specs/event-participants-input openspec/specs/calendar__event-participants-input`
- [x] 2.7 `git mv openspec/specs/sidebar-paginated-events openspec/specs/calendar__sidebar-paginated-events`
- [x] 2.8 `git mv openspec/specs/product-listing openspec/specs/product-list__listing`
- [x] 2.9 `git mv openspec/specs/product-stock openspec/specs/product-list__stock`
- [x] 2.10 `git mv openspec/specs/wishlist-system openspec/specs/product-list__wishlist`
- [x] 2.11 `git mv openspec/specs/order-data-layer openspec/specs/orders__data-layer`
- [x] 2.12 `git mv openspec/specs/order-filter-system openspec/specs/orders__filter-system`
- [x] 2.13 `git mv openspec/specs/order-table openspec/specs/orders__table`
- [x] 2.14 `git mv openspec/specs/chart-components openspec/specs/dashboard__chart-components`
- [x] 2.15 `git mv openspec/specs/dashboard-composition openspec/specs/dashboard__composition`
- [x] 2.16 `git mv openspec/specs/deal-details-table openspec/specs/dashboard__deal-details-table`
- [x] 2.17 `git mv openspec/specs/dashboard-layout openspec/specs/layout__dashboard`
- [x] 2.18 `git mv openspec/specs/sidebar-navigation openspec/specs/layout__sidebar-navigation`
- [x] 2.19 `git mv openspec/specs/app-shell openspec/specs/layout__app-shell`
- [x] 2.20 `git mv openspec/specs/notification-dropdown openspec/specs/top-nav__notification-dropdown`
- [x] 2.21 `git mv openspec/specs/user-menu openspec/specs/top-nav__user-menu`
- [x] 2.22 `git mv openspec/specs/language-dropdown openspec/specs/top-nav__language-dropdown`
- [x] 2.23 `git mv openspec/specs/language-switcher openspec/specs/top-nav__language-switcher`
- [x] 2.24 `git mv openspec/specs/i18n-config openspec/specs/i18n__config`
- [x] 2.25 `git mv openspec/specs/design-tokens openspec/specs/design-system__tokens`
- [x] 2.26 `git mv openspec/specs/scss-mixins openspec/specs/design-system__scss-mixins`
- [x] 2.27 `git mv openspec/specs/theme-switching openspec/specs/design-system__theme-switching`
- [x] 2.28 `git mv openspec/specs/api-clients openspec/specs/data-layer__api-clients`
- [x] 2.29 `git mv openspec/specs/domain-services openspec/specs/data-layer__domain-services`
- [x] 2.30 `git mv openspec/specs/react-query-config openspec/specs/data-layer__react-query-config`
- [x] 2.31 `git mv openspec/specs/app-bootstrap openspec/specs/foundation__app-bootstrap`
- [x] 2.32 `git mv openspec/specs/build-pipeline openspec/specs/foundation__build-pipeline`
- [x] 2.33 `git mv openspec/specs/typescript-config openspec/specs/foundation__typescript-config`
- [x] 2.34 `git mv openspec/specs/route-config openspec/specs/routing__config`
- [x] 2.35 `git mv openspec/specs/settings-general-form openspec/specs/settings__general-form`
- [x] 2.36 `git mv openspec/specs/shared-components openspec/specs/shared__components`
- [x] 2.37 `git mv openspec/specs/popover-viewport-clamping openspec/specs/shared__popover-viewport-clamping`
- [x] 2.38 `git mv openspec/specs/confirm-modal openspec/specs/shared__confirm-modal`
- [x] 2.39 `git mv openspec/specs/popover-guests-avatar-row openspec/specs/shared__popover-guests-avatar-row`
- [x] 2.40 `git mv openspec/specs/fix-todo-filter-buttons openspec/specs/todo__fix-filter-buttons`
- [x] 2.41 `git mv openspec/specs/unit-testing-setup openspec/specs/testing__unit-setup`
- [x] 2.42 `git mv openspec/specs/remaining-pages openspec/specs/pages__remaining`
- [x] 2.43 `git mv openspec/specs/pin-package-versions openspec/specs/tooling__pin-package-versions`

## 3. Smoke-test and verify the CLI

- [x] 3.1 Count directories: `ls openspec/specs | wc -l` → expect `43`
- [x] 3.2 Every directory name contains exactly one `__`: `ls openspec/specs | grep -v '__' || echo OK` → expect `OK`
- [x] 3.3 Capture post-rename snapshot: `npx -y @fission-ai/openspec list --specs > /tmp/openspec-specs-after.txt`
- [x] 3.4 Diff snapshots by requirement count (not by name, since names change): both files should have 43 lines and identical "requirements N" values in the same order after `sort`
- [x] 3.5 Spot-check `npx -y @fission-ai/openspec show calendar__day-view` returns the Day view requirements
- [x] 3.6 Spot-check `npx -y @fission-ai/openspec show product-list__listing` returns product listing requirements
- [x] 3.7 Spot-check `npx -y @fission-ai/openspec show shared__confirm-modal` returns confirm-modal requirements (covers the "split" from calendar)
- [x] 3.8 **Skip** `openspec validate --specs` — expected to fail unrelated to this change; no action needed

## 4. Update `CLAUDE.md`

- [x] 4.1 Add a new **"OpenSpec spec-naming convention"** subsection under the main Workflow section (before or after "OpenSpec commands"). Content to include:
  - **Pattern**: all spec directories are named `<category>__<short-name>` with `__` (double underscore) as the separator. One level deep only — no nested category folders.
  - **Why not nested**: the OpenSpec CLI scans `openspec/specs/` one level deep. Nested folders break `list --specs`, `show`, `validate`, and `archive`.
  - **Short-name rule**: when the old/base spec ID starts with the category word, drop it in the short-name (`product-listing` → `product-list__listing`). Otherwise keep the full descriptive name (`today-highlight` → `calendar__today-highlight`).
  - **Current categories (17)**: `calendar`, `product-list`, `orders`, `dashboard`, `layout`, `top-nav`, `i18n`, `design-system`, `data-layer`, `foundation`, `routing`, `settings`, `shared`, `todo`, `testing`, `tooling`, `pages`.
  - **Adding a new category**: if a new spec doesn't fit any existing category, introduce a new one through a new OpenSpec change rather than forcing it into an unrelated bucket. Singleton categories are fine.
  - **Archived changes use old IDs intentionally**: files under `openspec/changes/archive/` keep their pre-rename IDs as a historical record and are not rewritten.
- [x] 4.2 Verify the existing "Existing specs" numbered list has no inline references to old bare spec IDs that need updating (expected: none — entries are keyed by change name, not spec ID)

## 5. Remove the sketch file

- [x] 5.1 `git rm organize-specs.md` (superseded by this change's artifacts; user confirmed delete) — file was untracked (just committed the preview), used `rm` directly

## 6. Final validation

- [x] 6.1 `yarn lint` (sanity; should be untouched)
- [x] 6.2 `yarn test` (sanity; should be untouched)
- [x] 6.3 `git log --name-status -1` — confirm the commit contains only rename-type entries (`R100`) for the 43 specs plus a deletion of `organize-specs.md` plus the CLAUDE.md edit
- [x] 6.4 Launch `code-reviewer` subagent on the diff. Expected focus: no `spec.md` content changes, CLAUDE.md reads cleanly, `organize-specs.md` deletion is intentional

## 7. Archive the change manually

- [x] 7.1 Archived folder via `git mv openspec/changes/reorganize-specs-by-category-prefix openspec/changes/archive/2026-04-16-reorganize-specs-by-category-prefix` (skipped `openspec archive` because it requires delta specs, which this change does not have)
- [x] 7.2 Appended entry 33 to CLAUDE.md "Existing specs" list with the full 17-category description
