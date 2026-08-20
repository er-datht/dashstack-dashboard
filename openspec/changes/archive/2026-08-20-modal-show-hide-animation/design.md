## Context

`AddEventModal` (`src/pages/Calendar/AddEventModal.tsx:167`) and the shared `ConfirmModal` (`src/components/ConfirmModal/index.tsx:80`) both end their render path with:

```tsx
if (!isOpen) {
  return null;
}
```

The enter animation is trivially achievable with a CSS `@keyframes` class on the existing `.modalOverlay` / `.modalCard` (and `.confirmOverlay` / `.confirmCard`) nodes — the animation simply plays on mount, exactly like the existing `usermenu-enter` at `src/index.css:851`. **The exit animation is the whole design problem**: the DOM node currently disappears in the same commit that `isOpen` flips, so there is nothing left to animate. The node must be retained for the exit duration and removed afterwards, which pulls in a cluster of secondary concerns — body scroll-lock timing, focus restoration, focus-trap inertness, prop values that the parent mutates on close, and re-entrancy.

Verified constraints on the existing code:

- All three call sites keep the component mounted and drive it purely via the `isOpen` prop — `Calendar/index.tsx:320` (AddEventModal), `Calendar/index.tsx:342` (ConfirmModal), `ProductStock/index.tsx:260` (ConfirmModal). No `{flag && <Modal/>}` wrapping anywhere, so the deferred unmount can live entirely inside the two components with **zero caller changes**.
- `.modalCard` is a `max-height: 90vh` flex column with a non-scrolling header, an `overflow-y: auto` body, and a non-scrolling footer (see `openspec/specs/calendar-add-event/spec.md`). A `transform: scale()` on this element must not disturb that layout.
- `ConfirmModal` releases the body scroll lock behind a handoff guard — `if (!document.querySelector('[aria-modal="true"]'))` — so that dismissing the nested confirm does not unlock scrolling while `AddEventModal` is still open. `AddEventModal` releases the lock **unconditionally**.
- Every Calendar close path (`handleCloseModal:161`, `handleSaveEvent:249`, `handleDeleteEvent:255`) calls `setEditingEvent(null)` in the same tick as `setIsModalOpen(false)`.
- The project has **no** `prefers-reduced-motion` handling anywhere in `src/`.
- `@keyframes spin` is already duplicated verbatim across six `*.module.scss` files — local-per-module keyframes are the established idiom here, not a shared global.

## Goals / Non-Goals

**Goals:**

- Fade + scale on both show and hide for `AddEventModal` and `ConfirmModal`, 200ms `ease-out` in / 150ms `ease-in` out.
- Every close path — Escape, overlay click, Cancel, Save, Delete-confirm — animates identically. No path skips the exit.
- Keep both components' public prop shapes byte-identical; change no caller.
- Respect `prefers-reduced-motion: reduce`, and establish a pattern the rest of the app can copy.
- No new dependency. Pure CSS animation plus local state.
- Preserve every existing behavior: focus trap, Escape, body scroll lock, image upload, participants input, validation, the 90vh sticky-header/footer layout, and identical rendering across light/dark/forest.

**Non-Goals:**

- Animating `EventDetailPopover`, dropdowns, toasts, or any other overlay.
- Introducing an animation library (Framer Motion, react-transition-group) or a generalized `<Modal>` primitive. Both are disproportionate to a two-component change.
- Backdrop blur, spring physics, or per-theme motion differences.
- Retrofitting `prefers-reduced-motion` onto the app's existing animations (spinners, shimmer, `usermenu-enter`). This change establishes the pattern; adopting it elsewhere is separate work.

## Decisions

### 1. A shared `useModalTransition(isOpen)` hook, not duplicated logic

Both components need the same three-phase lifecycle, the same watchdog, and the same guards. Duplicating that across two files invites drift, so the logic lands in a new hook at `src/hooks/useModalTransition.ts`:

