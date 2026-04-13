import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";
import type { OrderListStatus } from "../../types/orders";

type OrderStatusBadgeProps = {
  status: OrderListStatus;
  className?: string;
};

const STATUS_STYLES: Record<OrderListStatus, { bg: string; text: string }> = {
  completed: { bg: "rgba(0,182,155,0.2)", text: "#00b69b" },
  processing: { bg: "rgba(98,38,239,0.2)", text: "#6226ef" },
  on_hold: { bg: "rgba(255,167,86,0.2)", text: "#ffa756" },
  rejected: { bg: "rgba(239,56,38,0.2)", text: "#ef3826" },
};

export default function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps): React.JSX.Element {
  const { t } = useTranslation("orders");
  const colors = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-24 p-1.5 rounded text-xs font-bold",
        className
      )}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {t(`status.${status}`)}
    </span>
  );
}
