## Context

`openspec/specs/` is a flat directory of 43 spec folders, discovered by the `@fission-ai/openspec` CLI using a one-level scan: for every child directory `D`, the CLI reads `specs/D/spec.md`. The CLI powers `list --specs`, `show`, `validate --specs`, `archive`, `status`, and `instructions` — all of which the project depends on via the `opsx:*` skills.

An earlier sketch (`organize-specs.md`) proposed moving specs into nested category folders:
```
openspec/specs/calendar/calendar-day-view/spec.md
```
Before writing any code, we sandbox-tested this layout against the CLI and confirmed it breaks the tooling:

| Command | Behaviour with nested folders |
| --- | --- |
| `openspec list --specs` | Reports the **category name** as a spec with `requirements 0` (ignores the actual `spec.md` two levels down) |
| `openspec show <spec-id>` | `Unknown item '<spec-id>'` |
| `openspec show <category>` | `Unknown item '<category>'` |
| `openspec validate --specs` | `No items found to validate` |
| `openspec archive <change>` | Would attempt to sync deltas into a path the CLI cannot find |

The CLI upstream does not support nested scanning, and forking it is out of scope for a documentation-organization task.

## Goals / Non-Goals

**Goals:**
- Group specs visually by category so related specs are adjacent in any alphabetical listing (filesystem, IDE, `openspec list --specs` output).
- Preserve full compatibility with the OpenSpec CLI and the `opsx:*` skills.
- Preserve git history for every renamed directory via `git mv`.
- Establish a documented convention so future specs follow the same pattern.

**Non-Goals:**
- Changing the content of any spec (`spec.md` files are renamed in-place, not edited).
- Splitting, merging, or deprecating capabilities.
- Rewriting historical archive entries under `openspec/changes/archive/` — their old spec IDs are part of the audit trail.
- Modifying the OpenSpec CLI itself.
- Introducing nested category directories now or in the future.

## Decisions

### Decision 1: Flat directories with `__` separator, not nested folders

Chosen: `openspec/specs/<category>__<short-name>/spec.md`

Alternatives considered:
- **Nested `specs/<category>/<spec>/spec.md`** — rejected; breaks the CLI (see Context table).
- **Single-dash separator `<category>-<short-name>`** — rejected; ambiguous because existing spec IDs already contain dashes (e.g. `calendar-day-view` is *one* id, not `calendar` + `day-view`), so the prefix could not be parsed back out.
- **Dot separator `<category>.<short-name>`** — rejected; dots in directory names are uncommon, visually read as file extensions, and conflict with the kebab-case convention OpenSpec uses elsewhere.
- **Index file only (`specs/README.md` grouping the flat list)** — considered and offered to the user; rejected in favour of renaming so the grouping is visible in every tool, not just a hand-maintained doc.

Rationale: `__` (double underscore) is visually distinct, legal on every filesystem, keeps each half as valid kebab-case, and is unambiguous (no existing spec ID contains `__`).

### Decision 2: Full rename mapping

The 43 specs are grouped into 17 categories. Each new ID is `<category>__<short-name>`.

**Short-name derivation rule** (confirmed with user): when the old spec ID *starts* with the category word, the category word is dropped in the new short-name (e.g. `product-listing` → `product-list__listing`, `dashboard-layout` → `layout__dashboard`, `order-data-layer` → `orders__data-layer`). When the old spec ID does *not* start with the category word, the full old ID is kept (e.g. `today-highlight` → `calendar__today-highlight`, `popover-guests-avatar-row` → `shared__popover-guests-avatar-row`). This keeps new IDs terse when they would otherwise stutter (no `calendar__calendar-day-view`) while preserving descriptive names where they aren't redundant.

