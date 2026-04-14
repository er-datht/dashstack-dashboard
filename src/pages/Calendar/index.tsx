import { useState } from "react";
import { useTranslation } from "react-i18next";
import EventsSidebar from "./EventsSidebar";
import CalendarGrid from "./CalendarGrid";
import AddEventModal from "./AddEventModal";
import EventDetailPopover from "./EventDetailPopover";
import ConfirmModal from "./ConfirmModal";
import { calendarEvents } from "../../data/calendarEvents";
import type { CalendarEvent, EventColor, Participant } from "../../types/calendar";

const EVENT_COLORS: EventColor[] = [
  { border: "#7551e9", bg: "rgba(117, 81, 233, 0.15)", text: "#7551e9" },
  { border: "#e951bf", bg: "rgba(233, 81, 191, 0.15)", text: "#e951bf" },
  { border: "#ff9e58", bg: "rgba(255, 158, 88, 0.15)", text: "#ff9e58" },
  { border: "#516fe9", bg: "rgba(81, 111, 233, 0.15)", text: "#516fe9" },
  { border: "#34d399", bg: "rgba(52, 211, 153, 0.15)", text: "#34d399" },
  { border: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)", text: "#f43f5e" },
];

export default function Calendar(): React.JSX.Element {
  const { t } = useTranslation("calendar");

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>(calendarEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>(
    undefined
  );
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [popoverEvent, setPopoverEvent] = useState<CalendarEvent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<CalendarEvent | null>(null);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const handlePopoverClose = () => {
    setPopoverEvent(null);
    setPopoverPosition(null);
  };

  const handleDayClick = (date: Date) => {
    handlePopoverClose();
    setEditingEvent(null);
    setModalInitialDate(date);
    setIsModalOpen(true);
  };

  const handleAddEventClick = () => {
    handlePopoverClose();
    setEditingEvent(null);
    setModalInitialDate(undefined);
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
  }) => {
    if (editingEvent) {
      // Update existing event
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
              }
            : evt
        )
      );
    } else {
      // Create new event
      const newEvent: CalendarEvent = {
        id: `evt-${crypto.randomUUID()}`,
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
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
      <div className="flex gap-[30px]">
        <EventsSidebar events={events} onAddEvent={handleAddEventClick} onEventClick={handleSidebarEventClick} />
        <CalendarGrid
          events={events}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          onDayClick={handleDayClick}
          onEventClick={handleGridEventClick}
        />
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialDate={modalInitialDate}
        editEvent={editingEvent ?? undefined}
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
