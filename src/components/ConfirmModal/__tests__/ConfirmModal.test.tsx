import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "../index";

/**
 * ── READ THIS BEFORE DEBUGGING A FAILING ASSERTION BELOW ────────────────
 * The second half of this file (the "show/hide animation" describe block)
 * covers the DEFERRED UNMOUNT introduced by
 * openspec/changes/modal-show-hide-animation.
 *
 * jsdom does NOT run CSS animations, so `animationend` NEVER fires on its own.
 * An exit animation can therefore only be completed in a test by dispatching
 * the event explicitly with `fireEvent.animationEnd(overlay)`. Assertions that
 * the modal is STILL in the DOM after `isOpen` goes false are the deferred
 * unmount working as specified — not a missing `await` and not a broken
 * assertion.
 */

/**
 * Tests for the SHARED ConfirmModal at src/components/ConfirmModal/index.tsx.
 *
 * SPEC: Behavior derived from
 *   openspec/changes/implement-product-stock-edit-delete/specs/confirm-modal/spec.md
 *
 *   The component is being PROMOTED from src/pages/Calendar/ConfirmModal.tsx to
 *   the shared location at src/components/ConfirmModal/index.tsx during
 *   implementation. The public API (ConfirmModalProps shape) is unchanged:
 *     { isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }
 *
 *   Until the implementation step performs the move, the import on line 2 will
 *   fail to resolve — that is the intentional TDD failure.
 *
 *   Coverage:
 *   - opens when isOpen=true / returns null when false
 *   - Escape key invokes onCancel
 *   - Overlay click invokes onCancel; clicking the card itself does NOT cancel
 *   - Cancel and Confirm buttons invoke their respective callbacks
 *   - Initial focus lands on the Cancel button
 *   - ARIA attributes: role="alertdialog", aria-modal="true",
 *     aria-labelledby, aria-describedby
 */

