import { renderHook, act } from "@testing-library/react";
import type { AnimationEvent as ReactAnimationEvent } from "react";

/**
 * Tests for the new shared modal transition hook at
 * src/hooks/useModalTransition.ts.
 *
 * SPEC: Behavior derived from
 *   openspec/changes/modal-show-hide-animation/design.md (decisions 1-4, 10)
 *   openspec/changes/modal-show-hide-animation/specs/modal-animation/spec.md
 *
 *   Hook contract from design.md decision 10 (binding for tests AND
 *   implementation):
 *     export const EXIT_WATCHDOG_MS = 400;
 *     export type ModalPhase = "closed" | "open" | "exiting";
 *     export function useModalTransition(isOpen: boolean): {
 *       isRendered: boolean;
 *       isExiting: boolean;
 *       handleAnimationEnd: (e: React.AnimationEvent) => void;
 *     };
 *
 * ── WHY THESE TESTS LOOK LIKE THIS ─────────────────────────────────────
 * jsdom does NOT run CSS animations, so an `animationend` event NEVER fires
 * on its own. Every "the exit animation finished" step below therefore
 * dispatches the event by hand — here by invoking `handleAnimationEnd` with a
 * minimal event stub carrying only the `target` / `currentTarget` pair the
 * hook reads. In the component-level suites the same thing is done via
 * `fireEvent.animationEnd(overlay)`.
 *
 * This is NOT a broken assertion or a missing wait: it is the only way to
 * complete an exit animation under jsdom.
 *
 * The single exception is the watchdog suite, which by definition tests the
 * path where `animationend` never arrives. That one uses fake timers, and
 * only that one.
 *
 *   Coverage:
 *   - isRendered derived from the initial isOpen value (a first render with
 *     isOpen=false renders nothing — this is what keeps
 *     ConfirmModal.test.tsx's `toBeEmptyDOMElement()` assertion green)
 *   - the deferred-unmount guarantee: true -> false keeps isRendered true
 *   - unmount happens only after animationend
 *   - guard (a): target !== currentTarget (bubbling descendant animation)
 *   - guard (b): phase !== "exiting" (the ENTER animation fires animationend
 *     on the very same node)
 *   - the EXIT_WATCHDOG_MS fallback, and its cancellation on reopen
 *   - reopening mid-exit
 *
 *   The implementation file does not exist yet — the import below will fail
 *   to resolve until opsx:apply creates it. That is the intended TDD failure.
 */
import { EXIT_WATCHDOG_MS, useModalTransition } from "../useModalTransition";

// --- Helpers --------------------------------------------------------------

/**
 * The hook only ever reads `e.target` and `e.currentTarget` off the event, so
 * a two-field stub is a faithful (and far cheaper) stand-in for a real
 * React.AnimationEvent.
 */
function animationEndOn(
  options: { fromDescendant?: boolean } = {}
): ReactAnimationEvent {
  const overlay = document.createElement("div");

  if (options.fromDescendant) {
    const child = document.createElement("div");
    overlay.appendChild(child);
    // animationend bubbles, so a descendant's animation reaches the overlay
    // handler with target !== currentTarget.
    return {
      target: child,
      currentTarget: overlay,
    } as unknown as ReactAnimationEvent;
  }

  return {
    target: overlay,
    currentTarget: overlay,
  } as unknown as ReactAnimationEvent;
}

function renderTransition(isOpen: boolean) {
  return renderHook(({ isOpen: open }: { isOpen: boolean }) => useModalTransition(open), {
    initialProps: { isOpen },
  });
}

