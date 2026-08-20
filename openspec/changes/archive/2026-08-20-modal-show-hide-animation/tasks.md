## 1. Shared transition hook

- [x] 1.1 Create `src/hooks/useModalTransition.ts` exporting `useModalTransition(isOpen: boolean)` that returns `{ isRendered, isExiting, handleAnimationEnd }`, backed by a `"closed" | "open" | "exiting"` phase in `useState`, initialized from `isOpen` so a first render with `isOpen={false}` yields `isRendered: false`
- [x] 1.2 Drive the phase with the render-time "adjusting state when a prop changes" pattern (not an effect), so the enter animation class is present in the node's first painted commit: `isOpen && phase !== "open"` → `"open"`; `!isOpen && phase === "open"` → `"exiting"`
- [x] 1.3 Implement `handleAnimationEnd` with both mandatory guards — `e.target !== e.currentTarget` (bubbling descendant animations) and `phase !== "exiting"` (the enter animation also fires `animationend` on the same node) — transitioning `"exiting"` → `"closed"` only when both pass
- [x] 1.4 Add the watchdog: arm a `setTimeout` of `EXIT_WATCHDOG_MS = 400` when the exit begins, and clear it on `animationend`, on reopen mid-exit, and on unmount. Comment that 400ms is a deliberate ceiling, NOT a mirror of the 150ms CSS duration, so it never becomes an SCSS↔TS binding
- [x] 1.5 Add a file-header comment documenting the contract for future modals: attach `handleAnimationEnd` to the **overlay** (outermost) node, keep overlay and card exit durations equal, and never gate scroll-lock or focus-trap effects on the `isOpen` prop
- [x] 1.6 Polyfill `window.AnimationEvent` in `src/test/setup.ts` (jsdom 29 lacks it, so React registers the vendor-prefixed `webkitAnimationEnd` and `fireEvent.animationEnd` never reaches `onAnimationEnd`). Must sit above any import that pulls in react-dom — React registers DOM event names once at module init. See design.md decision 11

## 2. Calendar modal SCSS

- [x] 2.1 In `src/pages/Calendar/Calendar.module.scss`, add four local `@keyframes` blocks — overlay enter (`opacity: 0 → 1`), overlay exit (`1 → 0`), card enter (`opacity: 0 → 1` with `transform: scale(0.95) translateY(8px) → scale(1) translateY(0)`), and card exit (the reverse)
- [x] 2.2 Name the classes per the design's naming contract (`.modalOverlayEnter` / `.modalOverlayExit` / `.modalCardEnter` / `.modalCardExit`) and apply them **mutually exclusively** via `cn(base, isExiting ? exit : enter)` — carrying both would put two competing `animation-name` longhands on one node. Add enter/exit animation properties using **longhand** `animation-name` / `-duration` / `-timing-function` / `-fill-mode`, wired to `var(--transition-base)` + `var(--transition-ease-out)` for enter (200ms) and `var(--transition-fast)` + `var(--transition-ease-in)` for exit (150ms)
- [x] 2.3 Add a comment recording the invariant that the overlay and card exit durations must stay equal, since `animationend` is observed on the overlay and an unequal card duration would be truncated
- [x] 2.4 Add a `@media (prefers-reduced-motion: reduce)` block scoped to these four classes that overrides `animation-duration: 1ms`. Do NOT use `animation: none` and do NOT add a global `!important` motion reset — that would break the existing spinner and shimmer animations
- [x] 2.5 Verify `.modalCard`'s new `transform` does not disturb its `max-height: 90vh` flex column, the header/footer dividers, or `.modalBody`'s `overflow-y: auto`

## 3. ConfirmModal SCSS

- [x] 3.1 Mirror tasks 2.1–2.4 in `src/components/ConfirmModal/ConfirmModal.module.scss` for `.confirmOverlay` and `.confirmCard`, defining the keyframes locally (CSS Modules scopes `@keyframes` names, and `@keyframes spin` is already duplicated across six module files — local definitions are the project idiom)
- [x] 3.2 Confirm the overlay's `z-index: 60` layering above AddEventModal still holds while both are animating

