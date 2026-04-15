import { useState } from "react";
import { useTranslation } from "react-i18next";
import EventsSidebar from "./EventsSidebar";
import CalendarGrid from "./CalendarGrid";
import CalendarHeader from "./CalendarHeader";
import DayView from "./DayView";
import WeekView from "./WeekView";
import AddEventModal from "./AddEventModal";
import EventDetailPopover from "./EventDetailPopover";
import ConfirmModal from "./ConfirmModal";
import { calendarEvents } from "../../data/calendarEvents";
import { getWeekRange } from "./calendarUtils";
import type { ViewMode } from "./calendarUtils";
import type { CalendarEvent, EventColor, Participant } from "../../types/calendar";

const EVENT_COLORS: EventColor[] = [
  { border: "#7551e9", bg: "rgba(117, 81, 233, 0.15)", text: "#7551e9" },
  { border: "#e951bf", bg: "rgba(233, 81, 191, 0.15)", text: "#e951bf" },
  { border: "#ff9e58", bg: "rgba(255, 158, 88, 0.15)", text: "#ff9e58" },
  { border: "#516fe9", bg: "rgba(81, 111, 233, 0.15)", text: "#516fe9" },
  { border: "#34d399", bg: "rgba(52, 211, 153, 0.15)", text: "#34d399" },
  { border: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)", text: "#f43f5e" },
];

const MONTH_KEYS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
] as const;

const LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  jp: "ja-JP",
};

