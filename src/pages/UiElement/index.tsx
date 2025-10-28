import { useTranslation } from "react-i18next";
import { Layers } from "lucide-react";

export default function UiElement() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center">
          <Layers className="w-6 h-6 icon-brand" />
        </div>
        <h1 className="text-2xl font-bold text-primary">
          {t("navigation.uiElement", "UI Element")}
        </h1>
      </div>

      {/* Content */}
      <div className="card p-6">
        <p className="text-secondary">
          {t(
            "uiElement.description",
            "Explore UI components and elements here."
          )}
        </p>
      </div>
    </div>
  );
}
