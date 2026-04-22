import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Download, Info, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";
import type { InboxLabel } from "./mockData";

type ChatHeaderProps = {
  contactName: string;
  activeLabel: string;
  labels: InboxLabel[];
  onLabelChange: (labelId: string) => void;
  onShowToast: (message: string) => void;
  onBack: () => void;
};

export default function ChatHeader({
  contactName,
  activeLabel,
  labels,
  onLabelChange,
  onShowToast,
  onBack,
}: ChatHeaderProps): React.JSX.Element {
  const { t } = useTranslation("inbox");
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLabel = labels.find((l) => l.id === activeLabel) ?? labels[0];

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
        <div className="relative" ref={dropdownRef}>
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
        {([
          { Icon: Download, label: t("chat.download", "Download"), key: "download" },
          { Icon: Info, label: t("chat.info", "Info"), key: "info" },
          { Icon: Trash2, label: t("chat.delete", "Delete"), key: "delete" },
        ] as const).map(({ Icon, label, key }, index) => (
          <button
            key={key}
            type="button"
            aria-label={label}
            onClick={() => onShowToast(t("chat.comingSoon"))}
            className={cn(
              "p-2 text-secondary hover:text-primary hover:bg-surface-secondary",
              "transition-colors cursor-pointer",
              index < 2 && "border-r border-default"
            )}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