| Old ID | New ID | Category |
| --- | --- | --- |
| `calendar-day-view` | `calendar__day-view` | calendar |
| `calendar-view-state` | `calendar__view-state` | calendar |
| `calendar-week-view` | `calendar__week-view` | calendar |
| `today-highlight` | `calendar__today-highlight` | calendar |
| `event-image-upload` | `calendar__event-image-upload` | calendar |
| `event-participants-input` | `calendar__event-participants-input` | calendar |
| `sidebar-paginated-events` | `calendar__sidebar-paginated-events` | calendar |
| `product-listing` | `product-list__listing` | product-list |
| `product-stock` | `product-list__stock` | product-list |
| `wishlist-system` | `product-list__wishlist` | product-list |
| `order-data-layer` | `orders__data-layer` | orders |
| `order-filter-system` | `orders__filter-system` | orders |
| `order-table` | `orders__table` | orders |
| `chart-components` | `dashboard__chart-components` | dashboard |
| `dashboard-composition` | `dashboard__composition` | dashboard |
| `deal-details-table` | `dashboard__deal-details-table` | dashboard |
| `dashboard-layout` | `layout__dashboard` | layout |
| `sidebar-navigation` | `layout__sidebar-navigation` | layout |
| `app-shell` | `layout__app-shell` | layout |
| `notification-dropdown` | `top-nav__notification-dropdown` | top-nav |
| `user-menu` | `top-nav__user-menu` | top-nav |
| `language-dropdown` | `top-nav__language-dropdown` | top-nav |
| `language-switcher` | `top-nav__language-switcher` | top-nav |
| `i18n-config` | `i18n__config` | i18n |
| `design-tokens` | `design-system__tokens` | design-system |
| `scss-mixins` | `design-system__scss-mixins` | design-system |
| `theme-switching` | `design-system__theme-switching` | design-system |
| `api-clients` | `data-layer__api-clients` | data-layer |
| `domain-services` | `data-layer__domain-services` | data-layer |
| `react-query-config` | `data-layer__react-query-config` | data-layer |
| `app-bootstrap` | `foundation__app-bootstrap` | foundation |
| `build-pipeline` | `foundation__build-pipeline` | foundation |
| `typescript-config` | `foundation__typescript-config` | foundation |
| `route-config` | `routing__config` | routing |
| `settings-general-form` | `settings__general-form` | settings |
| `shared-components` | `shared__components` | shared |
| `popover-viewport-clamping` | `shared__popover-viewport-clamping` | shared |
| `confirm-modal` | `shared__confirm-modal` | shared |
| `popover-guests-avatar-row` | `shared__popover-guests-avatar-row` | shared |
| `fix-todo-filter-buttons` | `todo__fix-filter-buttons` | todo |
| `unit-testing-setup` | `testing__unit-setup` | testing |
| `remaining-pages` | `pages__remaining` | pages |
| `pin-package-versions` | `tooling__pin-package-versions` | tooling |

**Placement decisions** (user confirmed group B answer "Split"):
- `confirm-modal` → **`shared__confirm-modal`**. Split out of calendar into shared — the name is generic enough to be a reusable primitive even if calendar is the only current caller.
- `popover-guests-avatar-row` → **`shared__popover-guests-avatar-row`**. Split out of calendar into shared — the "horizontal avatar row in a popover" pattern is reusable.
- `popover-viewport-clamping` → stays in `shared__popover-viewport-clamping`. Generic popover utility, correctly categorised.
- `sidebar-paginated-events` → stays in `calendar__sidebar-paginated-events`. The "sidebar" here is the calendar page's internal event sidebar, not the app Sidebar; the feature is calendar-specific (pagination over calendar events). Flagged for renaming to `calendar__paginated-events-sidebar` in a future change if the naming ambiguity causes confusion.
- `remaining-pages` → kept as single bucket (`pages__remaining`) in **this** change. The user's "Split" answer likely encompasses splitting this bucket too, but doing so requires extracting multiple requirements from `remaining-pages/spec.md` into new per-page spec files (Todo, Login, Settings, plus 9 placeholder pages). That is **spec content surgery**, not a directory rename — it belongs in a follow-up change dedicated to "decompose remaining-pages". See Open Questions.

**Singleton categories kept** (user confirmed group A answer "Not merge"): `i18n/`, `routing/`, `testing/`, `tooling/`, `pages/`, `todo/`, `settings/` each hold a single spec and remain distinct categories. Not folded into `foundation/`. This allows each category to grow independently and keeps the taxonomy expressive.

### Decision 3: Archive directory is historical and immutable

`openspec/changes/archive/<date>-<change>/specs/<old-id>/spec.md` references the spec IDs that were current at archive time. We do not rewrite those because:
- They document what shipped under the old naming.
- Rewriting them creates churn in a directory meant to be a record.
- The OpenSpec CLI only reads `openspec/specs/` for spec resolution; archives are read on demand per change.

New changes going forward will use the new IDs automatically because they'll reference `openspec/specs/` by the new names.

### Decision 4: `CLAUDE.md` "Existing specs" list is updated