function formatDayLabel(date: Date, language: string): string {
  const locale = LOCALE_MAP[language] ?? "en-US";
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatWeekLabel(date: Date, language: string): string {
  const locale = LOCALE_MAP[language] ?? "en-US";
  const { start, end } = getWeekRange(date);
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  const shortMonth = (d: Date) =>
    new Intl.DateTimeFormat(locale, { month: "short" }).format(d);

  if (startYear !== endYear) {
    return `${shortMonth(start)} ${start.getDate()}, ${startYear} - ${shortMonth(end)} ${end.getDate()}, ${endYear}`;
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${shortMonth(start)} ${start.getDate()} - ${shortMonth(end)} ${end.getDate()}, ${endYear}`;
  }
  return `${shortMonth(start)} ${start.getDate()} - ${end.getDate()}, ${endYear}`;
}

export default function Calendar(): React.JSX.Element {
  const { t, i18n } = useTranslation("calendar");

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [events, setEvents] = useState<CalendarEvent[]>(calendarEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>(
    undefined
  );
  const [modalDefaultAllDay, setModalDefaultAllDay] = useState(true);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [popoverEvent, setPopoverEvent] = useState<CalendarEvent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<CalendarEvent | null>(null);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "day") {
        next.setDate(next.getDate() - 1);
      } else if (viewMode === "week") {
        next.setDate(next.getDate() - 7);
      } else {
        next.setMonth(next.getMonth() - 1);
      }
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "day") {
        next.setDate(next.getDate() + 1);
      } else if (viewMode === "week") {
        next.setDate(next.getDate() + 7);
      } else {
        next.setMonth(next.getMonth() + 1);
      }
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Compute view-specific header label
  const getHeaderLabel = (): string => {
    if (viewMode === "day") {
      return formatDayLabel(currentDate, i18n.language);
    }
    if (viewMode === "week") {
      return formatWeekLabel(currentDate, i18n.language);
    }
    // Month view
    const monthLabel = t(`monthNames.${MONTH_KEYS[currentDate.getMonth()]}`);
    return `${monthLabel} ${currentDate.getFullYear()}`;
  };

  const handlePopoverClose = () => {
    setPopoverEvent(null);
    setPopoverPosition(null);
  };

  const handleDayClick = (date: Date) => {
    handlePopoverClose();
    setEditingEvent(null);
    setModalInitialDate(date);
    setModalDefaultAllDay(true);
    setIsModalOpen(true);
  };

  const handleTimeSlotClick = (date: Date) => {
    handlePopoverClose();
    setEditingEvent(null);
    setModalInitialDate(date);
    setModalDefaultAllDay(false);
    setIsModalOpen(true);
  };

  const handleAddEventClick = () => {
    handlePopoverClose();
    setEditingEvent(null);
    setModalInitialDate(undefined);
    setModalDefaultAllDay(viewMode === "month");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSidebarEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setModalInitialDate(undefined);
    setIsModalOpen(true);
  };

  const handleGridEventClick = (
    event: CalendarEvent,
    position: { top: number; left: number }
  ) => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setPopoverEvent(event);
    setPopoverPosition(position);
  };

  const handlePopoverEdit = (event: CalendarEvent) => {
    handlePopoverClose();
    setEditingEvent(event);
    setModalInitialDate(undefined);
    setIsModalOpen(true);
  };

  const handlePopoverDelete = (id: string) => {
    const eventToDelete = events.find((evt) => evt.id === id) ?? null;
    handlePopoverClose();
    setDeleteConfirmEvent(eventToDelete);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmEvent) {
      setEvents((prev) => prev.filter((evt) => evt.id !== deleteConfirmEvent.id));
    }
    setDeleteConfirmEvent(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmEvent(null);
  };

  const handleSaveEvent = (data: {
    title: string;
    startDate: Date;
    endDate?: Date;
    location: string;
    organizer: string;
    image?: string;
    participants: Participant[];
    allDay: boolean;
  }) => {
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === editingEvent.id
            ? {
                ...evt,
                title: data.title,
                startDate: data.startDate,
                endDate: data.endDate,
                location: data.location,
                organizer: data.organizer,
                image: data.image,
                participants: data.participants,
                allDay: data.allDay,
              }
            : evt
        )
      );
    } else {
      const newEvent: CalendarEvent = {
        id: `evt-${crypto.randomUUID()}`,
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        allDay: data.allDay,
        location: data.location,
        organizer: data.organizer,
        image: data.image,
        color: EVENT_COLORS[events.length % EVENT_COLORS.length],
        participants: data.participants,
      };
      setEvents((prev) => [...prev, newEvent]);
    }
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="p-8 bg-page min-h-screen flex flex-col gap-6">
      {/* Page title */}
      <h1 className="font-bold text-[32px] text-primary">
        {t("title")}
      </h1>

      {/* Two-column layout */}
      <div className="flex gap-[30px] items-start">
        <EventsSidebar events={events} onAddEvent={handleAddEventClick} onEventClick={handleSidebarEventClick} />

        <div
          className="card flex-1 flex flex-col overflow-hidden"
          style={{ border: "0.5px solid var(--color-border)" }}
        >
          {/* Shared header */}
          <CalendarHeader
            viewMode={viewMode}
            onViewChange={handleViewChange}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
            label={getHeaderLabel()}
          />

          {/* Active view */}
          {viewMode === "day" && (
            <div className="p-[18px] flex-1 flex flex-col overflow-hidden">
              <DayView
                currentDate={currentDate}
                events={events}
                onTimeSlotClick={handleTimeSlotClick}
                onEventClick={handleGridEventClick}
              />
            </div>
          )}
          {viewMode === "week" && (
            <div className="p-[18px] flex-1 flex flex-col overflow-hidden">
              <WeekView
                currentDate={currentDate}
                events={events}
                onTimeSlotClick={handleTimeSlotClick}
                onEventClick={handleGridEventClick}
              />
            </div>
          )}
          {viewMode === "month" && (
            <CalendarGrid
              events={events}
              currentMonth={currentDate.getMonth()}
              currentYear={currentDate.getFullYear()}
              onDayClick={handleDayClick}
              onEventClick={handleGridEventClick}
            />
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialDate={modalInitialDate}
        editEvent={editingEvent ?? undefined}
        defaultAllDay={modalDefaultAllDay}
      />

      {/* Event Detail Popover */}
      {popoverEvent && popoverPosition && (
        <EventDetailPopover
          event={popoverEvent}
          position={popoverPosition}
          onClose={handlePopoverClose}
          onEdit={handlePopoverEdit}
          onDelete={handlePopoverDelete}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmEvent !== null}
        title={t("modal.confirmDeleteTitle")}
        message={t("modal.deleteConfirm")}
        confirmLabel={t("modal.delete")}
        cancelLabel={t("modal.cancel")}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
