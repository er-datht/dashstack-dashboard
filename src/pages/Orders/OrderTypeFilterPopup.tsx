import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";
import type { OrderType } from "../../types/orders";
import styles from "./Orders.module.scss";

type OrderTypeFilterPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTypes: OrderType[];
  onApply: (types: OrderType[]) => void;
};

const ALL_ORDER_TYPES: OrderType[] = [
  "health_medicine",
  "book_stationary",
  "services_industry",
  "fashion_beauty",
  "home_living",
  "electronics",
  "mobile_phone",
  "accessories",
];

export default function OrderTypeFilterPopup({
  isOpen,
  onClose,
  selectedTypes,
  onApply,
}: OrderTypeFilterPopupProps): React.JSX.Element | null {
  const { t } = useTranslation("orders");
  const ref = useRef<HTMLDivElement>(null);
  const [localTypes, setLocalTypes] = useState<OrderType[]>(selectedTypes);

  useEffect(() => {
    if (isOpen) {
      setLocalTypes(selectedTypes);
    }
  }, [isOpen, selectedTypes]);

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

  const toggleType = (type: OrderType) => {
    if (localTypes.includes(type)) {
      setLocalTypes(localTypes.filter((t) => t !== type));
    } else {
      setLocalTypes([...localTypes, type]);
    }
  };

  const handleApply = () => {
    onApply(localTypes);
    onClose();
  };

  return (
    <div
      ref={ref}
      className={styles.orderTypePopup}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className={styles.orderTypeHeader}>
        <p className="text-base font-bold text-primary">
          {t("selectOrderType")}
        </p>
      </div>

      {/* Chips */}
      <div className={styles.orderTypeChips}>
        {ALL_ORDER_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={cn(styles.chip, {
              [styles.chipSelected]: localTypes.includes(type),
            })}
            onClick={() => toggleType(type)}
          >
            {t(`orderTypes.${type}`)}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.orderTypeFooter}>
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
