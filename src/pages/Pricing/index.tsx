import { useTranslation } from "react-i18next";
import { DollarSign } from "lucide-react";

export default function Pricing() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-primary">
          {t("navigation.pricing", "Pricing")}
        </h1>
      </div>

      {/* Content */}
      <div className="card p-6">
        <p className="text-secondary">
          {t(
            "pricing.description",
            "Manage pricing plans and subscription options here."
          )}
        </p>
      </div>
    </div>
  );
}
