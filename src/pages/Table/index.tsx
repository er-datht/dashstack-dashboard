import { useTranslation } from "react-i18next";
import { Table as TableIcon } from "lucide-react";

export default function Table() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center">
          <TableIcon className="w-6 h-6 icon-brand" />
        </div>
        <h1 className="text-2xl font-bold text-primary">
          {t("navigation.table", "Table")}
        </h1>
      </div>

      {/* Content */}
      <div className="card p-6">
        <p className="text-secondary">
          {t("table.description", "View and manage data tables here.")}
        </p>
      </div>
    </div>
  );
}
