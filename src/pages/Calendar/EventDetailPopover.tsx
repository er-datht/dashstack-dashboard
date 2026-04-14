import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "../../utils/cn";
import type { CalendarEvent } from "../../types/calendar";
import { getInitials, EXTRA_PARTICIPANTS_THRESHOLD } from "./calendarUtils";
import styles from "./Calendar.module.scss";

type EventDetailPopoverProps = {
  event: CalendarEvent;
  position: { top: number; left: number };
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
};

const VIEWPORT_EDGE_MARGIN = 12;

const LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  jp: "ja-JP",
  ko: "ko-KR",
};

function formatEventDate(date: Date, language: string): string {
  const locale = LOCALE_MAP[language] ?? "en-US";
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function EventDetailPopover({
  event,
  position,
  onClose,
  onEdit,
  onDelete,
}: EventDetailPopoverProps): React.JSX.Element {
  const { t, i18n } = useTranslation("calendar");
  const popoverRef = useRef<HTMLDivElement>(null);

  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useLayoutEffect(() => {
    if (!popoverRef.current) return;

    const rect = popoverRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    let { top, left } = position;

    if (rect.bottom > viewportHeight - VIEWPORT_EDGE_MARGIN) {
      top = viewportHeight - rect.height - VIEWPORT_EDGE_MARGIN;
    }
    if (top < VIEWPORT_EDGE_MARGIN) {
      top = VIEWPORT_EDGE_MARGIN;
    }
    if (rect.right > viewportWidth - VIEWPORT_EDGE_MARGIN) {
      left = viewportWidth - rect.width - VIEWPORT_EDGE_MARGIN;
    }
    if (left < VIEWPORT_EDGE_MARGIN) {
      left = VIEWPORT_EDGE_MARGIN;
    }

    if (top !== adjustedPosition.top || left !== adjustedPosition.left) {
      setAdjustedPosition({ top, left });
    }
  }, [position.top, position.left]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const visibleParticipants = event.participants.slice(
    0,
    EXTRA_PARTICIPANTS_THRESHOLD
  );
  const hasExtra = event.participants.length > EXTRA_PARTICIPANTS_THRESHOLD;

  return (
    <div
      ref={popoverRef}
      className={styles.popoverContainer}
      style={{ top: adjustedPosition.top, left: adjustedPosition.left }}
      role="dialog"
      aria-label={event.title}
    >
      {/* Arrow pointing left */}
      <div className={styles.popoverArrow} />

      <div className={styles.popoverCard}>
        {/* Action buttons */}
        <div className={styles.popoverActions}>
          <button
            type="button"
            className={styles.popoverActionBtn}
            onClick={() => onEdit(event)}
            aria-label={t("modal.editTitle")}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={cn(
              styles.popoverActionBtn,
              styles.popoverActionBtnDanger
            )}
            onClick={() => onDelete(event.id)}
            aria-label={t("modal.delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Event image */}
        {event.image ? (
          <div className={styles.popoverImage}>
            <img
              src={event.image}
              alt={event.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "6px",
              }}
            />
          </div>
        ) : (
          <div className={styles.popoverImage} aria-hidden="true" />
        )}

        {/* Event info */}
        <div className="py-4 flex flex-col gap-2.5">
          <span className="font-bold text-base text-primary">
            {event.title}
          </span>
          <span className="font-medium text-sm text-secondary">
            {event.organizer}
          </span>
          <span
            className="font-medium text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {formatEventDate(event.startDate, i18n.language)}
          </span>
          <span
            className="font-medium text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {event.location}
          </span>
        </div>

        {/* Guests */}
        {event.participants.length > 0 && (
          <>
            <div className={styles.popoverDivider} />

            <div className="pt-4 flex flex-col gap-2.5">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {t("modal.guests")}
              </span>
              <div className="flex items-center gap-2.5">
                {visibleParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className={cn(
                      "w-6 h-6 rounded-full shrink-0",
                      "flex items-center justify-center",
                      "font-bold text-[8px]"
                    )}
                    style={{
                      backgroundColor: "var(--color-surface-secondary)",
                      color: "var(--color-text-primary)",
                    }}
                    role="img"
                    aria-label={participant.name}
                    title={participant.name}
                  >
                    {getInitials(participant.name)}
                  </div>
                ))}
                {hasExtra && (
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full shrink-0",
                      "flex items-center justify-center",
                      "text-[8px] font-bold border"
                    )}
                    style={{
                      borderColor: "var(--color-primary-600)",
                      color: "var(--color-primary-600)",
                      backgroundColor: "transparent",
                    }}
                    aria-label={`+${event.participants.length - EXTRA_PARTICIPANTS_THRESHOLD} more guests`}
                  >
                    +{event.participants.length - EXTRA_PARTICIPANTS_THRESHOLD}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
