import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  RotateCcw,
  Check,
} from "lucide-react";
import filterIcon from "../../assets/icons/filter.svg";
import { cn } from "../../utils/cn";
import type { OrderFilters, OrderType, OrderListStatus } from "../../types/orders";
import DateFilterPopup from "./DateFilterPopup";
import OrderTypeFilterPopup from "./OrderTypeFilterPopup";
import styles from "./Orders.module.scss";

type FilterBarProps = {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  onReset: () => void;
};

const ALL_STATUSES: OrderListStatus[] = [
  "completed",
  "processing",
  "on_hold",
  "rejected",
];

export default function FilterBar({
  filters,
  onFiltersChange,
  onReset,
}: FilterBarProps): React.JSX.Element {
  const { t } = useTranslation("orders");
  const [openPopup, setOpenPopup] = useState<
    "date" | "type" | "status" | null
  >(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openPopup !== "status") return;
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setOpenPopup(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPopup]);

  const togglePopup = (popup: "date" | "type" | "status") => {
    setOpenPopup(openPopup === popup ? null : popup);
  };

  const handleDateApply = (dates: Date[]) => {
    onFiltersChange({ ...filters, dates });
  };

  const handleTypeApply = (types: OrderType[]) => {
    onFiltersChange({ ...filters, types });
  };

  const toggleStatus = (status: OrderListStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  return (
    <div className={styles.filterBar}>
      {/* Filter icon segment */}
      <div className={styles.filterSegment}>
        <img src={filterIcon} alt="" className="w-6 h-6" />
      </div>

      {/* "Filter By" label segment */}
      <div className={styles.filterSegment}>
        {t("filterBy")}
      </div>

      {/* Date filter segment */}
      <div
        className={cn(styles.filterSegment, "relative")}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => togglePopup("date")}
      >
        {t("dateFilter")}
        <ChevronDown className="w-4 h-4" />
        <DateFilterPopup
          isOpen={openPopup === "date"}
          onClose={() => setOpenPopup(null)}
          selectedDates={filters.dates}
          onApply={handleDateApply}
        />
      </div>

      {/* Order Type filter segment */}
      <div
        className={cn(styles.filterSegment, "relative")}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => togglePopup("type")}
      >
        {t("orderTypeFilter")}
        <ChevronDown className="w-4 h-4" />
        <OrderTypeFilterPopup
          isOpen={openPopup === "type"}
          onClose={() => setOpenPopup(null)}
          selectedTypes={filters.types}
          onApply={handleTypeApply}
        />
      </div>

      {/* Order Status filter segment */}
      <div
        className={cn(styles.filterSegment, "relative")}
        ref={statusRef}
        onClick={() => togglePopup("status")}
      >
        {t("orderStatusFilter")}
        <ChevronDown className="w-4 h-4" />
        {openPopup === "status" && (
          <div className={styles.popup}>
            {ALL_STATUSES.map((status) => {
              const isChecked = filters.statuses.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  className={styles.statusOption}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatus(status);
                  }}
                >
                  <div
                    className={cn(styles.checkbox, {
                      [styles.checked]: isChecked,
                    })}
                  >
                    {isChecked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {t(`status.${status}`)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset Filter segment */}
      <div
        className={cn(styles.filterSegment, styles.filterSegmentReset)}
        onClick={onReset}
      >
        <RotateCcw className="w-[18px] h-[18px]" />
        {t("resetFilter")}
      </div>
    </div>
  );
}