describe("useModalTransition", () => {
  describe("naming contract", () => {
    it("exports EXIT_WATCHDOG_MS as 400", () => {
      // SPEC: design.md decision 3 — 400ms is a deliberate ceiling, NOT a
      // mirror of the 150ms CSS exit duration. It must never become an
      // SCSS<->TS binding.
      expect(EXIT_WATCHDOG_MS).toBe(400);
    });
  });

  describe("initial phase derived from isOpen", () => {
    it("is not rendered when isOpen starts false", () => {
      // SPEC: modal-animation spec, scenario "A modal never opened renders
      // nothing" — deriving the initial phase from isOpen is what preserves
      // ConfirmModal.test.tsx's initial `toBeEmptyDOMElement()` assertion.
      const { result } = renderTransition(false);

      expect(result.current.isRendered).toBe(false);
      expect(result.current.isExiting).toBe(false);
    });

    it("is rendered and not exiting when isOpen starts true", () => {
      const { result } = renderTransition(true);

      expect(result.current.isRendered).toBe(true);
      expect(result.current.isExiting).toBe(false);
    });
  });

  describe("opening", () => {
    it("becomes rendered and not exiting when isOpen flips false -> true", () => {
      const { result, rerender } = renderTransition(false);

      rerender({ isOpen: true });

      expect(result.current.isRendered).toBe(true);
      expect(result.current.isExiting).toBe(false);
    });
  });

  describe("deferred unmount", () => {
    it("stays rendered and reports isExiting when isOpen flips true -> false", () => {
      // SPEC: modal-animation spec, scenario "Node is retained during the
      // exit animation". This is the core guarantee of the whole change.
      const { result, rerender } = renderTransition(true);

      rerender({ isOpen: false });

      expect(result.current.isRendered).toBe(true);
      expect(result.current.isExiting).toBe(true);
    });

    it("stops rendering only after animationend fires on the overlay itself", () => {
      // SPEC: modal-animation spec, scenario "Node is removed after the exit
      // animation completes".
      const { result, rerender } = renderTransition(true);

      rerender({ isOpen: false });
      expect(result.current.isRendered).toBe(true);

      act(() => {
        result.current.handleAnimationEnd(animationEndOn());
      });

      expect(result.current.isRendered).toBe(false);
      expect(result.current.isExiting).toBe(false);
    });

    it("can be opened again after a completed exit", () => {
      const { result, rerender } = renderTransition(true);

      rerender({ isOpen: false });
      act(() => {
        result.current.handleAnimationEnd(animationEndOn());
      });
      expect(result.current.isRendered).toBe(false);

      rerender({ isOpen: true });

      expect(result.current.isRendered).toBe(true);
      expect(result.current.isExiting).toBe(false);
    });
  });

  describe("handleAnimationEnd guards", () => {
    it("ignores an animationend bubbled up from a descendant (target !== currentTarget)", () => {
      // SPEC: modal-animation spec, scenario "A descendant's animation does
      // not trigger an unmount" — spinners and shimmers inside the modal run
      // their own animations and those events bubble to the overlay.
      const { result, rerender } = renderTransition(true);

      rerender({ isOpen: false });

      act(() => {
        result.current.handleAnimationEnd(animationEndOn({ fromDescendant: true }));
      });

      expect(result.current.isRendered).toBe(true);
      expect(result.current.isExiting).toBe(true);
    });

    it("ignores the ENTER animation's own animationend while the modal is open", () => {
      // SPEC: modal-animation spec, scenario "The enter animation does not
      // trigger an unmount". design.md flags this as the single most likely
      // implementation bug: the enter animation fires animationend on the
      // very same overlay node ~200ms after opening, so without the
      // `phase !== "exiting"` guard every modal self-destructs.
      const { result } = renderTransition(true);

      act(() => {
        result.current.handleAnimationEnd(animationEndOn());
      });

      expect(result.current.isRendered).toBe(true);
      expect(result.current.isExiting).toBe(false);
    });
  });

  describe("reopening mid-exit", () => {
    it("returns to the open state and stays rendered", () => {
      // SPEC: modal-animation spec, scenario "Enter interrupts a playing
      // exit".
      const { result, rerender } = renderTransition(true);

      rerender({ isOpen: false });
      expect(result.current.isExiting).toBe(true);

      rerender({ isOpen: true });

      expect(result.current.isRendered).toBe(true);
      expect(result.current.isExiting).toBe(false);
    });
  });

  describe("exit watchdog", () => {
    // NOTE: this is the ONE suite that cannot use a dispatched animationend —
    // it tests precisely the path where no animationend ever arrives.
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("removes the modal after EXIT_WATCHDOG_MS when animationend never arrives", () => {
      // SPEC: modal-animation spec, scenario "Unmount is guaranteed even if
      // the animation never completes" — the app must never be left with a
      // permanently visible overlay swallowing every click.
      const { result, rerender } = renderTransition(true);

      rerender({ isOpen: false });
      expect(result.current.isRendered).toBe(true);

      act(() => {
        vi.advanceTimersByTime(EXIT_WATCHDOG_MS - 1);
      });

      // Still on screen one tick before the ceiling: the watchdog is a safety
      // net, not the timing source.
      expect(result.current.isRendered).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(result.current.isRendered).toBe(false);
      expect(result.current.isExiting).toBe(false);
    });

    it("is cancelled when the modal is reopened mid-exit", () => {
      // SPEC: modal-animation spec, scenario "The pending fallback removal is
      // cancelled on reopen" — a surviving watchdog would fire mid-enter and
      // unmount a modal the user just reopened.
      const { result, rerender } = renderTransition(true);

      rerender({ isOpen: false });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ isOpen: true });

      act(() => {
        vi.advanceTimersByTime(EXIT_WATCHDOG_MS * 2);
      });

      expect(result.current.isRendered).toBe(true);
      expect(result.current.isExiting).toBe(false);
    });

    it("is cancelled by animationend so it cannot fire against a later open", () => {
      const { result, rerender } = renderTransition(true);

      rerender({ isOpen: false });
      act(() => {
        result.current.handleAnimationEnd(animationEndOn());
      });
      expect(result.current.isRendered).toBe(false);

      // Reopen well inside the original watchdog window.
      rerender({ isOpen: true });

      act(() => {
        vi.advanceTimersByTime(EXIT_WATCHDOG_MS * 2);
      });

      expect(result.current.isRendered).toBe(true);
      expect(result.current.isExiting).toBe(false);
    });
  });
});
