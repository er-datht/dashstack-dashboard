import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AddEventModal from "../AddEventModal";
import ConfirmModal from "../../../components/ConfirmModal";
import type { CalendarEvent } from "../../../types/calendar";

/**
 * Tests for src/pages/Calendar/AddEventModal.tsx — show/hide animation and
 * DEFERRED UNMOUNT behavior. This file is new: AddEventModal had no test
 * coverage before this change.
 *
 * SPEC: Behavior derived from
 *   openspec/changes/modal-show-hide-animation/specs/modal-animation/spec.md
 *   openspec/changes/modal-show-hide-animation/specs/calendar-add-event/spec.md
 *   openspec/changes/modal-show-hide-animation/design.md (decisions 2, 5, 6, 7, 10)
 *
 * ── WHY THESE TESTS DISPATCH animationend BY HAND ──────────────────────
 * jsdom does NOT run CSS animations, so `animationend` NEVER fires on its own.
 * The exit animation therefore can only be completed in a test by dispatching
 * the event explicitly with `fireEvent.animationEnd(overlay)`. Where a test
 * asserts that the modal is STILL in the DOM, that is the deferred unmount
 * working as specified — not a missing `await`, and not a broken assertion.
 *
 * The overlay (`.modalOverlay`) is the node that carries `onAnimationEnd`
 * (design.md decision 10), so it is also the node the event is dispatched on.
 *
 * SPEC: vitest.config.ts sets CSS modules `classNameStrategy: 'non-scoped'`,
 * so the SCSS identifiers below (`modalOverlay`, `modalOverlayEnter`,
 * `modalCardExit`, ...) appear verbatim in the rendered markup and are
 * directly assertable.
 *
 * react-i18next is globally mocked in src/test/setup.ts to return translation
 * KEYS as-is, so assertions read "modal.editTitle" / "modal.cancel" rather
 * than English prose.
 *
 *   Coverage:
 *   - first render with isOpen=false renders nothing at all
 *   - enter classes on the overlay and card when open
 *   - node retained + exit classes applied when isOpen goes true -> false
 *   - removal only after animationend on the overlay
 *   - all four close paths animate: Escape, overlay click, Cancel, Save
 *   - retained edit context: the heading does not flip "Edit" -> "Add New"
 *     and Delete does not vanish mid-fade when the parent clears editEvent
 *   - in-progress form values stay visible through the exit
 *   - the exiting modal is inert (Escape / overlay click do nothing)
 *   - body scroll lock is held through the exit and released only on unmount,
 *     with the [aria-modal="true"] handoff guard
 *
 *   Until opsx:apply wires in useModalTransition, the animation-class and
 *   deferred-unmount assertions fail. That is the intended TDD failure.
 */

const noop = () => {};

const baseProps = {
  isOpen: true,
  onClose: noop,
  onSave: noop,
};

const editEventFixture: CalendarEvent = {
  id: "evt-1",
  title: "Team Sync",
  startDate: new Date(2026, 3, 20, 9, 0),
  endDate: new Date(2026, 3, 20, 10, 0),
  allDay: false,
  location: "Room A",
  organizer: "Dat",
  color: { border: "#2563eb", bg: "#dbeafe", text: "#1e3a8a" },
  participants: [],
};

// --- Helpers --------------------------------------------------------------

function getOverlay(container: HTMLElement): HTMLElement {
  const overlay = container.querySelector(".modalOverlay");
  expect(overlay).not.toBeNull();
  return overlay as HTMLElement;
}

function getCard(container: HTMLElement): HTMLElement {
  const card = container.querySelector(".modalCard");
  expect(card).not.toBeNull();
  return card as HTMLElement;
}

function getTitleInput(): HTMLInputElement {
  // The label text is `${t("modal.eventTitle")} *`, hence the regex.
  return screen.getByLabelText(/modal\.eventTitle/) as HTMLInputElement;
}

/**
 * Mirrors src/pages/Calendar/index.tsx: every close path there
 * (handleCloseModal:161, handleSaveEvent:249, handleDeleteEvent:255) clears
 * `editingEvent` in the SAME update as `isModalOpen`. Reproducing that here is
 * what makes the retained-edit-context requirement observable.
 */
