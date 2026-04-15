import type { CalendarEvent } from "../../types/calendar";

export type ViewMode = "day" | "week" | "month";

export const EXTRA_PARTICIPANTS_THRESHOLD = 3;

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts[0] === "") return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Returns an array of 24 hour labels in 12-hour format.
 * The first entry (midnight) shows the local timezone abbreviation (e.g., "GMT+07")
 * instead of "12 AM", matching Google Calendar behavior.
 * e.g. ["GMT+07", "1 AM", ..., "11 AM", "12 PM", "1 PM", ..., "11 PM"]
 */
export function getHourLabels(): string[] {
  const labels: string[] = [];
  for (let h = 0; h < 24; h++) {
    if (h === 0) {
      const tzParts = new Intl.DateTimeFormat("en", { timeZoneName: "short" }).formatToParts(new Date());
      const tz = tzParts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
      labels.push(tz);
    } else {
      const period = h < 12 ? "AM" : "PM";
      const hour12 = h > 12 ? h - 12 : h;
      labels.push(`${hour12} ${period}`);
    }
  }
  return labels;
}

/**
 * Filters events that overlap with the given [start, end] date range.
 * An event overlaps if its time range intersects the query range.
 */
export function getEventsInTimeRange(
  events: CalendarEvent[],
  start: Date,
  end: Date
): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = event.startDate;
    const eventEnd = event.endDate ?? event.startDate;
    // Overlap: eventStart < rangeEnd AND eventEnd > rangeStart
    return eventStart <= end && eventEnd >= start;
  });
}

const MINUTES_IN_DAY = 1440;
const MIN_DURATION_MINUTES = 30;

/**
 * Calculates the vertical position (top, height) of an event block
 * within a day column as percentages (0-100).
 *
 * - top = (minutesFromMidnight / 1440) * 100
 * - height = (durationMinutes / 1440) * 100
 * - Minimum height equivalent to 30 minutes
 * - Events spanning past midnight are clipped at midnight
 */
export function calculateEventPosition(
  event: CalendarEvent,
  dayStart: Date
): { top: number; height: number } {
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  const eventStart = event.startDate;
  const eventEnd = event.endDate ?? new Date(eventStart.getTime() + MIN_DURATION_MINUTES * 60 * 1000);

  // Clamp event start to day start
  const clampedStart = eventStart < dayStart ? dayStart : eventStart;
  // Clamp event end to end of day (midnight clip)
  const clampedEnd = eventEnd > dayEnd ? dayEnd : eventEnd;

  const startMinutes =
    (clampedStart.getHours() * 60 + clampedStart.getMinutes());
  let durationMinutes =
    (clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 60);

  // Enforce minimum height of 30 minutes
  if (durationMinutes < MIN_DURATION_MINUTES) {
    durationMinutes = MIN_DURATION_MINUTES;
  }

  // Clip if minimum height pushes past midnight
  if (startMinutes + durationMinutes > MINUTES_IN_DAY) {
    durationMinutes = MINUTES_IN_DAY - startMinutes;
  }

  const top = (startMinutes / MINUTES_IN_DAY) * 100;
  const height = (durationMinutes / MINUTES_IN_DAY) * 100;

  return { top, height };
}

type GroupedEvent = {
  event: CalendarEvent;
  column: number;
  totalColumns: number;
};

/**
 * Groups overlapping events and assigns column indices for side-by-side layout.
 * Events that don't overlap get column 0 with totalColumns 1.
 * Overlapping events share column space equally.
 */
export function groupOverlappingEvents(
  events: CalendarEvent[]
): GroupedEvent[] {
  if (events.length === 0) return [];

  // Sort events by start time, then by end time (longer events first)
  const sorted = [...events].sort((a, b) => {
    const diff = a.startDate.getTime() - b.startDate.getTime();
    if (diff !== 0) return diff;
    const aEnd = a.endDate ?? a.startDate;
    const bEnd = b.endDate ?? b.startDate;
    return bEnd.getTime() - aEnd.getTime();
  });

  // Build overlap clusters
  type EventEntry = {
    event: CalendarEvent;
    start: number;
    end: number;
    column: number;
    totalColumns: number;
    cluster: number;
  };

  const entries: EventEntry[] = sorted.map((event) => ({
    event,
    start: event.startDate.getTime(),
    end: (event.endDate ?? event.startDate).getTime(),
    column: 0,
    totalColumns: 1,
    cluster: -1,
  }));

  // Assign clusters: events that transitively overlap share a cluster
  let clusterIndex = 0;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].cluster === -1) {
      entries[i].cluster = clusterIndex;
      // Find all events overlapping with any event in this cluster
      let clusterEnd = entries[i].end;
      for (let j = i + 1; j < entries.length; j++) {
        if (entries[j].cluster === -1 && entries[j].start < clusterEnd) {
          entries[j].cluster = clusterIndex;
          if (entries[j].end > clusterEnd) {
            clusterEnd = entries[j].end;
          }
        }
      }
      clusterIndex++;
    }
  }

  // For each cluster, assign columns greedily
  const clusterMap = new Map<number, EventEntry[]>();
  for (const entry of entries) {
    const list = clusterMap.get(entry.cluster) ?? [];
    list.push(entry);
    clusterMap.set(entry.cluster, list);
  }

  for (const clusterEntries of clusterMap.values()) {
    // Columns track the end time of the last event placed in them
    const columnEnds: number[] = [];

    for (const entry of clusterEntries) {
      // Find the first column where this event can fit
      let placed = false;
      for (let col = 0; col < columnEnds.length; col++) {
        if (entry.start >= columnEnds[col]) {
          entry.column = col;
          columnEnds[col] = entry.end;
          placed = true;
          break;
        }
      }
      if (!placed) {
        entry.column = columnEnds.length;
        columnEnds.push(entry.end);
      }
    }

    // Set totalColumns for all entries in this cluster
    const totalCols = columnEnds.length;
    for (const entry of clusterEntries) {
      entry.totalColumns = totalCols;
    }
  }

  return entries.map((entry) => ({
    event: entry.event,
    column: entry.column,
    totalColumns: entry.totalColumns,
  }));
}

/**
 * Returns the start (Sunday) and end (Saturday) dates for the week
 * containing the given date.
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const dayOfWeek = date.getDay(); // 0 = Sunday
  const start = new Date(date);
  start.setDate(date.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
