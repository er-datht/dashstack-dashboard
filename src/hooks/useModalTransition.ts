import { useEffect, useState, type AnimationEvent } from 'react';

/**
 * Ceiling for the exit fallback, in milliseconds.
 *
 * This is deliberately NOT a mirror of the 150ms CSS exit duration, and must
 * never become one — the visual timing lives entirely in the stylesheet and is
 * reported back via `animationend`. This timer exists only so that a missing
 * `animationend` cannot leave the app with a permanently visible full-screen
 * overlay swallowing every click. If it ever fires, the user sees a hard cut
 * instead of a fade, which is a graceful degradation.
 */
export const EXIT_WATCHDOG_MS = 400;

export type ModalPhase = 'closed' | 'open' | 'exiting';

export type ModalTransition = {
  /** `false` means the consumer should render nothing at all. */
  isRendered: boolean;
  /** `true` while the exit animation is playing. */
  isExiting: boolean;
  /** Attach to the modal's OVERLAY (outermost) element. */
  handleAnimationEnd: (e: AnimationEvent) => void;
};

/**
 * Drives the show/hide animation lifecycle of a modal dialog, keeping the node
 * mounted for the duration of its exit animation instead of removing it the
 * moment `isOpen` flips.
 *
 * Contract for consumers (see
 * openspec/changes/modal-show-hide-animation/design.md, decisions 1-6):
 *
 * - Attach `handleAnimationEnd` to the OVERLAY (outermost) node — that is the
 *   element whose animation completing ends the exit.
 * - Keep the overlay and card exit durations EQUAL in the stylesheet, or the
 *   card's animation will be truncated when the overlay's finishes first.
 * - Apply the enter and exit classes MUTUALLY EXCLUSIVELY, i.e.
 *   `cn(base, isExiting ? exit : enter)`. Carrying both at once would put two
 *   competing `animation-name` longhands on a single node, which is why this
 *   hook exposes only `isExiting` and no `isEntering`.
 * - Gate scroll-lock and focus-trap effects on `isRendered`, never on the
 *   `isOpen` prop. Keying them on `isOpen` releases the body scroll lock at
 *   exit START, which lets the scrollbar reappear, changes the page width, and
 *   visibly shoves the animating card sideways.
 * - In the stylesheet, reduced motion must override `animation-duration` to
 *   1ms rather than setting `animation: none` — with no animation there is no
 *   `animationend`, so the exit would only ever resolve via the watchdog.
 *
 * @param isOpen - Whether the modal should be open.
 */
export function useModalTransition(isOpen: boolean): ModalTransition {
  // Deriving the initial phase from `isOpen` is what makes a first render with
  // `isOpen={false}` render nothing at all: the deferred unmount only ever
  // engages on a genuine true -> false transition.
  const [phase, setPhase] = useState<ModalPhase>(isOpen ? 'open' : 'closed');

  // Adjust during render rather than in an effect, so the enter animation class
  // is present in the very commit that inserts the node. An effect-driven
  // update would paint one frame at the final appearance before jumping back to
  // the animation's starting state.
  if (isOpen && phase !== 'open') {
    // Covers both "closed" -> "open" and reopening mid-exit, where changing the
    // animation-name restarts the CSS animation and the enter cleanly
    // interrupts the exit.
    setPhase('open');
  } else if (!isOpen && phase === 'open') {
    setPhase('exiting');
  }

  // Watchdog. Armed on entering "exiting" and torn down whenever the phase
  // changes, so it is cancelled both by `animationend` and by a reopen.
  useEffect(() => {
    if (phase !== 'exiting') {
      return;
    }

    const timerId = window.setTimeout(() => {
      setPhase('closed');
    }, EXIT_WATCHDOG_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [phase]);

  const handleAnimationEnd = (e: AnimationEvent) => {
    // `animationend` bubbles, and descendants of a modal run their own
    // animations (spinners, shimmer), so only the overlay's own animation counts.
    if (e.target !== e.currentTarget) {
      return;
    }

    // The ENTER animation fires `animationend` on this same node. Without this
    // guard every modal would unmount itself ~200ms after opening.
    if (phase !== 'exiting') {
      return;
    }

    setPhase('closed');
  };

  return {
    isRendered: phase !== 'closed',
    isExiting: phase === 'exiting',
    handleAnimationEnd,
  };
}