## 4. AddEventModal deferred unmount

- [x] 4.1 Wire `useModalTransition(isOpen)` into `src/pages/Calendar/AddEventModal.tsx`, replacing `if (!isOpen) return null` (line 167) with `if (!isRendered) return null`
- [x] 4.2 Apply the enter/exit classes to `.modalOverlay` and `.modalCard` via `cn()` based on `isExiting`, and attach `handleAnimationEnd` to the overlay element
- [x] 4.3 Retain edit context across the exit: add an `editContext` state updated only while `isOpen` is true (same render-time adjustment pattern), and render the header title (line 348) and the Delete button plus its target id (lines 604, 661) from it — otherwise the header flips "Edit Event" → "Add New Event" and Delete vanishes mid-fade, because `handleCloseModal:161`, `handleSaveEvent:249`, and `handleDeleteEvent:255` all clear `editingEvent` in the same update as `isModalOpen`
- [x] 4.4 Re-key the focus-trap / scroll-lock effect (lines 127–165) from `isOpen` to the internal render state so its cleanup runs at actual unmount, keeping "focus the first input" firing exactly once per open
- [x] 4.5 Replace the unconditional `document.body.style.overflow = ""` release with the same `if (!document.querySelector('[aria-modal="true"]'))` handoff guard `ConfirmModal` already uses, so an AddEventModal that unmounts first does not unlock scrolling while the nested ConfirmModal is still exiting
- [x] 4.6 Make the exiting modal inert: early-return from the keydown handler while exiting (without `stopImmediatePropagation`) and from the overlay-click handler while exiting, keeping `pointer-events` on the overlay so swallowed clicks cannot reach the page underneath
- [x] 4.7 Verify the form-reset effect (lines 80–124) cannot run during the exit — its `if (isOpen)` gate already prevents it; confirm no new code path resets state while exiting

## 5. ConfirmModal deferred unmount

- [x] 5.1 Wire `useModalTransition(isOpen)` into `src/components/ConfirmModal/index.tsx`, replacing `if (!isOpen) return null` (line 80) with `if (!isRendered) return null`
- [x] 5.2 Apply the enter/exit classes to `.confirmOverlay` / `.confirmCard` and attach `handleAnimationEnd` to the overlay
- [x] 5.3 Re-key the focus-trap / scroll-lock effect from `isOpen` to the internal render state, keeping the `[aria-modal="true"]` release guard. **Revised during apply:** rather than reusing the existing predicate verbatim, both components exclude their OWN node (captured at effect setup, since React detaches refs on unmount) from the `querySelectorAll` result. This drops the reliance on React commit-ordering that the original plan rested on — see design.md decision 5
- [x] 5.4 Move `previousFocusRef.current?.focus()` out of the unmount cleanup and into the start of the exit, so keyboard focus returns immediately instead of 150ms later
- [x] 5.5 Make the exiting modal inert in both the keydown handler and `handleOverlayClick`, mirroring task 4.6
- [x] 5.6 Confirm no snapshot mechanism is needed here — all props are pre-resolved label strings and none of the three call sites changes a label on close

## 6. Verification

