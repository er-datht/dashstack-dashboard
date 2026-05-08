import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Table as TableIcon } from "lucide-react";
import FilterByDropdown from "./components/FilterByDropdown";
import BasicTablesSection from "./components/BasicTablesSection";
import CellContentSection from "./components/CellContentSection";
import StatesAndInteractionSection from "./components/StatesAndInteractionSection";
import type { FilterValue } from "./types";

export default function Table(): React.JSX.Element {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [toast, setToast] = useState<{
    text: string;
    variant: "success";
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ text, variant: "success" });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const showBasic = filter === "all" || filter === "basic";
  const showCellContent = filter === "all" || filter === "cellContent";
  const showStates = filter === "all" || filter === "statesAndInteraction";

  return (
    <div className="p-6 bg-page">
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 text-on-primary px-4 py-3 rounded-lg shadow-lg bg-[var(--color-success-500)]"
          role="status"
          aria-live="polite"
        >
          {toast.text}
        </div>
      )}

      <div className="flex items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center">
            <TableIcon className="w-6 h-6 icon-brand" />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {t("tables:title")}
          </h1>
        </div>
        <div className="ml-auto">
          <FilterByDropdown value={filter} onChange={setFilter} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {showBasic && <BasicTablesSection />}
        {showCellContent && <CellContentSection showToast={showToast} />}
        {showStates && <StatesAndInteractionSection showToast={showToast} />}
      </div>
    </div>
  );
}