```ts
type ModalPhase = "closed" | "open" | "exiting";

function useModalTransition(isOpen: boolean): {
  isRendered: boolean;   // false → the component returns null
  isExiting: boolean;    // true  → apply the exit animation classes
  handleAnimationEnd: (e: React.AnimationEvent) => void;
};
```

**Alternative considered — inline the ~25 lines in each component.** Rejected: the watchdog timer and the two `onAnimationEnd` guards are exactly the kind of detail that gets fixed in one copy and not the other. A hook also makes this reusable for the next modal, which satisfies the "clean and reusable" requirement for the reduced-motion/animation pattern.

**Alternative considered — a generalized `<Modal>` wrapper component.** Rejected as out of scope: the two modals have materially different overlay/card SCSS, ARIA roles (`dialog` vs `alertdialog`), and focus-trap targets. Unifying them is a larger refactor with no bearing on animation.

### 2. Phase derived during render, not in an effect

The enter animation must be on the node in its **first painted frame**, otherwise the modal shows one un-animated frame at full opacity and then jumps back to the `from` keyframe. An effect-driven `setPhase("open")` after mount cannot guarantee that. So:

```tsx
const [phase, setPhase] = useState<ModalPhase>(isOpen ? "open" : "closed");

// React's documented "adjusting state when a prop changes" pattern.
if (isOpen && phase !== "open") {
  setPhase("open");
} else if (!isOpen && phase === "open") {
  setPhase("exiting");
}
```

Initializing from `isOpen` also preserves the existing test at `ConfirmModal.test.tsx:53` — a first render with `isOpen={false}` starts in `"closed"` and returns `null`, so `expect(container).toBeEmptyDOMElement()` still passes. The deferred unmount only ever engages on a genuine `true → false` transition.

**Alternative considered — `useEffect` + `requestAnimationFrame` to add the enter class.** Rejected: more moving parts and an inherent one-frame flash risk, for no benefit over the render-time adjustment.

### 3. `animationend` drives the unmount; a `setTimeout` is only a watchdog

The visual timing lives **entirely in CSS**. The hook listens for `animationend` on the overlay (the outermost node) and transitions `"exiting" → "closed"` when it fires. This cannot desync from the stylesheet the way a duplicated duration constant would.

Two guards are mandatory on the handler:

- `if (e.target !== e.currentTarget) return;` — `animationend` bubbles, and descendants may run their own animations (spinners, shimmer).
- `if (phase !== "exiting") return;` — the **enter** animation also fires `animationend` on the same node. Without this guard the modal would unmount ~200ms after opening.

Layered underneath is a **watchdog** `setTimeout(…, 400)` armed when the exit begins and cleared on `animationend` or unmount. It exists solely to eliminate the catastrophic failure mode: if `animationend` never arrives, the app is left with a permanently visible full-screen overlay that swallows every click. 400ms is a deliberate ceiling — **not** a mirror of the 150ms CSS value — so it does not become an SCSS↔TS binding that has to track stylesheet edits. If it ever fires, the user sees a hard cut instead of a fade, which is a graceful degradation.

**Alternative considered — `setTimeout` as the primary mechanism**, with the duration as a documented SCSS↔TS binding (the idiom already used by `calculateTitleLineClamp` and the 24px `packAllDayRows` stride). Rejected here: those bindings encode *layout geometry* that JS genuinely has to compute, whereas animation duration is something the browser already knows and will report. Using the event keeps a single source of truth in the SCSS.

### 4. Reduced motion collapses the duration to 1ms — it does not remove the animation

Under `@media (prefers-reduced-motion: reduce)`, the naive `animation: none` is a **trap**: with no animation there is no `animationend`, so the exit would only ever be resolved by the 400ms watchdog — meaning reduced-motion users wait 400ms staring at a frozen modal before it vanishes.

Instead, reduced motion keeps the same animation names and overrides `animation-duration: 1ms`. The event still fires, the unmount stays event-driven, there is exactly one code path, and 1ms of a `scale(0.95)` start state is imperceptible.

