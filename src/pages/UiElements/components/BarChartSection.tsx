import { useTranslation } from "react-i18next";
import BarVariantPlain from "../charts/BarVariantPlain";
import BarVariantStacked2 from "../charts/BarVariantStacked2";
import BarVariantGrouped from "../charts/BarVariantGrouped";
import BarVariantStacked3 from "../charts/BarVariantStacked3";
import ChartSection from "./ChartSection";

/**
 * Bar Chart section card — renders four bar chart variants in a responsive
 * grid (4 columns desktop / 2 columns tablet / 1 column mobile).
 */
export default function BarChartSection() {
  const { t } = useTranslation();

  return (
    <ChartSection title={t("uiElements:sections.bar")}>
      <BarVariantPlain />
      <BarVariantStacked2 />
      <BarVariantGrouped />
      <BarVariantStacked3 />
    </ChartSection>
  );
}
