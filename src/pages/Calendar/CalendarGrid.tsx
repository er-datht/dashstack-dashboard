import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";
import type { CalendarEvent } from "../../types/calendar";
import styles from "./Calendar.module.scss";

type CalendarGridProps = {
  events: CalendarEvent[];
  currentMonth: number;
  currentYear: number;
  onDayClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent, position: { top: number; left: number }) => void;
};

type CalendarDay = {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
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

const TOTAL_CELLS = 42;
const DAYS_PER_WEEK = 7;

/**
 * Generates a flat array of 42 CalendarDay objects (6 weeks x 7 days)
 * for the given month and year, including leading/trailing days from
 * adjacent months.
 */
export function generateCalendarDays(
  month: number,
  year: number
): CalendarDay[] {
  const today = new Date();
  const isSameDay = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();

  const days: CalendarDay[] = [];

  // Leading days from previous month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const date = new Date(prevYear, prevMonth, dayNum);
    days.push({
      date,
      dayOfMonth: dayNum,
      isCurrentMonth: false,
      isToday: isSameDay(date),
    });
  }

  // Current month days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    days.push({
      date,
      dayOfMonth: d,
      isCurrentMonth: true,
      isToday: isSameDay(date),
    });
  }

  // Trailing days from next month
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  let nextDayNum = 1;
  while (days.length < TOTAL_CELLS) {
    const date = new Date(nextYear, nextMonth, nextDayNum);
    days.push({
      date,
      dayOfMonth: nextDayNum,
      isCurrentMonth: false,
      isToday: isSameDay(date),
    });
    nextDayNum++;
  }

  return days;
}

/**
 * For a given week row (array of 7 CalendarDay objects), returns the
 * events that overlap with that week, along with their column start
 * and span values for positioning.
 */
function getEventsForWeek(
  weekDays: CalendarDay[],
  events: CalendarEvent[]
): Array<{
  event: CalendarEvent;
  startCol: number;
  span: number;
}> {
  const weekStart = weekDays[0].date;
  const weekEnd = weekDays[6].date;

  const result: Array<{
    event: CalendarEvent;
    startCol: number;
    span: number;
  }> = [];

  for (const event of events) {
    const eventStart = event.startDate;
    const eventEnd = event.endDate ?? event.startDate;

    // Check if event overlaps with this week
    if (eventEnd < weekStart || eventStart > weekEnd) {
      continue;
    }

    // Calculate start column (clamped to week start)
    let startCol = 0;
    if (eventStart >= weekStart) {
      startCol = eventStart.getDay();
    }

    // Calculate end column (clamped to week end)
    let endCol = 6;
    if (eventEnd <= weekEnd) {
      endCol = eventEnd.getDay();
    }

    const span = endCol - startCol + 1;

    result.push({ event, startCol, span });
  }

  return result;
}

export default function CalendarGrid({
  events,
  currentMonth,
  currentYear,
  onDayClick,
  onEventClick,
}: CalendarGridProps): React.JSX.Element {
  const { t } = useTranslation("calendar");

  const days = generateCalendarDays(currentMonth, currentYear);

  // Split days into week rows
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += DAYS_PER_WEEK) {
    weeks.push(days.slice(i, i + DAYS_PER_WEEK));
  }

  return (
    <div className="p-[18px]">
      {/* Day-of-week header */}
      <div className={styles.headerRow}>
        {DAY_KEYS.map((dayKey) => (
          <div key={dayKey} className={styles.headerCell}>
            {t(`dayNames.${dayKey}`)}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, weekIndex) => {
        const weekEvents = getEventsForWeek(week, events);

        return (
          <div key={weekIndex} className={styles.weekRow}>
            {/* Day cells */}
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={cn(styles.dayCell, {
                  [styles.dayCellClickable]: !!onDayClick,
                  [styles.outOfMonth]: !day.isCurrentMonth,
                })}
                onClick={() => onDayClick?.(day.date)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && onDayClick) {
                    e.preventDefault();
                    onDayClick(day.date);
                  }
                }}
                role={onDayClick ? "button" : undefined}
                tabIndex={onDayClick ? 0 : undefined}
              >
                <span className={cn(styles.dayNumber, { [styles.todayNumber]: day.isToday })}>
                  {day.dayOfMonth}
                </span>
              </div>
            ))}

            {/* Event bars */}
            {weekEvents.map(({ event, startCol, span }, eventIndex) => {
              const leftPercent = (startCol / DAYS_PER_WEEK) * 100;
              const widthPercent = (span / DAYS_PER_WEEK) * 100;
              const bottomOffset = 4 + eventIndex * 22;

              return (
                <div
                  key={event.id}
                  className={styles.eventBar}
                  style={{
                    left: `${leftPercent}%`,
                    width: `calc(${widthPercent}% - 8px)`,
                    marginLeft: "4px",
                    bottom: `${bottomOffset}px`,
                    borderLeftColor: event.color.border,
                    backgroundColor: event.color.bg,
                    color: event.color.text,
                  }}
                  title={event.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    onEventClick?.(event, {
                      top: rect.top,
                      left: rect.right + 12,
                    });
                  }}
                >
                  {event.title}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