- [x] 6.1 Fix the one pre-existing test the deferred unmount necessarily breaks: `src/pages/ProductStock/__tests__/ProductStock.test.tsx:128` asserts `expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()` immediately after the Cancel click, but the modal is now still present and exiting. Complete the exit first with `fireEvent.animationEnd(document.querySelector(".confirmOverlay"))` and add a comment explaining why. The other two ProductStock confirm tests (`:143`, `:195`) assert only `deleteProduct`/toast/row state and are unaffected
- [x] 6.2 Run `yarn test` and confirm the existing suites stay green, in particular `ConfirmModal.test.tsx:53` (`expect(container).toBeEmptyDOMElement()` for an initial `isOpen={false}` render) and `ProductStock.test.tsx:100` (modal opens on trash click)
- [x] 6.3 Run `yarn lint` and `yarn build` clean
- [x] 6.4 Verify in a real browser, in all three themes: AddEventModal open/close via Escape, overlay click, Cancel and Save; the nested delete confirm; and the ProductStock row-delete confirm — `e2e/modal-animation.spec.ts` (4 tests), screenshots in `e2e/__screenshots__/`
- [x] 6.5 Verify the two artifact fixes hold — page width constant across every frame of the exit AND `document.body.style.overflow` `["hidden"]` while attached / `""` only after detach (the width check alone is near-vacuous on macOS overlay scrollbars); and no "Edit Event" → "Add New Event" title flip when closing from edit mode
- [x] 6.6 Verify reopening mid-exit replays the enter animation and the modal is still mounted past 900ms (proving the 400ms watchdog was cancelled)
- [x] 6.7 Verify under `emulateMedia({ reducedMotion: "reduce" })` that both modals unmount in under 100ms — i.e. via `animationend` at 1ms, not the 400ms watchdog
- [x] 6.8 Verify at 1280×700 that the card stays within 90vh, the body region scrolls, and header/footer do not move while it scrolls

## 7. Tests (unit-test-writer, before implementation)

- [x] 7.1 `useModalTransition`: `isRendered` starts false when `isOpen` is false; becomes true on open; stays true after `isOpen` flips false; becomes false only after `animationend`
- [x] 7.2 The two `handleAnimationEnd` guards — an `animationend` from a descendant (target ≠ currentTarget) does not unmount, and the enter animation's own `animationend` does not unmount an open modal
- [x] 7.3 The watchdog removes the modal when no `animationend` ever arrives (fake timers), and is cancelled when the modal is reopened mid-exit
- [x] 7.4 `AddEventModal`: create the missing test file; cover enter class on open, node retained on close with the exit class applied, removal after `animationend`, all close paths (Escape, overlay click, Cancel, Save) animating, and the retained edit context (title stays "Edit Event" and Delete stays rendered after `editEvent` goes undefined)
- [x] 7.5 `ConfirmModal`: extend the existing file with deferred-unmount coverage while keeping every current assertion passing
- [x] 7.6 Body scroll lock released only on unmount, and not released while another `[aria-modal="true"]` node is still in the DOM
- [x] 7.7 Add a comment in each test file noting that jsdom does not run CSS animations, so `animationend` must be dispatched via `fireEvent.animationEnd(overlay)` or the watchdog driven with fake timers — so a future reader does not mistake this for a broken assertion

## 8. Browser verification tooling

- [x] 8.1 Security-review `@playwright/test` before installing (BLOCKING) — verdict was ⚠️ allow with conditions: system Chrome via `channel: "chrome"`, no CDN browser download, no `@playwright/browser-*` packages
- [x] 8.2 Install `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 yarn add --dev --exact --ignore-scripts @playwright/test@1.62.1` (exact pin matches the repo's zero-caret convention; `--ignore-scripts` suppresses the `fsevents@2.3.2` native rebuild)
- [x] 8.3 Add `playwright.config.ts` pinning `channel: "chrome"`, `workers: 1` (parallel work skews frame sampling), and `webServer` with `reuseExistingServer`
- [x] 8.4 Write `e2e/modal-animation.spec.ts` covering only what jsdom cannot: real timing, reduced motion, theme parity, transform-under-layout, page-width stability
- [x] 8.5 Exclude `e2e/**` from vitest (Playwright specs match its default `**/*.spec.ts` discovery and break `yarn test`); spread `configDefaults.exclude` to keep vitest's own excludes
- [x] 8.6 Add the `test:e2e` script and gitignore `test-results/`, `playwright-report/`, `e2e/__screenshots__/`
- [x] 8.7 Confirm stability across 3 consecutive full runs (8/8 each) — animation-timing assertions are flake-prone