The list under "Existing specs" in `CLAUDE.md` names 32 archived changes. That list is keyed by **change name** (e.g. `calendar-today-highlight`), not by spec ID, so the rename does not change the bulleted labels themselves. What changes:
- A new "OpenSpec spec-naming convention" subsection is added under the existing workflow docs describing the `<category>__<short-name>` pattern so future work follows it.
- Entries that mention specific spec IDs inline get updated to the new IDs.

## Risks / Trade-offs

- **`openspec validate` and `openspec archive` will fail on this change** (confirmed in sandbox) → The CLI requires every change folder to contain delta spec files with `## ADDED/MODIFIED/REMOVED/RENAMED Requirements` headers. This change has no requirement deltas (it is a pure rename). `specs/README.md` is a stub and is rejected by the validator. Mitigation: tasks.md skips `openspec validate` / `openspec archive` for this change and uses filesystem operations (`git mv`) for the rename and a manual `git mv` to archive the change folder at the end. This is called out explicitly in tasks section 3 and section 7.
- **Broken cross-references inside archived proposals** → Archived `proposal.md` / `design.md` / `tasks.md` files may reference spec IDs by name in prose. Those references become historical (still valid as a record of what was merged). Mitigation: we deliberately do **not** rewrite them; the archive is a log, not live documentation.
- **Double-underscore looks unusual** → Contributors unfamiliar with the convention may type single-dash and fail naming parsing. Mitigation: CLAUDE.md documents the convention; future proposals go through `proposal-reviewer`, which can catch the slip.
- **Long directory names** → `shared__popover-guests-avatar-row` is 34 characters. Filesystems tolerate this well past 255 chars; no platform risk. Trade-off accepted for clarity.
- **Future recategorisation is another rename** → If we later decide `sidebar-paginated-events` belongs in `shared`, it's a rename. Mitigation: the categorisation is reviewed by `proposal-reviewer` before execution (see tasks.md) so we minimise second-guessing.
- **`git mv` on 43 dirs in one commit** → The commit diff will be large but each move is a pure rename with no content change, so `git log --follow` still works per file. No real risk; just visual noise in history.
- **Archived change names in `CLAUDE.md` "Existing specs" list do not match new category taxonomy** → Entries 1-8 of CLAUDE.md's "Existing specs" list group archived changes by feature area (e.g. `core-architecture-build-system`, `routing-navigation`, `data-layer-api-react-query`) which only partially aligns with the new per-spec category taxonomy (`foundation/`, `routing/`, `layout/`, `data-layer/`). This is fine: the "Existing specs" list documents *changes*, not spec IDs. Mitigation: the new spec-naming-convention subsection in CLAUDE.md clarifies that change names and spec categories are orthogonal concepts.

## Migration Plan

1. **Snapshot pre-rename state** — `npx -y @fission-ai/openspec list --specs > /tmp/openspec-specs-before.txt` to create a diff target for verification.
2. **Execute renames** — One `git mv` per spec directory, in a single commit. See `tasks.md` for the exact command list.
3. **Verify CLI** — Run `npx @fission-ai/openspec list --specs` and confirm all 43 specs appear with their new IDs and unchanged requirement counts. Diff against the snapshot.
4. **Skip `openspec validate` / `openspec archive`** — Both fail on a delta-less change. This is expected; the rename has no requirements to validate.
5. **Update `CLAUDE.md`** — Add the naming-convention subsection.
6. **Delete the sketch** — `organize-specs.md` at the repo root is replaced by this change; remove it.
7. **Archive manually** — `git mv openspec/changes/reorganize-specs-by-category-prefix openspec/changes/archive/<YYYY-MM-DD>-reorganize-specs-by-category-prefix` (do **not** run `openspec archive`).
8. **Rollback** — If something is wrong, the commit is a single revert away. No data is lost because no `spec.md` content changes.

## Open Questions

- **Decomposing `pages__remaining`**: the user's "Split" answer in group B likely includes splitting this bucket into per-page specs (Todo, Login, Settings, Orders, Calendar, Contact, Inbox, Invoice, Pricing, Team, Table, UiElement). Splitting requires extracting 4 existing requirements from `remaining-pages/spec.md` into their own spec files plus creating placeholder specs for the 9 content pages. That is spec content surgery, not a rename, and is deferred to a follow-up change. Proposed follow-up name: `decompose-remaining-pages-spec`.
- **`sidebar-paginated-events` naming ambiguity**: kept in `calendar__` for now since the feature is calendar-specific. If the name "sidebar" keeps being misread as referring to the app Sidebar, consider renaming to `calendar__paginated-events-sidebar` in a follow-up.
