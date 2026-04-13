import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";
import styles from "./Orders.module.scss";

type DateFilterPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDates: Date[];
  onApply: (dates: Date[]) => void;
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export default function DateFilterPopup({
  isOpen,
  onClose,
  selectedDates,
  onApply,
}: DateFilterPopupProps): React.JSX.Element | null {
  const { t } = useTranslation("orders");
  const ref = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [localDates, setLocalDates] = useState<Date[]>(selectedDates);

  useEffect(() => {
    if (isOpen) {
      setLocalDates(selectedDates);
    }
  }, [isOpen, selectedDates]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const toggleDate = (date: Date) => {
    const exists = localDates.findIndex((d) => isSameDay(d, date));
    if (exists >= 0) {
      setLocalDates(localDates.filter((_, i) => i !== exists));
    } else {
      setLocalDates([...localDates, date]);
    }
  };

  const handleApply = () => {
    onApply(localDates);
    onClose();
  };

  const monthName = new Date(viewYear, viewMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Build calendar cells
  const cells: { date: Date; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      date: new Date(viewYear, viewMonth - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: new Date(viewYear, viewMonth, d),
      isCurrentMonth: true,
    });
  }

  // Next month leading days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      date: new Date(viewYear, viewMonth + 1, d),
      isCurrentMonth: false,
    });
  }

  return (
    <div
      ref={ref}
      className={styles.calendarPopup}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header: month name + nav arrows */}
      <div className={styles.calendarHeader}>
        <span className="text-sm font-semibold text-primary flex-1">
          {monthName}
        </span>
        <div className="flex items-center gap-[14px]">
          <button
            onClick={prevMonth}
            className="p-1 rounded hover:bg-gray-100 text-secondary"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded hover:bg-gray-100 text-secondary"
            type="button"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body: day labels + date grid */}
      <div className={styles.calendarBody}>
        <div className={styles.calendarGrid}>
          {DAY_LABELS.map((label, i) => (
            <div key={i} className={styles.dayHeader}>
              {label}
            </div>
          ))}

          {cells.map((cell, i) => {
            const isSelected = localDates.some((d) => isSameDay(d, cell.date));
            return (
              <button
                key={i}
                type="button"
                className={cn(styles.dayCell, {
                  [styles.selected]: isSelected,
                  [styles.otherMonth]: !cell.isCurrentMonth,
                  [styles.today]: isToday(cell.date),
                })}
                onClick={() => toggleDate(cell.date)}
              >
                {cell.date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer: note + apply button */}
      <div className={styles.calendarFooter}>
        <p className={styles.noteText}>{t("multiDateNote")}</p>
        <button
          type="button"
          onClick={handleApply}
          className={styles.applyButton}
        >
          {t("applyNow")}
        </button>
      </div>
    </div>
  );
}