This also keeps the reduced-motion handling **entirely in CSS** — no `window.matchMedia` call. That is a meaningful secondary benefit: jsdom does not implement `matchMedia`, so a JS-based check would need a test-setup mock, while the CSS approach needs none.

**Alternative considered — `matchMedia("(prefers-reduced-motion: reduce)")` in the hook to skip the exit phase entirely.** Rejected: two divergent code paths, a jsdom mock requirement, and no listener for users toggling the OS setting mid-session.

### 5. Scroll lock and focus trap key off render state; both releases become guarded

The scroll-lock effect in each component is re-keyed from the `isOpen` prop to the internal render state, so its cleanup runs when the node **actually unmounts** rather than when `isOpen` flips. This is the fix for the visual artifact where releasing `body { overflow: hidden }` at exit *start* lets the scrollbar reappear, changes the page width, and visibly shoves the animating card sideways.

Because the effect's gate stays true for the whole open→exiting span, it does not re-run, so the "focus the first input" side effect fires once per open, as today.

`AddEventModal`'s release must additionally **adopt `ConfirmModal`'s `[aria-modal="true"]` handoff guard**. Today it releases unconditionally, which is safe only because it unmounts instantly. With deferred unmount, a Delete-confirm closes both modals at once and `AddEventModal` may unmount first — unconditionally unlocking scroll while `ConfirmModal` is still exiting, reintroducing the exact scrollbar jump this decision removes. Both components get the same guarded release.

**Implemented form (revised during apply).** The original plan was to reuse `ConfirmModal`'s existing predicate verbatim — `if (!document.querySelector('[aria-modal="true"]'))` — resting on the claim that effect cleanups for a subtree deletion run *after* React has detached the host node, so a component never matches itself. That claim is a React-internals ordering detail, and staking a "does the whole app stay scroll-locked forever" decision on it is a bad trade. Both components instead exclude their own node explicitly:

```ts
const ownDialog = modalRef.current;      // captured at effect SETUP
// ...in cleanup:
const otherModals = Array.from(
  document.querySelectorAll('[aria-modal="true"]')
).filter((node) => node !== ownDialog);
if (otherModals.length === 0) {
  document.body.style.overflow = '';
}
```

Capturing the node at setup time — rather than reading `modalRef.current` in the cleanup — matters because React detaches refs during unmount, so the ref may already be `null` by the time the cleanup runs. A `null` own-node would make every sibling count as "another modal" and the lock would never release.

This form is correct whether or not the node is still attached, which makes the behavior independent of React's commit ordering. On a dependency-change re-run (as opposed to unmount) the cleanup releases and the effect immediately re-locks within the same passive-effect flush, so no paint occurs in between and the release is invisible.

### 6. An exiting modal is fully inert

For the 150ms exit window the modal is visible but must not act. In each component's key handler and overlay-click handler, early-return while exiting:

- **Keyboard**: the exiting modal handles nothing and — importantly — does **not** call `stopImmediatePropagation`. Accepted consequence: pressing Escape inside the 150ms window right after dismissing the nested delete-confirm will also close `AddEventModal`. A 150ms double-Escape race is not worth extra machinery to defend.
- **Overlay click**: the handler early-returns, but the overlay **keeps** `pointer-events`. Deliberately not using `pointer-events: none` — that would let a click pass *through* the fading overlay and hit whatever page control sits underneath, which is worse than swallowing it.

