import classnames from "classnames";
import { useTranslation } from "react-i18next";

export type StatusType = "Delivered" | "Pending" | "Rejected";

export type StatusBadgeProps = {
  status: StatusType;
  className?: string;
  translation?: string;
};

const StatusBadge = ({
  status,
  className = "",
  translation = "dashboard",
}: StatusBadgeProps) => {
  const { t } = useTranslation(translation);

  const getStatusStyles = () => {
    switch (status) {
      case "Delivered":
        return "bg-teal-500 text-white";
      case "Pending":
        return "bg-yellow-500 text-white";
      case "Rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusTranslationKey = () => {
    switch (status) {
      case "Delivered":
        return "status.delivered";
      case "Pending":
        return "status.pending";
      case "Rejected":
        return "status.rejected";
      default:
        return "status.pending";
    }
  };

  return (
    <span
      className={classnames(
        "inline-flex items-center justify-center w-24 py-1 rounded-full text-sm font-medium",
        getStatusStyles(),
        className
      )}
    >
      {t(getStatusTranslationKey())}
    </span>
  );
};

export default StatusBadge;
