import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";
import type { CalendarEvent } from "../../types/calendar";
import {
  getHourLabels,
  getEventsInTimeRange,
  getWeekRange,
  calculateEventPosition,
  groupOverlappingEvents,
  isSameDay,
} from "./calendarUtils";
import styles from "./Calendar.module.scss";

type WeekViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick?: (date: Date) => void;
  onEventClick?: (
    event: CalendarEvent,
    position: { top: number; left: number }
  ) => void;
};

const DAY_KEYS = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

function getWeekDates(date: Date): Date[] {
  const { start } = getWeekRange(date);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    d.setHours(0, 0, 0, 0);
    dates.push(d);
  }
  return dates;
}

export default function WeekView({
  currentDate,
  events,
  onTimeSlotClick,
  onEventClick,
}: WeekViewProps): React.JSX.Element {
  const { t } = useTranslation("calendar");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const hourLabels = getHourLabels();
  const currentDateMs = currentDate.getTime();
  const weekDates = getWeekDates(currentDate);
  const today = new Date();
  const { start: weekStart, end: weekEnd } = getWeekRange(currentDate);

  const isCurrentWeek = weekDates.some((d) => isSameDay(d, today));

  // Get all events for this week
  const weekEvents = getEventsInTimeRange(events, weekStart, weekEnd);
  const allDayEvents = weekEvents.filter(
    (evt) => evt.allDay === true || evt.allDay === undefined
  );
  const timedEvents = weekEvents.filter((evt) => evt.allDay === false);

  // Group timed events per day
  const timedEventsByDay: Map<number, CalendarEvent[]> = new Map();
  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const dayDate = weekDates[dayIdx];
    const dayStart = new Date(
      dayDate.getFullYear(),
      dayDate.getMonth(),
      dayDate.getDate(),
      0, 0, 0, 0
    );
    const dayEnd = new Date(
      dayDate.getFullYear(),
      dayDate.getMonth(),
      dayDate.getDate(),
      23, 59, 59, 999
    );
    const dayTimedEvents = timedEvents.filter((evt) => {
      const eventEnd = evt.endDate ?? evt.startDate;
      return evt.startDate <= dayEnd && eventEnd >= dayStart;
    });
    timedEventsByDay.set(dayIdx, dayTimedEvents);
  }

  // Current time indicator update
  useEffect(() => {
    if (!isCurrentWeek) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [isCurrentWeek]);

  // Auto-scroll to current time
  useEffect(() => {
    if (!isCurrentWeek || !scrollContainerRef.current) return;

    const now = new Date();
    const targetHour = Math.max(0, now.getHours() - 2);
    const hourElements =
      scrollContainerRef.current.querySelectorAll("[data-hour]");
    const targetElement = hourElements[targetHour];
    if (targetElement && typeof targetElement.scrollIntoView === "function") {
      targetElement.scrollIntoView({ block: "start" });
    }
  }, [isCurrentWeek, currentDateMs]);

  // Current time indicator position
  const currentTimeTop =
    ((currentTime.getHours() * 60 + currentTime.getMinutes()) / 1440) * 100;

  const handleSlotClick = (dayDate: Date, hour: number) => {
    if (!onTimeSlotClick) return;
    const clickedDate = new Date(
      dayDate.getFullYear(),
      dayDate.getMonth(),
      dayDate.getDate(),
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

  // Calculate all-day event spanning
  const allDaySpans = allDayEvents.map((event) => {
    const eventStart = event.startDate;
    const eventEnd = event.endDate ?? event.startDate;

    let startCol = 0;
    for (let i = 0; i < 7; i++) {
      if (isSameDay(weekDates[i], eventStart) || weekDates[i] >= eventStart) {
        startCol = i;
        break;
      }
    }
    // Clamp to week start
    if (eventStart < weekStart) {
      startCol = 0;
    }

    let endCol = 6;
    for (let i = 6; i >= 0; i--) {
      if (isSameDay(weekDates[i], eventEnd) || weekDates[i] <= eventEnd) {
        endCol = i;
        break;
      }
    }
    // Clamp to week end
    if (eventEnd > weekEnd) {
      endCol = 6;
    }

    const span = endCol - startCol + 1;
    return { event, startCol, span };
  });

  return (
    <div className={styles.weekViewContainer}>
      {/* Column headers */}
      <div className={styles.weekColumnHeaders}>
        <div className={styles.weekHeaderGutter} />
        {weekDates.map((date, idx) => {
          const isDayToday = isSameDay(date, today);
          return (
            <div
              key={idx}
              className={cn(styles.weekColumnHeader, {
                [styles.weekColumnHeaderToday]: isDayToday,
              })}
            >
              <span className={styles.weekDayName}>
                {t(`dayNames.${DAY_KEYS[idx]}`)}
              </span>
              <span
                className={cn(styles.weekDateNumber, {
                  [styles.weekDateNumberToday]: isDayToday,
                })}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* All-day row */}
      <div className={styles.weekAllDayRow}>
        <div className={styles.allDayGutter}>
          <span className={styles.allDayLabel}>{t("allDay")}</span>
        </div>
        <div className={styles.weekAllDayGrid}>
          {allDaySpans.map(({ event, startCol, span }) => {
            const leftPercent = (startCol / 7) * 100;
            const widthPercent = (span / 7) * 100;
            return (
              <div
                key={event.id}
                className={styles.allDayEventBar}
                style={{
                  position: "absolute",
                  left: `${leftPercent}%`,
                  width: `calc(${widthPercent}% - 4px)`,
                  borderLeftColor: event.color.border,
                  backgroundColor: event.color.bg,
                  color: event.color.text,
                }}
                onClick={(e) => handleEventBlockClick(event, e)}
              >
                {event.title}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollContainerRef} className={styles.timeGridScroll}>
        <div className={styles.weekTimeGrid}>
          {/* Hour rows */}
          {hourLabels.map((label, hour) => (
            <div
              key={hour}
              className={styles.weekHourRow}
              data-hour={hour}
            >
              <div className={styles.hourGutter}>
                <span className={styles.hourLabel}>{label}</span>
              </div>
              {weekDates.map((date, dayIdx) => (
                <div
                  key={dayIdx}
                  className={styles.weekHourSlot}
                  onClick={() => handleSlotClick(date, hour)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSlotClick(date, hour);
                    }
                  }}
                  aria-label={`${t(`dayNames.${DAY_KEYS[dayIdx]}`)} ${label} ${t("timeSlot")}`}
                />
              ))}
            </div>
          ))}

          {/* Day columns with event blocks */}
          {weekDates.map((date, dayIdx) => {
            const dayTimedEvents = timedEventsByDay.get(dayIdx) ?? [];
            const grouped = groupOverlappingEvents(dayTimedEvents);
            const dayStart = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              0, 0, 0, 0
            );
            const isDayToday = isSameDay(date, today);

            return (
              <div
                key={dayIdx}
                className={styles.weekDayEventsColumn}
                style={{
                  left: `calc(60px + (100% - 60px) * ${dayIdx} / 7)`,
                  width: `calc((100% - 60px) / 7)`,
                }}
              >
                {grouped.map(({ event, column, totalColumns }) => {
                  const pos = calculateEventPosition(event, dayStart);
                  const width = 100 / totalColumns;
                  const leftPos = column * width;

                  return (
                    <div
                      key={event.id}
                      className={styles.timedEventBlock}
                      style={{
                        top: `${pos.top}%`,
                        height: `${pos.height}%`,
                        left: `${leftPos}%`,
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

                {/* Current time indicator in today's column */}
                {isDayToday && isCurrentWeek && (
                  <div
                    className={styles.currentTimeIndicator}
                    style={{ top: `${currentTimeTop}%` }}
                  >
                    <div className={styles.currentTimeDot} />
                    <div className={styles.currentTimeLine} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
