import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "../index";

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