function CalendarHarness({
  editEvent,
  onCloseSpy,
  onSaveSpy,
  onDeleteSpy,
}: {
  editEvent?: CalendarEvent;
  onCloseSpy?: () => void;
  onSaveSpy?: () => void;
  onDeleteSpy?: (id: string) => void;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(true);
  const [editing, setEditing] = useState<CalendarEvent | undefined>(editEvent);

  const close = () => {
    setIsOpen(false);
    setEditing(undefined);
  };

  return (
    <AddEventModal
      isOpen={isOpen}
      onClose={() => {
        onCloseSpy?.();
        close();
      }}
      onSave={() => {
        onSaveSpy?.();
        close();
      }}
      onDelete={(id) => {
        onDeleteSpy?.(id);
        close();
      }}
      editEvent={editing}
    />
  );
}

/**
 * Mirrors the sibling layout in src/pages/Calendar/index.tsx:320 (AddEventModal)
 * and :342 (ConfirmModal) — both are always mounted and driven purely by their
 * `isOpen` prop, which is what lets two modals be mid-exit at the same time.
 */
function StackedHarness({
  addOpen,
  confirmOpen,
}: {
  addOpen: boolean;
  confirmOpen: boolean;
}): React.JSX.Element {
  return (
    <>
      <AddEventModal isOpen={addOpen} onClose={noop} onSave={noop} />
      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete event?"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={noop}
        onCancel={noop}
      />
    </>
  );
}

describe("AddEventModal show/hide animation", () => {
  beforeEach(() => {
    // The scroll-lock assertions read a global, so start every test from a
    // known state.
    document.body.style.overflow = "";
  });

  describe("closed on first render", () => {
    it("renders nothing at all when isOpen is false on the very first render", () => {
      // SPEC: modal-animation spec, scenario "A modal never opened renders
      // nothing". The hook's initial phase is derived from isOpen, so the
      // deferred unmount only ever engages on a genuine true -> false flip.
      const { container } = render(
        <AddEventModal {...baseProps} isOpen={false} />
      );

      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("enter animation", () => {
    it("applies the enter classes to the overlay and the card when open", () => {
      // SPEC: modal-animation spec, scenarios "Overlay and card animate in on
      // open" and "Enter animation is present on the first painted frame" —
      // the class must be in the same commit that inserts the node, which is
      // why the hook derives its phase during render rather than in an effect.
      const { container } = render(<AddEventModal {...baseProps} />);

      const overlay = getOverlay(container);
      const card = getCard(container);

      expect(overlay).toHaveClass("modalOverlayEnter");
      expect(card).toHaveClass("modalCardEnter");
      expect(overlay).not.toHaveClass("modalOverlayExit");
      expect(card).not.toHaveClass("modalCardExit");
    });
  });

  describe("exit animation and deferred unmount", () => {
    it("keeps the overlay and card in the DOM with exit classes when isOpen goes false", () => {
      // SPEC: modal-animation spec, scenario "Node is retained during the exit
      // animation".
      const { container, rerender } = render(<AddEventModal {...baseProps} />);

      rerender(<AddEventModal {...baseProps} isOpen={false} />);

      const overlay = getOverlay(container);
      const card = getCard(container);

      expect(overlay).toBeInTheDocument();
      expect(card).toBeInTheDocument();
      expect(overlay).toHaveClass("modalOverlayExit");
      expect(card).toHaveClass("modalCardExit");
      expect(overlay).not.toHaveClass("modalOverlayEnter");
      expect(card).not.toHaveClass("modalCardEnter");
    });

    it("removes the modal from the DOM after animationend fires on the overlay", () => {
      // SPEC: modal-animation spec, scenarios "Node is removed after the exit
      // animation completes" and "Unmount is driven by the animation
      // completing, not by a duplicated duration constant".
      const { container, rerender } = render(<AddEventModal {...baseProps} />);

      rerender(<AddEventModal {...baseProps} isOpen={false} />);
      const overlay = getOverlay(container);

      fireEvent.animationEnd(overlay);

      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does NOT remove the modal when the enter animation completes while open", () => {
      // SPEC: modal-animation spec, scenario "The enter animation does not
      // trigger an unmount" — the enter animation fires animationend on the
      // same overlay node ~200ms after opening.
      const { container } = render(<AddEventModal {...baseProps} />);

      fireEvent.animationEnd(getOverlay(container));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("does NOT remove the modal when a descendant's animationend bubbles to the overlay", () => {
      // SPEC: modal-animation spec, scenario "A descendant's animation does not
      // trigger an unmount". animationend bubbles, so the handler must check
      // e.target === e.currentTarget.
      const { container, rerender } = render(<AddEventModal {...baseProps} />);

      rerender(<AddEventModal {...baseProps} isOpen={false} />);

      // Dispatch on the card: it bubbles up to the overlay handler with
      // target !== currentTarget.
      fireEvent.animationEnd(getCard(container));

      expect(getOverlay(container)).toBeInTheDocument();
      expect(getOverlay(container)).toHaveClass("modalOverlayExit");
    });
  });

  describe("every close path animates", () => {
    it("Escape key: begins the exit animation instead of removing the modal", () => {
      // SPEC: modal-animation spec, scenario "Escape key close animates".
      const onCloseSpy = vi.fn();
      const { container } = render(
        <CalendarHarness onCloseSpy={onCloseSpy} />
      );

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onCloseSpy).toHaveBeenCalledTimes(1);
      expect(getOverlay(container)).toHaveClass("modalOverlayExit");
      expect(getCard(container)).toHaveClass("modalCardExit");
    });

    it("overlay backdrop click: begins the exit animation instead of removing the modal", () => {
      // SPEC: modal-animation spec, scenario "Overlay click close animates".
      const onCloseSpy = vi.fn();
      const { container } = render(
        <CalendarHarness onCloseSpy={onCloseSpy} />
      );

      fireEvent.click(getOverlay(container));

      expect(onCloseSpy).toHaveBeenCalledTimes(1);
      expect(getOverlay(container)).toHaveClass("modalOverlayExit");
      expect(getCard(container)).toHaveClass("modalCardExit");
    });

    it("Cancel button: begins the exit animation instead of removing the modal", () => {
      // SPEC: modal-animation spec, scenario "Cancel button close animates".
      const onCloseSpy = vi.fn();
      const { container } = render(
        <CalendarHarness onCloseSpy={onCloseSpy} />
      );

      fireEvent.click(screen.getByRole("button", { name: "modal.cancel" }));

      expect(onCloseSpy).toHaveBeenCalledTimes(1);
      expect(getOverlay(container)).toHaveClass("modalOverlayExit");
      expect(getCard(container)).toHaveClass("modalCardExit");
    });

    it("successful Save: applies the save immediately and then animates out", () => {
      // SPEC: modal-animation spec, scenario "Successful submit close animates"
      // — "the underlying data change SHALL be applied without waiting for the
      // animation to finish", which is why onSave is asserted first.
      const onSaveSpy = vi.fn();
      const { container } = render(<CalendarHarness onSaveSpy={onSaveSpy} />);

      // Validation blocks submit on an empty title, so fill it first.
      fireEvent.change(getTitleInput(), { target: { value: "Launch review" } });
      fireEvent.click(screen.getByRole("button", { name: "modal.save" }));

      expect(onSaveSpy).toHaveBeenCalledTimes(1);
      expect(getOverlay(container)).toHaveClass("modalOverlayExit");
      expect(getCard(container)).toHaveClass("modalCardExit");
    });
  });

  describe("retained content through the exit", () => {
    it("keeps the edit heading and the Delete button when the parent clears editEvent in the same update", () => {
      // SPEC: calendar-add-event spec, scenarios "The modal title does not
      // change mid-exit" and "The Delete button does not disappear mid-exit".
      //
      // Calendar/index.tsx clears editingEvent in the SAME update as
      // isModalOpen, so during the exit `editEvent` is already undefined. The
      // modal must render its edit-specific content from a snapshot taken
      // while it was open (design.md decision 7).
      const onDelete = vi.fn();
      const { container, rerender } = render(
        <AddEventModal
          {...baseProps}
          editEvent={editEventFixture}
          onDelete={onDelete}
        />
      );

      expect(screen.getByText("modal.editTitle")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "modal.delete" })
      ).toBeInTheDocument();

      rerender(
        <AddEventModal
          {...baseProps}
          isOpen={false}
          editEvent={undefined}
          onDelete={onDelete}
        />
      );

      // Still exiting, so still on screen...
      expect(getOverlay(container)).toHaveClass("modalOverlayExit");
      // ...and still looking exactly as the user left it.
      expect(screen.getByText("modal.editTitle")).toBeInTheDocument();
      expect(screen.queryByText("modal.title")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "modal.delete" })
      ).toBeInTheDocument();
    });

    it("keeps the edit heading and Delete button when closed from edit mode via Cancel", () => {
      // Same guarantee, driven through a real user interaction rather than a
      // prop rerender.
      const { container } = render(
        <CalendarHarness editEvent={editEventFixture} />
      );

      fireEvent.click(screen.getByRole("button", { name: "modal.cancel" }));

      expect(getOverlay(container)).toHaveClass("modalOverlayExit");
      expect(screen.getByText("modal.editTitle")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "modal.delete" })
      ).toBeInTheDocument();
    });

    it("keeps in-progress form values visible while exiting", () => {
      // SPEC: calendar-add-event spec, scenarios "Filled-in form values fade
      // out as entered" and "Form state is not reset while exiting".
      const { container } = render(<CalendarHarness />);

      fireEvent.change(getTitleInput(), { target: { value: "Draft title" } });
      expect(getTitleInput()).toHaveValue("Draft title");

      fireEvent.click(screen.getByRole("button", { name: "modal.cancel" }));

      expect(getOverlay(container)).toHaveClass("modalOverlayExit");
      expect(getTitleInput()).toHaveValue("Draft title");
    });
  });

  describe("the exiting modal is inert", () => {
    it("ignores Escape and overlay clicks while the exit animation is playing", () => {
      // SPEC: modal-animation spec, requirement "An exiting modal is inert".
      //
      // NOTE: the companion guarantee that a swallowed overlay click does not
      // reach the page underneath rests on the overlay KEEPING pointer-events
      // (design.md decision 6). jsdom performs no hit testing, so that half is
      // not assertable here and is covered by manual verification (task 6.3).
      const onClose = vi.fn();
      const { container, rerender } = render(
        <AddEventModal {...baseProps} onClose={onClose} />
      );

      rerender(
        <AddEventModal {...baseProps} isOpen={false} onClose={onClose} />
      );

      const overlay = getOverlay(container);
      expect(overlay).toHaveClass("modalOverlayExit");

      fireEvent.keyDown(document, { key: "Escape" });
      fireEvent.click(overlay);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("body scroll lock timing", () => {
    it("locks body scroll while open", () => {
      // SPEC: modal-animation spec, requirement "Body scroll lock is released
      // on unmount, not on close" (pre-existing half of the contract).
      render(<AddEventModal {...baseProps} />);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("still holds the lock during the exit animation", () => {
      // SPEC: modal-animation spec, scenario "Lock is held for the whole exit
      // animation" — releasing at exit START lets the scrollbar reappear,
      // changes the page width, and visibly shoves the animating card
      // sideways.
      const { rerender } = render(<AddEventModal {...baseProps} />);

      rerender(<AddEventModal {...baseProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("releases the lock only once the node has actually been removed", () => {
      const { container, rerender } = render(<AddEventModal {...baseProps} />);

      rerender(<AddEventModal {...baseProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("hidden");

      fireEvent.animationEnd(getOverlay(container));

      expect(container).toBeEmptyDOMElement();
      expect(document.body.style.overflow).toBe("");
    });

    it("leaves the lock in place when it unmounts while another aria-modal node is still exiting", () => {
      // SPEC: modal-animation spec, scenario "A modal does not unlock
      // scrolling while another modal is still present"; confirm-modal spec,
      // scenario "Stacked exits do not release the scroll lock early".
      //
      // AddEventModal currently releases document.body.style.overflow
      // UNCONDITIONALLY (AddEventModal.tsx:163) — safe only because it used to
      // unmount instantly. With deferred unmount it must adopt ConfirmModal's
      // [aria-modal="true"] handoff guard (design.md decision 5).
      const { container, rerender } = render(
        <StackedHarness addOpen confirmOpen />
      );

      expect(document.body.style.overflow).toBe("hidden");

      // Both close in the same update, as a Delete-confirm does.
      rerender(<StackedHarness addOpen={false} confirmOpen={false} />);
      expect(document.body.style.overflow).toBe("hidden");

      // AddEventModal finishes first and unmounts, while ConfirmModal is still
      // mid-exit and still carries aria-modal="true".
      fireEvent.animationEnd(getOverlay(container));

      expect(container.querySelector(".modalOverlay")).toBeNull();
      expect(container.querySelector(".confirmOverlay")).not.toBeNull();
      expect(document.body.style.overflow).toBe("hidden");

      // Only when the last modal leaves the DOM is the lock released.
      fireEvent.animationEnd(
        container.querySelector(".confirmOverlay") as HTMLElement
      );

      expect(container).toBeEmptyDOMElement();
      expect(document.body.style.overflow).toBe("");
    });
  });
});
