import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X } from "lucide-react";
import { cn } from "../../utils/cn";
import ConfirmModal from "./ConfirmModal";
import type { CalendarEvent, Participant } from "../../types/calendar";
import styles from "./Calendar.module.scss";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

type AddEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: {
    title: string;
    startDate: Date;
    endDate?: Date;
    location: string;
    organizer: string;
    image?: string;
    participants: Participant[];
    allDay: boolean;
  }) => void;
  onDelete?: (id: string) => void;
  initialDate?: Date;
  editEvent?: CalendarEvent;
  defaultAllDay?: boolean;
};

function formatDateToInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeToInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function AddEventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDate,
  editEvent,
  defaultAllDay = true,
}: AddEventModalProps): React.JSX.Element | null {
  const { t } = useTranslation("calendar");
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(true);
  const [location, setLocation] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const showConfirmRef = useRef(false);
  showConfirmRef.current = showConfirm;

  // Image upload state
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageSizeError, setImageSizeError] = useState(false);

  // Participants state
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantInput, setParticipantInput] = useState("");

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editEvent) {
        setTitle(editEvent.title);
        setStartDate(formatDateToInput(editEvent.startDate));
        setEndDate(editEvent.endDate ? formatDateToInput(editEvent.endDate) : "");
        setAllDay(editEvent.allDay !== false);
        if (editEvent.allDay === false) {
          setStartTime(formatTimeToInput(editEvent.startDate));
          setEndTime(editEvent.endDate ? formatTimeToInput(editEvent.endDate) : "10:00");
        } else {
          setStartTime("09:00");
          setEndTime("10:00");
        }
        setLocation(editEvent.location);
        setOrganizer(editEvent.organizer);
        setImage(editEvent.image);
        setParticipants(editEvent.participants);
      } else {
        setTitle("");
        setStartDate(initialDate ? formatDateToInput(initialDate) : "");
        setEndDate("");
        setAllDay(defaultAllDay);
        if (initialDate && !defaultAllDay) {
          // Pre-fill time from the clicked time slot
          setStartTime(formatTimeToInput(initialDate));
          const endHour = new Date(initialDate);
          endHour.setHours(endHour.getHours() + 1);
          setEndTime(formatTimeToInput(endHour));
        } else {
          setStartTime("09:00");
          setEndTime("10:00");
        }
        setLocation("");
        setOrganizer("");
        setImage(undefined);
        setParticipants([]);
      }
      setTitleError(false);
      setShowConfirm(false);
      setImageSizeError(false);
      setParticipantInput("");
      setIsDragOver(false);
    }
  }, [isOpen, initialDate, editEvent, defaultAllDay]);

  // Focus trap, Escape key, and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!showConfirmRef.current) {
          onClose();
        }
        return;
      }
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'input, button, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const firstInput = modalRef.current?.querySelector<HTMLElement>("input");
    firstInput?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // ── Image handling ──────────────────────────────────────────────────

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageSizeError(true);
      return;
    }

    setImageSizeError(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so selecting the same file again triggers onChange
    e.target.value = "";
  };

  const handleUploadAreaClick = () => {
    if (!image) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImage(undefined);
    setImageSizeError(false);
  };

  // ── Participants handling ───────────────────────────────────────────

  const addParticipant = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Prevent duplicate participant names (case-insensitive)
    const isDuplicate = participants.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setParticipantInput("");
      return;
    }

    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: trimmed,
    };
    setParticipants((prev) => [...prev, newParticipant]);
    setParticipantInput("");
  };

  const handleParticipantKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addParticipant(participantInput);
    }
  };

  const handleParticipantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If the user types a comma, extract the text before it and add as chip
    if (value.includes(",")) {
      const name = value.replace(",", "");
      addParticipant(name);
    } else {
      setParticipantInput(value);
    }
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Form submission ─────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    const now = new Date();
    let startDateObj: Date;
    let endDateObj: Date | undefined;

    if (allDay) {
      startDateObj = startDate
        ? new Date(startDate + "T00:00:00")
        : new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDateObj = endDate ? new Date(endDate + "T00:00:00") : undefined;
    } else {
      const baseDateStr = startDate || formatDateToInput(now);
      startDateObj = new Date(`${baseDateStr}T${startTime}:00`);
      const endBaseDateStr = endDate || baseDateStr;
      endDateObj = new Date(`${endBaseDateStr}T${endTime}:00`);
    }

    if (endDateObj && endDateObj < startDateObj) {
      if (allDay) {
        setEndDate(startDate);
      } else {
        setEndTime(startTime);
      }
      return;
    }

    onSave({
      title: title.trim(),
      startDate: startDateObj,
      endDate: endDateObj,
      location: location.trim(),
      organizer: organizer.trim(),
      image,
      participants,
      allDay,
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        ref={modalRef}
        className={cn("card", styles.modalCard)}
        onClick={handleCardClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-event-modal-title"
      >
        <h2 id="add-event-modal-title" className="font-bold text-xl text-primary">
          {editEvent ? t("modal.editTitle") : t("modal.title")}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Image Upload Area -- above Event Title */}
          <div>
            <label className={styles.modalLabel}>
              {t("modal.uploadImage")}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              tabIndex={-1}
              aria-hidden="true"
            />
            <div
              className={cn(
                styles.uploadArea,
                isDragOver && styles.uploadAreaDragOver,
                image && styles.uploadAreaPreview
              )}
              onClick={handleUploadAreaClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role={image ? undefined : "button"}
              tabIndex={image ? undefined : 0}
              aria-label={image ? undefined : t("modal.uploadImage")}
              onKeyDown={
                image
                  ? undefined
                  : (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }
              }
            >
              {image ? (
                <>
                  <img
                    src={image}
                    alt={t("modal.uploadImage")}
                    className={styles.uploadPreviewImage}
                  />
                  <button
                    type="button"
                    className={styles.uploadRemoveButton}
                    onClick={handleRemoveImage}
                    aria-label={t("modal.removeImage")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Upload
                    className="w-6 h-6"
                    style={{ color: "var(--color-text-tertiary)" }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {t("modal.uploadImage")}
                  </span>
                </>
              )}
            </div>
            {imageSizeError && (
              <span
                role="alert"
                className="text-xs mt-1 block"
                style={{ color: "var(--color-error-500)" }}
              >
                {t("modal.imageSizeError")}
              </span>
            )}
          </div>

          {/* Event Title */}
          <div>
            <label htmlFor="event-title" className={styles.modalLabel}>
              {t("modal.eventTitle")} <span className="text-error">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              className={styles.modalInput}
              value={title}
              aria-required="true"
              aria-invalid={titleError}
              aria-describedby={titleError ? "title-error" : undefined}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(false);
              }}
            />
            {titleError && (
              <span
                id="title-error"
                role="alert"
                className="text-xs mt-1 block"
                style={{ color: "var(--color-error-500)" }}
              >
                {t("modal.titleRequired")}
              </span>
            )}
          </div>

          {/* All Day Toggle */}
          <div className={styles.allDayToggle}>
            <span className={styles.allDayToggleLabel}>
              {t("modal.allDay")}
            </span>
            <button
              type="button"
              className={cn(
                styles.toggleSwitch,
                allDay && styles.toggleSwitchOn
              )}
              onClick={() => setAllDay((prev) => !prev)}
              role="switch"
              aria-checked={allDay}
              aria-label={t("modal.allDay")}
            />
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="event-start-date" className={styles.modalLabel}>
              {t("modal.startDate")}
            </label>
            <input
              id="event-start-date"
              type="date"
              className={styles.modalInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Time inputs (visible when not all-day) */}
          {!allDay && (
            <div className={styles.timeInputRow}>
              <div>
                <label htmlFor="event-start-time" className={styles.modalLabel}>
                  {t("modal.startTime")}
                </label>
                <input
                  id="event-start-time"
                  type="time"
                  className={styles.modalInput}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="event-end-time" className={styles.modalLabel}>
                  {t("modal.endTime")}
                </label>
                <input
                  id="event-end-time"
                  type="time"
                  className={styles.modalInput}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* End Date */}
          <div>
            <label htmlFor="event-end-date" className={styles.modalLabel}>
              {t("modal.endDate")}
            </label>
            <input
              id="event-end-date"
              type="date"
              className={styles.modalInput}
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="event-location" className={styles.modalLabel}>
              {t("modal.location")}
            </label>
            <input
              id="event-location"
              type="text"
              className={styles.modalInput}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Organizer */}
          <div>
            <label htmlFor="event-organizer" className={styles.modalLabel}>
              {t("modal.organizer")}
            </label>
            <input
              id="event-organizer"
              type="text"
              className={styles.modalInput}
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
            />
          </div>

          {/* Guests */}
          <div>
            <label htmlFor="event-participants" className={styles.modalLabel}>
              {t("modal.guests")}
            </label>
            <input
              id="event-participants"
              type="text"
              className={styles.modalInput}
              value={participantInput}
              placeholder={t("modal.addGuestPlaceholder")}
              onChange={handleParticipantInputChange}
              onKeyDown={handleParticipantKeyDown}
            />
            {participants.length > 0 && (
              <div className={styles.guestChips}>
                {participants.map((participant) => (
                  <span key={participant.id} className={styles.guestChip}>
                    {participant.name}
                    <button
                      type="button"
                      className={styles.guestChipRemove}
                      onClick={() => removeParticipant(participant.id)}
                      aria-label={`${t("modal.removeGuest")}: ${participant.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            {editEvent && onDelete && (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className={cn(
                  "rounded-lg h-10 px-6",
                  "font-semibold",
                  "cursor-pointer border-none",
                  "mr-auto",
                  "hover:opacity-80 transition-opacity"
                )}
                style={{
                  color: "var(--color-error-500)",
                  backgroundColor: "transparent",
                }}
              >
                {t("modal.delete")}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "bg-surface-muted text-primary",
                "rounded-lg h-10 px-6",
                "font-semibold",
                "cursor-pointer border-none",
                "hover:opacity-80 transition-opacity"
              )}
            >
              {t("modal.cancel")}
            </button>
            <button
              type="submit"
              className={cn(
                "bg-primary text-on-primary",
                "rounded-lg h-10 px-6",
                "font-semibold",
                "cursor-pointer border-none",
                "hover:opacity-90 transition-opacity"
              )}
            >
              {t("modal.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
    <ConfirmModal
      isOpen={showConfirm}
      title={t("modal.confirmDeleteTitle")}
      message={t("modal.deleteConfirm")}
      confirmLabel={t("modal.delete")}
      cancelLabel={t("modal.cancel")}
      onConfirm={() => {
        setShowConfirm(false);
        if (editEvent && onDelete) {
          onDelete(editEvent.id);
        }
      }}
      onCancel={() => setShowConfirm(false)}
    />
    </>
  );
}