Focus restoration (`ConfirmModal`'s `previousFocusRef.current?.focus()`) happens at exit **start**, not at unmount, so keyboard focus returns immediately and does not feel laggy. Moving a focus ring does not visually compete with a fade.

### 7. `AddEventModal` renders edit context from a retained snapshot

Every Calendar close path clears `editingEvent` in the same tick as `isModalOpen`. Under instant unmount that is invisible. Under deferred unmount, `editEvent` becomes `undefined` while the modal is still on screen, so mid-fade the header would flip **"Edit Event" → "Add New Event"** and the Delete button would pop out of the footer.

`editEvent` is only read at render time in two places — the header title (`AddEventModal.tsx:348`) and the Delete button's presence plus the id it deletes (`:604`, `:661`). So the component retains the last value seen while open and renders those two things from the retained copy:

```tsx
const [editContext, setEditContext] = useState(editEvent);
if (isOpen && editContext !== editEvent) {
  setEditContext(editEvent);
}
```

Same render-time adjustment pattern as decision 2. During exit, `isOpen` is false, so the snapshot is untouched and the modal fades out looking exactly as it did when the user dismissed it.

The form fields need no equivalent treatment: they already live in local state, and the reset effect (`:80–124`) is gated on `if (isOpen)`, so it is a no-op throughout the exit. The `initialDate` prop is likewise only consumed inside that effect, never at render.

`ConfirmModal` needs **no** snapshot — all of its props are pre-resolved label strings, and none of the three call sites changes a label on close.

### 8. Keyframes are defined locally in each SCSS module

Four keyframe blocks (overlay enter/exit, card enter/exit) are defined in `Calendar.module.scss` and again in `ConfirmModal.module.scss`. CSS Modules scopes `@keyframes` names, so referencing a global keyframe from inside a module is fragile; and the project already duplicates `@keyframes spin` across six module files, making local definitions the established idiom.

Animation properties use **longhand** (`animation-name` / `-duration` / `-timing-function` / `-fill-mode`) rather than the shorthand, so the existing `var(--transition-base)` / `var(--transition-fast)` / `var(--transition-ease-out)` / `var(--transition-ease-in)` tokens can be used for duration and easing without relying on custom-property substitution inside a shorthand.

The overlay and card exit durations are kept **equal** (150ms) so that attaching `animationend` to the overlay cannot truncate the card's animation. That equality is an invariant worth a comment in the SCSS.

`animation-fill-mode` differs by direction, deliberately. The **exit** uses `forwards`: it must hold `opacity: 0` after the animation ends, or the card would flash back to full opacity for the frame between the animation completing and the unmount committing. The **enter** uses `backwards`, not `forwards` — its end state (`opacity: 1`, identity transform) is already the card's natural computed style, so filling forwards would gain nothing visually while pinning a `transform` on `.modalCard` permanently. A transform, even an identity one, makes the element a containing block for `fixed`- and `absolute`-positioned descendants and establishes a stacking context. Nothing inside the card relies on that today — the modal's `DatePickerInput` popup is `position: absolute` within its own `position: relative` wrapper, and the page's two `position: fixed` users (`.popoverContainer`, `.datePickerPopup`) render outside the modal — but pinning a permanent transform for no benefit is a trap for whoever next adds a positioned element inside the card.

### 9. Overlay stays theme-independent

`rgba(0, 0, 0, 0.5)` is unchanged — it is already theme-independent and correct on all three themes. Only `opacity` is animated. Animating `opacity` and `transform` exclusively also keeps both animations on the compositor, avoiding layout or paint work on a card that can be 90vh tall.

### 10. Naming contract (binding for both tests and implementation)

Tests are written before the implementation, so the two must agree on exact names or the TDD red state proves nothing. `vitest.config.ts` sets CSS Modules `classNameStrategy: 'non-scoped'`, which means the class names below appear verbatim in rendered markup and are directly assertable.

**Hook** — `src/hooks/useModalTransition.ts`, named exports:

```ts
export const EXIT_WATCHDOG_MS = 400;
export type ModalPhase = "closed" | "open" | "exiting";
export function useModalTransition(isOpen: boolean): {
  isRendered: boolean;
  isExiting: boolean;
  handleAnimationEnd: (e: React.AnimationEvent) => void;
};
```

**Calendar.module.scss** — classes `.modalOverlayEnter`, `.modalOverlayExit`, `.modalCardEnter`, `.modalCardExit`; keyframes `modal-overlay-enter`, `modal-overlay-exit`, `modal-card-enter`, `modal-card-exit`.

**ConfirmModal.module.scss** — classes `.confirmOverlayEnter`, `.confirmOverlayExit`, `.confirmCardEnter`, `.confirmCardExit`; keyframes `confirm-overlay-enter`, `confirm-overlay-exit`, `confirm-card-enter`, `confirm-card-exit`.

`handleAnimationEnd` is attached to the **overlay** in both components (`.modalOverlay`, `.confirmOverlay`), which is also the node tests dispatch `animationEnd` on.

The enter and exit classes are **mutually exclusive** — the natural `cn(base, isExiting ? exit : enter)` form. This is part of the contract, not an incidental detail: carrying both classes at once would put two competing `animation-name` longhands on a single node. The hook deliberately exposes only `isExiting` (no separate `isEntering`) to make the exclusive form the obvious one.

### 11. jsdom needs an `AnimationEvent` polyfill (discovered during apply)

Not anticipated when the artifacts were written, and load-order sensitive enough to be worth recording.

jsdom 29 does not implement `window.AnimationEvent`. React sniffs for that constructor to decide whether the browser supports unprefixed animation events; finding it absent, it registers the **vendor-prefixed** `webkitAnimationEnd` instead of `animationend`. The consequence is silent and confusing: `fireEvent.animationEnd(node)` dispatches a native `animationend` that native listeners see but React's `onAnimationEnd` never receives, so every deferred-unmount test fails while the component works correctly in a browser. Measured directly:

```
AnimationEvent in window: false
fireEvent.animationEnd  -> native: ['animationend']       react: (nothing)
webkitAnimationEnd      -> native: ['webkitAnimationEnd'] react: onAnimationEnd ✓
```

The fix belongs in the environment, not in the tests (dispatching `webkitAnimationEnd` would leak a browser-prefix detail into every test) and not in the product code. `src/test/setup.ts` defines a minimal `AnimationEvent` subclass of `Event` when the global is missing.

**It must stay above any import that pulls in react-dom**, because React registers its DOM event names once at module initialization; move it below and the polyfill has no effect. Deleting it silently reverts every animation test to failing, so it carries a comment saying so.

### 12. Browser verification via Playwright against the SYSTEM Chrome

Five requirements are structurally unverifiable in jsdom — real animation timing, `prefers-reduced-motion` (a media query), theme parity, layout under `transform: scale()`, and page-width stability during the exit — because Vitest swaps CSS Modules for a non-scoped proxy and jsdom runs no animations at all. `e2e/modal-animation.spec.ts` covers exactly those five and deliberately duplicates none of the 55 unit tests.

`@playwright/test@1.62.1` was added as an exact-pinned devDependency after a blocking security review. **Two conditions from that review are binding:**

- **`channel: "chrome"` — drive the system Chrome, never a bundled Chromium.** Playwright 1.62.1 pins Chromium `151.0.7922.34`, ~130 patch revisions behind the installed Chrome `151.0.7922.169`, and predates August 2026's five high-severity use-after-free fixes. The bundled build is also a ~350 MB CDN archive with no published integrity verification, and a pinned browser stays frozen until Playwright is bumped. Do **not** run `playwright install`.
- **Never add `@playwright/browser-*` packages** — unlike `@playwright/test` (which has no install scripts at all), those download a browser at install time. Switching to Firefox or WebKit is a new security decision requiring its own review, not a quiet drop of the channel pin.

Two mechanical points the suite depends on:

- **Selectors match `[class*="..."]` substrings.** Vite hashes CSS-module class names in dev (`_modalOverlay_1a2b3`), so exact class selectors cannot work. Note `modalOverlayExit` contains `modalOverlay`, so enter/exit discrimination comes from asserting on the full className, not from the selector.
- **`e2e/**` must be excluded from vitest.** Playwright specs match vitest's default `**/*.spec.ts` discovery, so without the exclude in `vitest.config.ts` (spreading `configDefaults.exclude`, which in vitest 3.2.4 is the test-defaults object itself — there is no `.test` key) `yarn test` tries to run them and fails.

Timing is measured, not assumed: the suite samples `requestAnimationFrame` **inside the page** and records the class list, attachment state, body overflow, page width, and heading text on every frame of the exit. A wire round-trip per sample could not resolve a 150ms animation. The exit assertions bracket the detach between `EXIT_MS * 0.5` and `WATCHDOG_MS - 50`, which is what distinguishes "the CSS animation ended" from "the watchdog fired" — the reduced-motion case then asserts `< 100ms`, proving `animation-duration: 1ms` still fires `animationend` rather than falling through to the 400ms fallback.

**Known weak assertion, documented in the test:** the page-width check is close to vacuous on macOS, which defaults to *overlay* scrollbars — `clientWidth` would not move even with the bug present. The load-bearing assertion beside it samples `document.body.style.overflow` on every frame instead: `["hidden"]` for the whole time the node is attached, `""` only after it detaches. That is scrollbar-style-independent. Anyone porting this to Linux CI gets the stronger width check for free.

## Risks / Trade-offs

- **`animationend` never fires (element hidden, backgrounded tab, exotic browser) → the modal is stuck on screen forever, blocking the entire app.** → The 400ms watchdog timer guarantees the unmount regardless; worst case the user sees a cut instead of a fade.
- **The enter animation's `animationend` unmounts the modal ~200ms after it opens.** → The `phase !== "exiting"` guard. This is the single most likely implementation bug, and the one the tests must cover most explicitly.
- **A descendant animation's bubbling `animationend` unmounts the modal early.** → The `e.target !== e.currentTarget` guard.
- **jsdom does not run CSS animations, so `animationend` never fires in tests.** → Not a product risk, but it shapes the tests: they must either dispatch `fireEvent.animationEnd(overlay)` or drive the watchdog with fake timers. Worth an explicit comment in the test file so a future reader does not mistake it for a broken assertion.
- **`transform: scale()` on `.modalCard` establishes a containing block and could disturb the 90vh sticky-header/footer layout or the body's `overflow-y: auto`.** → The transform is on the card, while `max-height`/flex/`overflow` all resolve inside it; must be verified visually on a short viewport with a long form, in all three themes.
- **Reopening a modal mid-exit.** → Changing `animation-name` restarts a CSS animation, so `"exiting" → "open"` cleanly interrupts and replays the enter. The watchdog must be cleared on that transition or it will fire mid-enter and unmount an open modal.
- **Setting state during render is unusual and interacts with React Compiler memoization.** → It is a documented React pattern and converges in one extra render pass. Note the project's precedent for compiler-related surprises: the archived `manage-account-page` design records a `useReducer` bump pattern being defeated by React Compiler memoization, with a `useState` mirror as the working form. The approach here is that same `useState` family.
- **The ProductStock delete flow changes behavior without being asked for.** → Explicitly chosen by the user over the mismatch of an animated modal spawning an instant one. Its existing test only asserts that the modal *opens* (`ProductStock.test.tsx:100`), which is unaffected; any close-path assertions need review.
- **The nested delete-confirm's exit can be truncated by its parent.** `AddEventModal` renders `ConfirmModal` as a fragment sibling *after* its own `if (!isRendered) return null`, so when a Delete-confirm closes both at once, whichever overlay's `animationend` lands first wins — and if it is the parent's, the nested confirm is yanked mid-fade. → Accepted rather than engineered around: both exits start in the same update with equal 150ms durations, so the truncation is at most a frame or two and is invisible in practice. Making it deterministic would mean hoisting the confirm out of the modal's render tree or having the parent await its child's exit, both disproportionate. Documented as a scenario in the `calendar-add-event` delta so the behavior is specified rather than accidental.
- **Total interaction time grows by 150ms on every modal dismissal.** → Accepted; 150ms is at the short end of perceptible and the exit is non-blocking (the underlying state change has already been applied by the time the animation starts).
