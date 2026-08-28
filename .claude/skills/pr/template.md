<!--
  Authoring scaffold for the `pr` skill.

  The section list here mirrors `.github/pull_request_template.md`, which is the
  source of truth — GitHub renders that file, not this one. If the two disagree,
  the .github file wins and this scaffold is the one to re-sync.

  What this file adds on top of it: the per-section fill-in hints for THIS repo.
  Delete every HTML comment before writing the final `pr-<branch-suffix>.md`,
  except the placeholders `accuracy.md` reserves for the user to supply
  (Screenshots/Videos, Related Documentation).
-->

# Pull Request

## What Changed?

<!-- 1–2 sentence summary of the branch. No filler opener, no restating the title. -->

<!-- Then one bullet per changed file or behavior: what changed and why, stated so
     a reader who has not seen the code understands the before and after. -->

-
-

<!-- Known items — only when the branch came out of a factory run. List the
     MEDIUM/LOW review findings that were accepted rather than fixed. Delete the
     heading if there are none. -->

**Known items**

-

## Screenshots/Videos

<!-- LEAVE FOR THE USER (.claude/rules/accuracy.md). Never describe a shot you
     have not seen. Add one placeholder line per visual surface the diff touches,
     naming the theme — all three are required for any UI change.

     Light:  <screenshot>
     Dark:   <screenshot>
     Forest: <screenshot>

     Delete this section's body and say "No visual change" for a docs-only or
     logic-only branch. -->

## Impact Area Identification

### Which other features or modules may be indirectly affected? (List even if unsure)

<!-- One line each. Then an explicit "Not affected:" list — that is what stops QA
     filing duplicates (.claude/rules/accuracy.md).

     Anything shared has a wide blast radius in this repo. Enumerate the consumers
     when the diff touches any of:
       - src/index.css tokens
       - src/assets/styles/_variables.scss, _mixins.scss
       - shared components (TableCommon, ConfirmModal, StatusBadge, …)
       - src/hooks/, src/contexts/, src/utils/
       - src/services/, src/configs/
       - src/routes/routes.ts, AppRoutes.tsx, Sidebar/navigationData.ts -->

**Affected:**

- **Not affected:**

-

### Type of Impact

<!-- Shared tokens, mixins and shared components → 📦.
     src/configs/ and app-config.ts → 🗄️. -->

- [ ] 📦 Shared code/components/functions
- [ ] 🗄️ Database/Config changes
- [ ] 🔗 External integrations (affects external servers/services that integrate with this service)
- [ ] ❓ Other: **\_**

## Type of Change

<!-- A bugfix/* branch is 🐛, a feature/* branch is ✨.
     Touching public/locales/ adds 🌍. -->

- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🌍 Translation update

## Related Documentation

<!-- Link the OpenSpec change behind the branch — the branch suffix matches the
     change name:
       openspec/changes/<change-name>/
       openspec/changes/archive/<date>-<change-name>/   (once archived)
     Plus the domain's openspec/SPECS-CATALOG.md entry if it was updated.

     Leave a placeholder for anything only the user can supply, e.g. a design link
     (.claude/rules/accuracy.md). -->

-

## How to Test?

<!-- Numbered steps, one action each, with the expected result. Start from
     `yarn dev` (http://localhost:5173). Cover the happy path plus the edge cases
     the diff actually touches — take them from the delta spec, not from guesswork.

     Add a theme-switch step (light → dark → forest) for any visual change.
     Add an en/jp switch step for any copy change. -->

1. `yarn dev` →
2.
3.

## Checklist

<!-- Tick only what the branch actually earns (.claude/rules/accuracy.md):
       🧪 / ✅  only if `yarn test` was run and passed
       ⚠️      only if `yarn lint` and `yarn build` came back clean
     Report, don't assume — see .claude/rules/verify.md. -->

- [ ] 📝 Code follows project style
- [ ] 👀 Self-reviewed my code
- [ ] 💬 Added comments for complex logic
- [ ] 📚 Updated documentation if needed
- [ ] ⚠️ No new warnings introduced
- [ ] 🧪 Added/updated tests
- [ ] ✅ All tests pass locally
