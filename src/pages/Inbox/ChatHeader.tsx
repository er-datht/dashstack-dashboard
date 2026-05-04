import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ShieldCheck, Archive, Info, Trash2, Tag, Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import { cn } from "../../utils/cn";
import type { InboxLabel } from "./mockData";

type ChatHeaderProps = {
  contactName: string;
  activeLabel: string;
  labels: InboxLabel[];
  onLabelChange: (labelId: string) => void;
  onShowToast: (message: string) => void;
  onBack: () => void;
  onArchive?: () => void;
  onNotSpam?: () => void;
  isImportant?: boolean;
  onToggleImportant?: () => void;
  onShowInfo?: () => void;
};

export default function ChatHeader({
  contactName,
  activeLabel,
  labels,
  onLabelChange,
  onShowToast,
  onBack,
  onArchive,
  onNotSpam,
  isImportant,
  onToggleImportant,
  onShowInfo,
}: ChatHeaderProps): React.JSX.Element {
  const { t } = useTranslation("inbox");
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLabel = labels.find((l) => l.id === activeLabel);

  // Click-outside to close dropdown
  useEffect(() => {
    if (!isLabelOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsLabelOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLabelOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLabelOpen]);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-default">
      {/* Left: Back + Name + Label Badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t("chat.back", "Back")}
          onClick={onBack}
          className="text-secondary hover:text-primary transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-primary">
          {contactName}
        </span>

        {/* Label Badge with Dropdown */}
        <div className="relative flex items-center" ref={dropdownRef}>
          {currentLabel ? (
            <button
              type="button"
              onClick={() => setIsLabelOpen(!isLabelOpen)}
              className="px-2.5 py-0.5 rounded text-xs font-medium cursor-pointer transition-opacity hover:opacity-80"
              style={{
                backgroundColor: `${currentLabel.color}20`,
                color: currentLabel.color,
              }}
            >
              {t(currentLabel.nameKey)}
            </button>
          ) : (
            <button
              type="button"
              aria-label={t("list.addLabel")}
              onClick={() => setIsLabelOpen(!isLabelOpen)}
              className="text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              <Tag className="w-4 h-4" />
            </button>
          )}

          {isLabelOpen && (
            <div className="absolute top-full left-0 mt-1 w-40 py-1 rounded-lg shadow-lg bg-usermenu-bg border border-usermenu-border z-50 animate-usermenu-enter">
              {labels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => {
                    onLabelChange(label.id);
                    setIsLabelOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left",
                    "hover:bg-usermenu-hover transition-colors cursor-pointer",
                    activeLabel === label.id
                      ? "text-usermenu-text font-medium"
                      : "text-usermenu-text"
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{
                      border: `1.2px solid ${label.color}`,
                      backgroundColor:
                        activeLabel === label.id
                          ? `${label.color}30`
                          : "transparent",
                    }}
                  />
                  {t(label.nameKey)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center border border-default rounded-lg overflow-hidden">
        {(() => {
          const importantButton = onToggleImportant
            ? {
                Icon: Bookmark,
                label: isImportant
                  ? t("chat.unmarkImportant")
                  : t("chat.markImportant"),
                key: "important" as const,
                filled: !!isImportant,
              }
            : null;
          const buttons = [
            ...(onNotSpam
              ? [{ Icon: ShieldCheck, label: t("list.notSpam"), key: "notSpam" as const }]
              : []),
            { Icon: Archive, label: t("list.archive", "Archive"), key: "archive" as const },
            ...(importantButton ? [importantButton] : []),
            { Icon: Info, label: t("chat.info", "Info"), key: "info" as const },
            { Icon: Trash2, label: t("chat.delete", "Delete"), key: "delete" as const },
          ];
          return buttons.map((btn, index) => {
            const { Icon, label, key } = btn;
            const filled = "filled" in btn && btn.filled;
            return (
              <button
                key={key}
                type="button"
                aria-label={label}
                data-tooltip-id="chat-header-tooltip"
                data-tooltip-content={label}
                onClick={() => {
                  if (key === "notSpam" && onNotSpam) {
                    onNotSpam();
                    return;
                  }
                  if (key === "archive" && onArchive) {
                    onArchive();
                    return;
                  }
                  if (key === "important" && onToggleImportant) {
                    onToggleImportant();
                    return;
                  }
                  if (key === "info" && onShowInfo) {
                    onShowInfo();
                    return;
                  }
                  onShowToast(t("chat.comingSoon"));
                }}
                className={cn(
                  "p-2 transition-colors cursor-pointer hover:bg-surface-secondary",
                  key === "important" && filled
                    ? "text-[var(--color-primary)]"
                    : "text-secondary hover:text-primary",
                  index < buttons.length - 1 && "border-r border-default"
                )}
              >
                <Icon
                  className="w-4 h-4"
                  fill={filled ? "currentColor" : "none"}
                />
              </button>
            );
          });
        })()}
      </div>

      <Tooltip id="chat-header-tooltip" place="top" />
    </div>
  );
}
