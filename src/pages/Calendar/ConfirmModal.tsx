import { useEffect, useId, useRef } from "react";
import { cn } from "../../utils/cn";
import styles from "./Calendar.module.scss";

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
  const onCancelRef = useRef(onCancel);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const instanceId = useId();

  onCancelRef.current = onCancel;

  // Focus trap, Escape key, and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    // Focus the cancel button on open
    cancelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
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
      // Only restore scroll if no other modal is still open
      if (!document.querySelector('[aria-modal="true"]')) {
        document.body.style.overflow = "";
      }
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const titleId = `${instanceId}-title`;
  const descId = `${instanceId}-desc`;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className={styles.confirmOverlay} onClick={handleOverlayClick}>
      <div
        className={cn("card", styles.confirmCard)}
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
