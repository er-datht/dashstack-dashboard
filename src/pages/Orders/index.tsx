import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";

export default function Orders() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
          <ClipboardList className="w-6 h-6 text-warning" />
        </div>
        <h1 className="text-2xl font-bold text-primary">
          {t("orders.orderList", "Orders")}
        </h1>
      </div>

      {/* Content */}
      <div className="card p-6">
        <p className="text-secondary">
          Orders page content will be displayed here.
        </p>
      </div>
    </div>
  );
}
