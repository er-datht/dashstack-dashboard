/**
 * Calendar Type Definitions
 * Types related to Calendar screen
 */

import type { ID } from "./common";

export type CalendarEvent = {
  id: ID;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
  color?: string;
  category?: EventCategory;
  recurring?: RecurringPattern;
};

export type EventCategory =
  | "meeting"
  | "task"
  | "reminder"
  | "holiday"
  | "other";

export type RecurringPattern = {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  endDate?: string;
  occurrences?: number;
};

export type CalendarView = "month" | "week" | "day" | "agenda";
