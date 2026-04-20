import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { cn } from "../../utils/cn";
import type { ViewMode } from "./calendarUtils";
import styles from "./Calendar.module.scss";

type CalendarHeaderProps = {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  label: string;
  currentDate: Date;
  onDateSelect: (date: Date) => void;
};

function getAriaLabel(viewMode: ViewMode, direction: "previous" | "next", t: (key: string) => string): string {
  if (viewMode === "day") {
    return direction === "previous" ? t("previousDay") : t("nextDay");
  }
  if (viewMode === "week") {
    return direction === "previous" ? t("previousWeek") : t("nextWeek");
  }
  return direction === "previous" ? t("previousMonth") : t("nextMonth");
}

export default function CalendarHeader({
  viewMode,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  label,
  currentDate,
  onDateSelect,
}: CalendarHeaderProps): React.JSX.Element {
  const { t } = useTranslation("calendar");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Click-outside dismiss
  useEffect(() => {
    if (!isPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isPickerOpen]);

  // Escape key dismiss
  useEffect(() => {
    if (!isPickerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isPickerOpen]);

  const handleDateChange = (value: unknown) => {
    if (value instanceof Date) {
      onDateSelect(value);
      setIsPickerOpen(false);
    }
  };

  return (
    <div className="flex justify-between items-center pt-[18px] px-[18px]">
      {/* Today button */}
      <button
        type="button"
        onClick={onToday}
        className={cn(
          "text-sm font-medium text-primary opacity-80",
          "cursor-pointer bg-transparent border-none",
          "hover:opacity-100 transition-opacity"
        )}
      >
        {t("today")}
      </button>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          className={cn(
            "w-8 h-8 flex items-center justify-center",
            "rounded-full cursor-pointer",
            "bg-transparent border-none",
            "text-primary hover:bg-surface-muted",
            "transition-colors"
          )}
          aria-label={getAriaLabel(viewMode, "previous", t)}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Clickable date label with picker */}
        <div className={styles.datePickerWrapper} ref={pickerRef}>
          <button
            type="button"
            className={cn(styles.datePickerLabel, "font-bold text-2xl text-primary min-w-[200px] text-center")}
            onClick={() => setIsPickerOpen((prev) => !prev)}
          >
            {label}
          </button>

          {isPickerOpen && (
            <div className={styles.datePickerPopup}>
              <ReactCalendar
                value={currentDate}
                onChange={handleDateChange}
                locale={undefined}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          className={cn(
            "w-8 h-8 flex items-center justify-center",
            "rounded-full cursor-pointer",
            "bg-transparent border-none",
            "text-primary hover:bg-surface-muted",
            "transition-colors"
          )}
          aria-label={getAriaLabel(viewMode, "next", t)}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* View toggle */}
      <div className={styles.viewToggle}>
        <button
          type="button"
          className={cn(
            styles.viewToggleButton,
            viewMode === "day" && styles.viewToggleButtonActive
          )}
          onClick={() => onViewChange("day")}
        >
          {t("viewDay")}
        </button>
        <button
          type="button"
          className={cn(
            styles.viewToggleButton,
            viewMode === "week" && styles.viewToggleButtonActive
          )}
          onClick={() => onViewChange("week")}
        >
          {t("viewWeek")}
        </button>
        <button
          type="button"
          className={cn(
            styles.viewToggleButton,
            viewMode === "month" && styles.viewToggleButtonActive
          )}
          onClick={() => onViewChange("month")}
        >
          {t("viewMonth")}
        </button>
      </div>
    </div>
  );
}
