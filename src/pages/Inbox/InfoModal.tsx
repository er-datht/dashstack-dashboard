import { useState, useEffect, useRef } from "react";
import { Star, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import { cn } from "../../utils/cn";

export type InfoModalData = {
  senderName: string;
  subject: string;
  labelName: string;
  labelColor: string;
  time: string;
  isStarred: boolean;
  folder: string;
};

type InfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: InfoModalData[];
};

export default function InfoModal({
  isOpen,
  onClose,
  items,
}: InfoModalProps): React.JSX.Element | null {
  const { t } = useTranslation("inbox");
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when items change
  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  // Escape key listener and body scroll lock
  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab") {
        e.preventDefault();
        closeBtnRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, items, onClose]);

  // Focus close button on mount
  useEffect(() => {
    if (isOpen && items.length > 0 && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [isOpen, items]);

  if (!isOpen || items.length === 0) return null;

  const data = items[currentIndex];
  const closeText = t("info.close");
  const hasMultiple = items.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Card */}
      <div
        className={cn(
          "relative w-full max-w-[400px] mx-4 p-6 rounded-xl shadow-lg",
          "bg-usermenu-bg border border-usermenu-border text-usermenu-text"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title + Close icon */}
        <div className="flex items-center justify-between">
          <h2
            id="info-modal-title"
            className="text-lg font-semibold text-primary"
          >
            {t("info.title")}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            aria-label={closeText}
            onClick={onClose}
            className="p-1 text-secondary hover:text-primary hover:bg-surface-secondary rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation: counter + prev/next */}
        {hasMultiple && (
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-secondary">
              {t("info.selectedCount", {
                current: currentIndex + 1,
                count: items.length,
              })}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={t("info.previous")}
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
                className={cn(
                  "p-0.5 rounded transition-colors",
                  currentIndex === 0
                    ? "text-secondary/30 cursor-default"
                    : "text-secondary hover:text-primary hover:bg-surface-secondary cursor-pointer"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label={t("info.next")}
                disabled={currentIndex === items.length - 1}
                onClick={() => setCurrentIndex((i) => i + 1)}
                className={cn(
                  "p-0.5 rounded transition-colors",
                  currentIndex === items.length - 1
                    ? "text-secondary/30 cursor-default"
                    : "text-secondary hover:text-primary hover:bg-surface-secondary cursor-pointer"
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Metadata fields */}
        <div className="mt-4 flex flex-col gap-3">
          {/* Sender */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">{t("info.sender")}</span>
            <span className="text-sm font-medium text-primary">
              {data.senderName}
            </span>
          </div>

          {/* Subject */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">{t("info.subject")}</span>
            <span
              className="text-sm font-medium text-primary truncate max-w-[220px]"
              data-tooltip-id="info-modal-tooltip"
              data-tooltip-content={data.subject}
            >
              {data.subject}
            </span>
          </div>

          {/* Label */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">{t("info.label")}</span>
            {data.labelName ? (
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${data.labelColor}20`,
                  color: data.labelColor,
                }}
              >
                {data.labelName}
              </span>
            ) : (
              <span className="text-sm text-secondary">-</span>
            )}
          </div>

          {/* Date & Time */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">{t("info.dateTime")}</span>
            <span className="text-sm font-medium text-primary">
              {data.time}
            </span>
          </div>

          {/* Starred */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">{t("info.starred")}</span>
            <Star
              className={cn(
                "w-4 h-4",
                data.isStarred ? "text-warning" : "text-secondary"
              )}
              fill={data.isStarred ? "currentColor" : "none"}
            />
          </div>

          {/* Folder */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">{t("info.folder")}</span>
            <span className="text-sm font-medium text-primary">
              {data.folder}
            </span>
          </div>
        </div>

        <Tooltip id="info-modal-tooltip" place="top" />
      </div>
    </div>
  );
}
