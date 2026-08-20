import { useEffect, useId, useRef } from "react";
import { cn } from "../../utils/cn";
import { useModalTransition } from "../../hooks/useModalTransition";
import styles from "./ConfirmModal.module.scss";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps): React.JSX.Element | null {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(onCancel);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const instanceId = useId();

  onCancelRef.current = onCancel;

  // Show/hide animation. `isRendered` stays true for the duration of the exit
  // animation, so the modal is NOT unmounted the moment `isOpen` flips.
  const { isRendered, isExiting, handleAnimationEnd } = useModalTransition(isOpen);

  // The keydown listener is installed once per open, so it reads the exiting
  // state through a ref rather than closing over it.
  const isExitingRef = useRef(false);
  isExitingRef.current = isExiting;

  // Focus trap, Escape key, and body scroll lock.
  //
  // Gated on `isRendered`, NOT on `isOpen`: keying it on the prop would run the
  // cleanup at exit START, releasing the body scroll lock while the modal is
  // still animating and letting the scrollbar reappear mid-fade.
  useEffect(() => {
    if (!isRendered) return;

    // Captured at setup so the cleanup can exclude this modal's own node from
    // the handoff check below without depending on when React detaches the ref.
    const ownDialog = dialogRef.current;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    // Focus the cancel button on open
    cancelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      // An exiting modal is inert. Note it deliberately does NOT stop
      // propagation here, so it does not swallow keys while fading out.
      if (isExitingRef.current) return;

      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onCancelRef.current();
        return;
      }

      if (e.key === "Tab") {
        const buttons = [cancelRef.current, confirmRef.current].filter(
          Boolean
        ) as HTMLElement[];
        if (buttons.length === 0) return;

        const first = buttons[0];
        const last = buttons[buttons.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Only restore scroll if no other modal is still open. Excluding this
      // modal's own node makes the check independent of whether React has
      // already detached it — a stacked modal that is still exiting keeps the
      // lock in place, so the page cannot shift while it animates.
      const otherModals = Array.from(
        document.querySelectorAll('[aria-modal="true"]')
      ).filter((node) => node !== ownDialog);

      if (otherModals.length === 0) {
        document.body.style.overflow = "";
      }
    };
  }, [isRendered]);

  // Restore focus at the START of the exit rather than on unmount, so keyboard
  // focus comes back immediately instead of 150ms later. A moving focus ring
  // does not visually compete with a fade.
  useEffect(() => {
    if (!isExiting) return;
    previousFocusRef.current?.focus();
  }, [isExiting]);

  if (!isRendered) {
    return null;
  }

  const titleId = `${instanceId}-title`;
  const descId = `${instanceId}-desc`;

  const handleOverlayClick = (e: React.MouseEvent) => {
    // An exiting modal is inert. The overlay keeps its pointer-events on
    // purpose: `pointer-events: none` would let the click fall THROUGH the
    // fading backdrop onto whatever page control sits underneath.
    if (isExiting) return;

    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className={cn(
        styles.confirmOverlay,
        isExiting ? styles.confirmOverlayExit : styles.confirmOverlayEnter
      )}
      onClick={handleOverlayClick}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        ref={dialogRef}
        className={cn(
          "card",
          styles.confirmCard,
          isExiting ? styles.confirmCardExit : styles.confirmCardEnter
        )}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <h2
          id={titleId}
          className="font-bold text-lg text-primary"
        >
          {title}
        </h2>
        <p
          id={descId}
          className="text-sm text-secondary"
        >
          {message}
        </p>
        <div className="flex justify-center gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className={cn(
              "bg-surface-muted text-primary",
              "rounded-lg h-10 px-6",
              "font-semibold",
              "cursor-pointer border-none",
              "hover:opacity-80 transition-opacity"
            )}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-lg h-10 px-6",
              "font-semibold",
              "cursor-pointer border-none",
              "hover:opacity-80 transition-opacity"
            )}
            style={{
              backgroundColor: "var(--color-error-500)",
              color: "#ffffff",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
