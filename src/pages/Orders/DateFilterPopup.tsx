import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./Orders.module.scss";

type DateFilterPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDates: Date[];
  onApply: (dates: Date[]) => void;
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DateFilterPopup({
  isOpen,
  onClose,
  selectedDates,
  onApply,
}: DateFilterPopupProps): React.JSX.Element | null {
  const { t } = useTranslation("orders");
  const ref = useRef<HTMLDivElement>(null);
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

  const tileClassName = ({ date }: { date: Date }): string | null => {
    if (localDates.some((d) => isSameDay(d, date))) {
      return styles.reactCalendarSelected;
    }
    return null;
  };

  return (
    <div
      ref={ref}
      className={styles.calendarPopup}
      onClick={(e) => e.stopPropagation()}
    >
      {/* react-calendar replaces custom grid */}
      <div className={styles.calendarBody}>
        <ReactCalendar
          onClickDay={toggleDate}
          tileClassName={tileClassName}
          locale={undefined}
          showNavigation={true}
        />
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
