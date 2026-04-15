import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";
import type { CalendarEvent } from "../../types/calendar";
import { getInitials, EXTRA_PARTICIPANTS_THRESHOLD } from "./calendarUtils";

type EventsSidebarProps = {
  events: CalendarEvent[];
  onAddEvent?: () => void;
  onEventClick?: (event: CalendarEvent) => void;
};

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
  }).format(date);
}

function EventItem({
  event,
  language,
  onEventClick,
}: {
  event: CalendarEvent;
  language: string;
  onEventClick?: (event: CalendarEvent) => void;
}): React.JSX.Element {
  const visibleParticipants = event.participants.slice(
    0,
    EXTRA_PARTICIPANTS_THRESHOLD
  );
  const hasExtra =
    event.participants.length > EXTRA_PARTICIPANTS_THRESHOLD;
  const initials = event.organizer ? getInitials(event.organizer) : "";

  return (
    <div
      className={cn(
        "flex gap-2.5 px-6 py-3",
        "border-t",
        "cursor-pointer",
        "hover:opacity-80 transition-opacity"
      )}
      style={{ borderColor: "var(--color-border)" }}
      onClick={() => onEventClick?.(event)}
    >
      {/* Organizer avatar */}
      {initials ? (
        <div
          className={cn(
            "w-12 h-12 rounded-full shrink-0",
            "flex items-center justify-center",
            "font-bold text-sm"
          )}
          style={{
            backgroundColor: event.color.bg,
            color: event.color.text,
          }}
          role="img"
          aria-label={event.organizer}
        >
          {initials}
        </div>
      ) : (
        <div
          className="w-12 h-12 rounded-full bg-surface-muted shrink-0"
          aria-hidden="true"
        />
      )}

      {/* Event details */}
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-semibold text-sm text-primary truncate">
          {event.title}
        </span>
        <span className="text-xs text-secondary opacity-60">
          {formatEventDate(event.startDate, language)}
        </span>
        <span className="text-xs text-secondary opacity-60 truncate">
          {event.location}
        </span>
        <span className="text-xs text-secondary opacity-60 truncate">
          {event.organizer}
        </span>

        {/* Participant avatars */}
        <div className="flex items-center gap-1 mt-1">
          {visibleParticipants.map((participant) => (
            <div
              key={participant.id}
              className={cn(
                "w-6 h-6 rounded-full shrink-0",
                "flex items-center justify-center",
                "font-bold text-[8px]"
              )}
              style={{
                backgroundColor: event.color.bg,
                color: event.color.text,
              }}
              title={participant.name}
              aria-label={participant.name}
            >
              {getInitials(participant.name)}
            </div>
          ))}
          {hasExtra && (
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                "text-[8px] font-bold border-2"
              )}
              style={{
                borderColor: "var(--color-primary-600)",
                color: "var(--color-primary-600)",
                backgroundColor: "transparent",
              }}
            >
              +{event.participants.length - EXTRA_PARTICIPANTS_THRESHOLD}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventsSidebar({
  events,
  onAddEvent,
  onEventClick,
}: EventsSidebarProps): React.JSX.Element {
  const { t, i18n } = useTranslation("calendar");
  const PAGE_SIZE = 4;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleEvents = events.slice(0, visibleCount);
  const hasMore = visibleCount < events.length;

  return (
    <div
      className={cn(
        "card flex flex-col items-center py-6 gap-4",
        "w-[284px] shrink-0"
      )}
    >
      {/* Add New Event button */}
      <button
        type="button"
        onClick={onAddEvent}
        className={cn(
          "bg-primary text-on-primary",
          "rounded-lg h-[43px] w-[238px]",
          "font-bold text-sm",
          "cursor-pointer",
          "hover-bg-primary-dark",
          "transition-colors"
        )}
      >
        {t("addNewEvent")}
      </button>

      {/* Section title */}
      <h2 className="font-semibold text-xl text-primary self-start px-6">
        {t("youAreGoingTo")}
      </h2>

      {/* Event list */}
      <div className="w-full flex flex-col">
        {visibleEvents.map((event) => (
          <EventItem key={event.id} event={event} language={i18n.language} onEventClick={onEventClick} />
        ))}
      </div>

      {/* See More button */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          className={cn(
            "bg-brand-light rounded-[14px]",
            "h-10 w-[120px]",
            "font-bold text-sm text-primary",
            "cursor-pointer",
            "hover:opacity-80",
            "transition-opacity"
          )}
        >
          {t("seeMore")}
        </button>
      )}
    </div>
  );
}
