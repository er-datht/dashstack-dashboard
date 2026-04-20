import { useState, useRef, useEffect } from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { cn } from "../../utils/cn";
import styles from "./DatePickerInput.module.scss";

type DatePickerInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  min?: string;
  max?: string;
};

function formatDateToInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${year}/${month}/${day}`;
}

function parseInputToDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function DatePickerInput({
  id,
  value,
  onChange,
  className,
  placeholder,
  min,
  max,
}: DatePickerInputProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleDateChange = (date: unknown) => {
    if (date instanceof Date) {
      onChange(formatDateToInput(date));
      setIsOpen(false);
    }
  };

  const calendarValue = parseInputToDate(value);
  const minDate = min ? parseInputToDate(min) : undefined;
  const maxDate = max ? parseInputToDate(max) : undefined;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        id={id}
        type="button"
        className={cn(className, styles.trigger, { [styles.placeholder]: !value })}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {value ? formatDisplayDate(value) : (placeholder ?? "")}
      </button>

      {isOpen && (
        <div className={styles.popup}>
          <ReactCalendar
            value={calendarValue}
            onChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            locale={undefined}
          />
        </div>
      )}
    </div>
  );
}
