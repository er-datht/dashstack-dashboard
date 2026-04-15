import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CalendarEvent } from "../../types/calendar";
import {
  getHourLabels,
  getEventsInTimeRange,
  calculateEventPosition,
  groupOverlappingEvents,
  isSameDay,
} from "./calendarUtils";
import styles from "./Calendar.module.scss";

type DayViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick?: (date: Date) => void;
  onEventClick?: (
    event: CalendarEvent,
    position: { top: number; left: number }
  ) => void;
};

export default function DayView({
  currentDate,
  events,
  onTimeSlotClick,
  onEventClick,
}: DayViewProps): React.JSX.Element {
  const { t } = useTranslation("calendar");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const hourLabels = getHourLabels();
  const currentDateMs = currentDate.getTime();
  const isToday = isSameDay(currentDate, new Date());

  // Filter events for the current day
  const dayStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    0,
    0,
    0,
    0
  );
  const dayEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    23,
    59,
    59,
    999
  );

  const dayEvents = getEventsInTimeRange(events, dayStart, dayEnd);

  const allDayEvents = dayEvents.filter(
    (evt) => evt.allDay === true || evt.allDay === undefined
  );
  const timedEvents = dayEvents.filter((evt) => evt.allDay === false);

  const groupedTimedEvents = groupOverlappingEvents(timedEvents);

  // Current time indicator update
  useEffect(() => {
    if (!isToday) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [isToday]);

  // Auto-scroll to current time on initial render for today
  useEffect(() => {
    if (!isToday || !scrollContainerRef.current) return;

    const now = new Date();
    const targetHour = Math.max(0, now.getHours() - 2);
    const hourElements =
      scrollContainerRef.current.querySelectorAll("[data-hour]");
    const targetElement = hourElements[targetHour];
    if (targetElement && typeof targetElement.scrollIntoView === "function") {
      targetElement.scrollIntoView({ block: "start" });
    }
  }, [isToday, currentDateMs]);

  // Calculate current time indicator position
  const currentTimeTop =
    ((currentTime.getHours() * 60 + currentTime.getMinutes()) / 1440) * 100;

  const handleSlotClick = (hour: number) => {
    if (!onTimeSlotClick) return;
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      hour,
      0,
      0,
      0
    );
    onTimeSlotClick(clickedDate);
  };

  const handleEventBlockClick = (
    event: CalendarEvent,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!onEventClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onEventClick(event, {
      top: rect.top,
      left: rect.right + 12,
    });
  };

  return (
    <div className={styles.dayViewContainer}>
      {/* All-day row */}
      <div className={styles.allDayRow}>
        <div className={styles.allDayGutter}>
          <span className={styles.allDayLabel}>{t("allDay")}</span>
        </div>
        <div className={styles.allDayContent}>
          {allDayEvents.map((event) => (
            <div
              key={event.id}
              className={styles.allDayEventBar}
              style={{
                borderLeftColor: event.color.border,
                backgroundColor: event.color.bg,
                color: event.color.text,
              }}
              onClick={(e) => handleEventBlockClick(event, e)}
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollContainerRef} className={styles.timeGridScroll}>
        <div className={styles.timeGrid}>
          {/* Hour rows */}
          {hourLabels.map((label, hour) => (
            <div
              key={hour}
              className={styles.hourRow}
              data-hour={hour}
            >
              <div className={styles.hourGutter}>
                <span className={styles.hourLabel}>{label}</span>
              </div>
              <div
                className={styles.hourSlot}
                onClick={() => handleSlotClick(hour)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSlotClick(hour);
                  }
                }}
                aria-label={`${label} ${t("timeSlot")}`}
              />
            </div>
          ))}

          {/* Event blocks (absolute positioned within the time grid) */}
          <div className={styles.dayEventsColumn}>
            {groupedTimedEvents.map(({ event, column, totalColumns }) => {
              const pos = calculateEventPosition(event, dayStart);
              const width = 100 / totalColumns;
              const left = column * width;

              return (
                <div
                  key={event.id}
                  className={styles.timedEventBlock}
                  style={{
                    top: `${pos.top}%`,
                    height: `${pos.height}%`,
                    left: `${left}%`,
                    width: `${width}%`,
                    borderLeftColor: event.color.border,
                    backgroundColor: event.color.bg,
                    color: event.color.text,
                  }}
                  onClick={(e) => handleEventBlockClick(event, e)}
                  title={event.title}
                >
                  <span className={styles.timedEventTitle}>
                    {event.title}
                  </span>
                </div>
              );
            })}

            {/* Current time indicator */}
            {isToday && (
              <div
                className={styles.currentTimeIndicator}
                style={{ top: `${currentTimeTop}%` }}
              >
                <div className={styles.currentTimeDot} />
                <div className={styles.currentTimeLine} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
