import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layers } from "lucide-react";
import FilterByDropdown from "./components/FilterByDropdown";
import BarChartSection from "./components/BarChartSection";
import PieChartSection from "./components/PieChartSection";
import DonutChartSection from "./components/DonutChartSection";
import type { FilterValue } from "./types";

/**
 * UI Elements page — a charts gallery showcasing recharts variants across
 * Bar, Pie, and Donut sections. The Filter By dropdown in the page header
 * scopes which sections render.
 *
 * Filter state is local React state; it does not persist across navigations
 * or reloads (per spec: ui-elements-page → "Filter state is local and not
 * persisted").
 */
export default function UiElements() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterValue>("all");

  const showBar = filter === "all" || filter === "bar";
  const showPie = filter === "all" || filter === "pie";
  const showDonut = filter === "all" || filter === "donut";

  return (
    <div className="p-6 bg-page">
      {/* Page Header */}
      <div className="flex items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center">
            <Layers className="w-6 h-6 icon-brand" />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {t("uiElements:title")}
          </h1>
        </div>
        <div className="ml-auto">
          <FilterByDropdown value={filter} onChange={setFilter} />
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-6">
        {showBar && <BarChartSection />}
        {showPie && <PieChartSection />}
        {showDonut && <DonutChartSection />}
      </div>
    </div>
  );
}
