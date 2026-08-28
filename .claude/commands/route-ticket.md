---
description: Classify one incoming bug report or task request into exactly one pipeline category, and emit the routing decision as JSON.
argument-hint: <bug report, ticket text, Sentry excerpt, or path to a report file>
model: haiku
---

Routing step for frontend work on dashstack-dashboard (React 19 + Vite 7 SPA / TypeScript).

This command classifies the request and nothing else. It does not investigate, does not read the whole codebase, and never edits a file. Its output is the pipeline configuration that `/bug-fix-factory` and `/feature-build-factory` consume.

Why it exists: a single "fix this bug" prompt has to describe all eight situations below at once, and quality drops. Splitting the classification out lets each pipeline carry rules that apply only to it — `PERFORMANCE` can be forced to profile before proposing a memo, while `THEMING` never needs to open the data layer. The router is also the right place to pick the model for the work that follows.

**Where this sits in the OpenSpec pipeline:** the router runs *before* `requirements-analyst`, which runs before `opsx:propose`. Its `focus` and `skip` fields narrow what `requirements-analyst` investigates and what the resulting proposal covers. It creates no change directory and no artifact — `opsx:propose` owns those.

## Input

`$ARGUMENTS` — the bug report, ticket text, or a path to a file containing it. If `$ARGUMENTS` is empty, ask the user for the report and stop.

## Steps

1. **Read the request.** If `$ARGUMENTS` is a file path, read that file. Read at most a handful of files needed to disambiguate the category — do not start investigating.
2. **Pick exactly one category** from the table below.
3. **Emit the routing decision** as a single fenced ```json block, with no prose before or after it.

## Categories

The gate in the last column is what the downstream pipeline **must** honour — copy it into `must_do`.

| Category | Focus | Model | Gate the pipeline must honour |
| --- | --- | --- | --- |
| `UI_BUG` | Render output, CSS, layout, visual regression in `src/components/` or `src/pages/` | sonnet | Reproduce visually in `yarn dev` before editing — screenshot or exact DOM/CSS at fault |
| `STATE_BUG` | Stale state, wrong derived value, effect loop, React Query cache invalidation in `src/contexts/` or `src/hooks/` | sonnet | Trace the full state path (write → store/query → select → render) before changing one step |
| `API_INTEGRATION` | Fetch, error/loading states, response shape, auth headers, service-layer mapping in `src/services/` | sonnet | Confirm the real response shape against the network payload, the mock data, or the localStorage record — not the type alone |
| `A11Y` | Keyboard, screen reader, focus, contrast, semantics | opus | Name the WCAG criterion; test with keyboard only before claiming a fix |
| `PERFORMANCE` | Re-renders, bundle size, LCP/INP/CLS | sonnet | **Measure first, fix second** — profile or bundle-analyze before proposing any change |
| `RESPONSIVE` | Breakpoints, overflow, touch targets | sonnet | Check every breakpoint the design defines, not just the one that was reported |
| `THEMING` | Wrong or unreadable colors in one theme, hardcoded colors, CSS-custom-property cascade conflicts, SCSS-module vs Tailwind specificity | sonnet | Verify the fix in **all three** themes (light, dark, forest) — a fix that only works in light is not a fix |
| `NEW_COMPONENT` | Net-new component, page, or feature | opus | Hand off to the task factory |

Repo adjustment: `THEMING` replaces the template's default `CONFIG_BUILD` category. This repo's archive contains three separate theme-contrast bugfixes (`fix-calendar-dark-forest-contrast`, `fix-edit-product-button-contrast`, the FilterByDropdown active-option fix) and no build/config defects — the 3-theme axis is where this codebase actually breaks. If a genuine build or env bug arrives, route it `UI_BUG` with `area: vite.config.ts`, or restore `CONFIG_BUILD` here.

## Output format

Exactly one fenced ```json block, nothing else:

```json
{
  "category": "A11Y",
  "area": "src/components/TableCommon/",
  "confidence": "high",
  "model": "opus",
  "next_command": "/bug-fix-factory",
  "focus": "Table rows are not reachable by keyboard when onRowClick is provided",
  "must_do": [
    "name the WCAG criterion",
    "verify with keyboard only before claiming a fix"
  ],
  "skip": ["bundle size", "API integration"]
}
```

Field notes:

- `area` — the directory or route most likely to own the root cause
- `confidence` — `high`, `medium`, or `low`
- `next_command` — `/bug-fix-factory` for defects, `/feature-build-factory` for new work
- `skip` — what the pipeline should deliberately not spend effort on; this is what keeps the downstream prompt short

> Porting note: in a script that calls the API directly, get this JSON cleanly by prefilling the assistant message with an opening ` ```json ` delimiter and setting ` ``` ` as the stop sequence, rather than asking for a fence in the prompt.

## Rules

- **One category only.** If two fit, pick the one that owns the root cause, not the one where the symptom shows.
- **No explanation.** The JSON is the entire response.
- **Never edit code**, never create a branch, never write a ticket, never scaffold an OpenSpec change. Routing is a read-only classification step; `opsx:propose` owns artifact creation.
- **When confidence is `low`, or two categories genuinely tie, ask the user instead of guessing.** Report both candidates and what would distinguish them.
- **Do not re-run the router mid-pipeline.** One classification per request; if the category turns out wrong, stop and tell the user rather than silently switching.