const baseProps = {
  isOpen: true,
  title: "Delete product?",
  message: "This cannot be undone.",
  confirmLabel: "Delete",
  cancelLabel: "Cancel",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe("ConfirmModal (shared)", () => {
  describe("rendering", () => {
    it("renders title, message, and both action buttons when isOpen=true", () => {
      render(<ConfirmModal {...baseProps} />);

      expect(screen.getByText("Delete product?")).toBeInTheDocument();
      expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Delete" })
      ).toBeInTheDocument();
    });

    it("returns null and renders nothing when isOpen=false", () => {
      const { container } = render(
        <ConfirmModal {...baseProps} isOpen={false} />
      );

      expect(container).toBeEmptyDOMElement();
      expect(
        screen.queryByRole("alertdialog")
      ).not.toBeInTheDocument();
    });
  });

  describe("ARIA contract", () => {
    it("renders an alertdialog with aria-modal, aria-labelledby, and aria-describedby", () => {
      render(<ConfirmModal {...baseProps} />);

      const dialog = screen.getByRole("alertdialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");

      const labelledById = dialog.getAttribute("aria-labelledby");
      const describedById = dialog.getAttribute("aria-describedby");

      expect(labelledById).toBeTruthy();
      expect(describedById).toBeTruthy();

      // The referenced ids must point at real nodes whose text is the
      // title / message respectively.
      expect(document.getElementById(labelledById!)).toHaveTextContent(
        "Delete product?"
      );
      expect(document.getElementById(describedById!)).toHaveTextContent(
        "This cannot be undone."
      );
    });
  });

  describe("focus management", () => {
    it("focuses the Cancel button when the modal opens", () => {
      render(<ConfirmModal {...baseProps} />);

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      expect(document.activeElement).toBe(cancelButton);
    });
  });

  describe("Escape key", () => {
    it("calls onCancel when the user presses Escape", () => {
      const onCancel = vi.fn();
      render(<ConfirmModal {...baseProps} onCancel={onCancel} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("overlay click", () => {
    it("calls onCancel when the overlay (backdrop) is clicked", () => {
      const onCancel = vi.fn();
      const { container } = render(
        <ConfirmModal {...baseProps} onCancel={onCancel} />
      );

      // SPEC: vitest config sets CSS modules classNameStrategy to "non-scoped",
      // so the rendered class name matches the SCSS identifier.
      const overlay = container.querySelector(".confirmOverlay");
      expect(overlay).not.toBeNull();

      fireEvent.click(overlay!);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("does NOT call onCancel when the click target is the card itself (event bubbles but target is not the overlay)", () => {
      const onCancel = vi.fn();
      render(<ConfirmModal {...baseProps} onCancel={onCancel} />);

      // Clicking inside the card should bubble but the overlay handler bails
      // because e.target !== e.currentTarget.
      const dialog = screen.getByRole("alertdialog");
      fireEvent.click(dialog);

      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe("button click handlers", () => {
    it("calls onCancel when the Cancel button is clicked", () => {
      const onCancel = vi.fn();
      render(<ConfirmModal {...baseProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onConfirm when the Confirm button is clicked", () => {
      const onConfirm = vi.fn();
      render(<ConfirmModal {...baseProps} onConfirm={onConfirm} />);

      fireEvent.click(screen.getByRole("button", { name: "Delete" }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });
});

/**
 * SPEC: Show/hide animation + deferred unmount. Behavior derived from
 *   openspec/changes/modal-show-hide-animation/specs/modal-animation/spec.md
 *   openspec/changes/modal-show-hide-animation/specs/confirm-modal/spec.md
 *   openspec/changes/modal-show-hide-animation/design.md (decisions 2, 3, 5, 6, 10)
 *
 *   The overlay (`.confirmOverlay`) is the node that carries `onAnimationEnd`
 *   (design.md decision 10), so it is also the node these tests dispatch
 *   `animationEnd` on. Class names appear verbatim thanks to vitest's
 *   `classNameStrategy: 'non-scoped'` (see the overlay-click test above).
 *
 *   Coverage:
 *   - enter classes on the overlay and card when open
 *   - node retained + exit classes when isOpen goes true -> false
 *   - removal only after animationend on the overlay
 *   - the enter animation's own animationend does not unmount
 *   - a descendant's bubbled animationend does not unmount
 *   - every close path animates: Escape, overlay click, Cancel, Confirm
 *   - the exiting modal is inert
 *   - focus is restored at exit START, not at unmount
 *   - body scroll lock held through the exit, released on unmount
 *
 *   These assertions fail until opsx:apply wires in useModalTransition. That
 *   is the intended TDD failure. Every assertion in the block ABOVE must keep
 *   passing throughout — in particular the initial `isOpen={false}` render
 *   returning an empty container, which the hook preserves by deriving its
 *   initial phase from `isOpen`.
 */

function getConfirmOverlay(container: HTMLElement): HTMLElement {
  const overlay = container.querySelector(".confirmOverlay");
  expect(overlay).not.toBeNull();
  return overlay as HTMLElement;
}

function getConfirmCard(container: HTMLElement): HTMLElement {
  const card = container.querySelector(".confirmCard");
  expect(card).not.toBeNull();
  return card as HTMLElement;
}

/**
 * Mirrors every real call site (Calendar/index.tsx:342, ProductStock/index.tsx:260,
 * AddEventModal.tsx:652): the component stays mounted and the parent flips
 * `isOpen` from within the callback.
 */
function ConfirmHarness({
  onCancelSpy,
  onConfirmSpy,
}: {
  onCancelSpy?: () => void;
  onConfirmSpy?: () => void;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <ConfirmModal
      {...baseProps}
      isOpen={isOpen}
      onCancel={() => {
        onCancelSpy?.();
        setIsOpen(false);
      }}
      onConfirm={() => {
        onConfirmSpy?.();
        setIsOpen(false);
      }}
    />
  );
}

// Nodes appended straight to document.body by a test (a focus trigger, a
// stand-in sibling modal). Tracked so a failing assertion cannot leak them
// into the next test.
const strayNodes: HTMLElement[] = [];

function appendToBody(el: HTMLElement): HTMLElement {
  document.body.appendChild(el);
  strayNodes.push(el);
  return el;
}

describe("ConfirmModal (shared) — show/hide animation", () => {
  beforeEach(() => {
    // The scroll-lock assertions read a global, so start from a known state.
    document.body.style.overflow = "";
  });

  afterEach(() => {
    strayNodes.splice(0).forEach((el) => el.remove());
  });

  describe("enter animation", () => {
    it("applies the enter classes to the overlay and the card when open", () => {
      // SPEC: modal-animation spec, scenarios "Overlay and card animate in on
      // open" and "Enter animation is present on the first painted frame".
      const { container } = render(<ConfirmModal {...baseProps} />);

      const overlay = getConfirmOverlay(container);
      const card = getConfirmCard(container);

      expect(overlay).toHaveClass("confirmOverlayEnter");
      expect(card).toHaveClass("confirmCardEnter");
      expect(overlay).not.toHaveClass("confirmOverlayExit");
      expect(card).not.toHaveClass("confirmCardExit");
    });
  });

  describe("exit animation and deferred unmount", () => {
    it("keeps the overlay and card in the DOM with exit classes when isOpen goes false", () => {
      // SPEC: modal-animation spec, scenario "Node is retained during the exit
      // animation".
      const { container, rerender } = render(<ConfirmModal {...baseProps} />);

      rerender(<ConfirmModal {...baseProps} isOpen={false} />);

      const overlay = getConfirmOverlay(container);
      const card = getConfirmCard(container);

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(overlay).toHaveClass("confirmOverlayExit");
      expect(card).toHaveClass("confirmCardExit");
      expect(overlay).not.toHaveClass("confirmOverlayEnter");
      expect(card).not.toHaveClass("confirmCardEnter");
    });

    it("removes the modal from the DOM after animationend fires on the overlay", () => {
      // SPEC: modal-animation spec, scenarios "Node is removed after the exit
      // animation completes" and "Unmount is driven by the animation
      // completing, not by a duplicated duration constant".
      const { container, rerender } = render(<ConfirmModal {...baseProps} />);

      rerender(<ConfirmModal {...baseProps} isOpen={false} />);

      fireEvent.animationEnd(getConfirmOverlay(container));

      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("does NOT remove the modal when the enter animation completes while open", () => {
      // SPEC: modal-animation spec, scenario "The enter animation does not
      // trigger an unmount" — the enter animation fires animationend on the
      // very same overlay node ~200ms after opening.
      const { container } = render(<ConfirmModal {...baseProps} />);

      fireEvent.animationEnd(getConfirmOverlay(container));

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("does NOT remove the modal when a descendant's animationend bubbles to the overlay", () => {
      // SPEC: modal-animation spec, scenario "A descendant's animation does not
      // trigger an unmount".
      const { container, rerender } = render(<ConfirmModal {...baseProps} />);

      rerender(<ConfirmModal {...baseProps} isOpen={false} />);

      // Dispatched on the card, so it reaches the overlay handler with
      // target !== currentTarget.
      fireEvent.animationEnd(getConfirmCard(container));

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(getConfirmOverlay(container)).toHaveClass("confirmOverlayExit");
    });
  });

  describe("every close path animates", () => {
    it("Escape key: begins the exit animation instead of removing the modal", () => {
      // SPEC: modal-animation spec, scenario "Escape key close animates";
      // confirm-modal spec, scenario "Escape key dismisses the modal".
      const onCancelSpy = vi.fn();
      const { container } = render(<ConfirmHarness onCancelSpy={onCancelSpy} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onCancelSpy).toHaveBeenCalledTimes(1);
      expect(getConfirmOverlay(container)).toHaveClass("confirmOverlayExit");
      expect(getConfirmCard(container)).toHaveClass("confirmCardExit");
    });

    it("overlay backdrop click: begins the exit animation instead of removing the modal", () => {
      // SPEC: confirm-modal spec, scenario "Overlay click dismisses".
      const onCancelSpy = vi.fn();
      const { container } = render(<ConfirmHarness onCancelSpy={onCancelSpy} />);

      fireEvent.click(getConfirmOverlay(container));

      expect(onCancelSpy).toHaveBeenCalledTimes(1);
      expect(getConfirmOverlay(container)).toHaveClass("confirmOverlayExit");
      expect(getConfirmCard(container)).toHaveClass("confirmCardExit");
    });

    it("Cancel button: begins the exit animation instead of removing the modal", () => {
      // SPEC: confirm-modal spec, scenario "Cancel button click".
      const onCancelSpy = vi.fn();
      const { container } = render(<ConfirmHarness onCancelSpy={onCancelSpy} />);

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onCancelSpy).toHaveBeenCalledTimes(1);
      expect(getConfirmOverlay(container)).toHaveClass("confirmOverlayExit");
      expect(getConfirmCard(container)).toHaveClass("confirmCardExit");
    });

    it("Confirm button: applies the destructive action immediately and then animates out", () => {
      // SPEC: confirm-modal spec, requirement "ConfirmModal confirm triggers
      // deletion" — "The delete action SHALL be applied immediately, without
      // waiting for the exit animation", which is why the spy is asserted
      // before the exit classes.
      const onConfirmSpy = vi.fn();
      const { container } = render(
        <ConfirmHarness onConfirmSpy={onConfirmSpy} />
      );

      fireEvent.click(screen.getByRole("button", { name: "Delete" }));

      expect(onConfirmSpy).toHaveBeenCalledTimes(1);
      expect(getConfirmOverlay(container)).toHaveClass("confirmOverlayExit");
      expect(getConfirmCard(container)).toHaveClass("confirmCardExit");
    });
  });

  describe("the exiting modal is inert", () => {
    it("ignores Escape and overlay clicks while the exit animation is playing", () => {
      // SPEC: confirm-modal spec, scenarios "The exiting modal ignores keyboard
      // input" and "Overlay click during the exit animation has no effect".
      //
      // NOTE: the companion guarantee that a swallowed overlay click does not
      // reach the page underneath rests on the overlay KEEPING pointer-events
      // (design.md decision 6). jsdom performs no hit testing, so that half is
      // not assertable here.
      const onCancel = vi.fn();
      const { container, rerender } = render(
        <ConfirmModal {...baseProps} onCancel={onCancel} />
      );

      rerender(
        <ConfirmModal {...baseProps} isOpen={false} onCancel={onCancel} />
      );

      const overlay = getConfirmOverlay(container);
      expect(overlay).toHaveClass("confirmOverlayExit");

      fireEvent.keyDown(document, { key: "Escape" });
      fireEvent.click(overlay);

      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe("focus restoration timing", () => {
    it("restores focus to the previously focused element when the exit BEGINS", () => {
      // SPEC: confirm-modal spec, scenario "Focus is restored when the exit
      // begins" — restoration must not wait for the animation to complete
      // (design.md decision 6), because a moving focus ring does not visually
      // compete with a fade.
      const trigger = appendToBody(document.createElement("button"));
      trigger.textContent = "Open";
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      const { container, rerender } = render(
        <ConfirmModal {...baseProps} isOpen={false} />
      );

      rerender(<ConfirmModal {...baseProps} isOpen />);
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Cancel" })
      );

      rerender(<ConfirmModal {...baseProps} isOpen={false} />);

      // Still mid-exit — the node has not been removed yet...
      expect(getConfirmOverlay(container)).toHaveClass("confirmOverlayExit");
      // ...but focus is already back on the trigger.
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe("body scroll lock timing", () => {
    it("locks body scroll while open", () => {
      // SPEC: confirm-modal spec, scenario "Body scroll is locked".
      render(<ConfirmModal {...baseProps} />);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("still holds the lock during the exit animation", () => {
      // SPEC: confirm-modal spec, scenario "Body scroll lock is held through
      // the exit animation"; modal-animation spec, scenario "Lock is held for
      // the whole exit animation".
      const { rerender } = render(<ConfirmModal {...baseProps} />);

      rerender(<ConfirmModal {...baseProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("releases the lock only once the node has actually been removed", () => {
      const { container, rerender } = render(<ConfirmModal {...baseProps} />);

      rerender(<ConfirmModal {...baseProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("hidden");

      fireEvent.animationEnd(getConfirmOverlay(container));

      expect(container).toBeEmptyDOMElement();
      expect(document.body.style.overflow).toBe("");
    });

    it("leaves the lock in place when it unmounts while another aria-modal node is still present", () => {
      // SPEC: confirm-modal spec, scenario "Scroll lock handoff to a
      // still-exiting sibling modal". The stand-in sibling below is a bare
      // [aria-modal="true"] node, which is exactly what the existing release
      // guard (ConfirmModal/index.tsx:73) queries for; the AddEventModal +
      // ConfirmModal pairing is covered in
      // src/pages/Calendar/__tests__/AddEventModal.test.tsx.
      const sibling = appendToBody(document.createElement("div"));
      sibling.setAttribute("aria-modal", "true");

      const { container, rerender } = render(<ConfirmModal {...baseProps} />);
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<ConfirmModal {...baseProps} isOpen={false} />);
      fireEvent.animationEnd(getConfirmOverlay(container));

      expect(container).toBeEmptyDOMElement();
      expect(document.body.style.overflow).toBe("hidden");
    });
  });
});
