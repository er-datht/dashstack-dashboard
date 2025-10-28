import { useTranslation } from "react-i18next";
import { Archive } from "lucide-react";

export default function ProductStock() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center">
          <Archive className="w-6 h-6 icon-brand" />
        </div>
        <h1 className="text-2xl font-bold text-primary">
          {t("products.stock", "Product Stock")}
        </h1>
      </div>

      {/* Content */}
      <div className="card p-6">
        <p className="text-secondary">
          {t(
            "productStock.description",
            "Manage your product inventory and stock levels here."
          )}
        </p>
      </div>
    </div>
  );
}
