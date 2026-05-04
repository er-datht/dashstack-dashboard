import { useTranslation } from "react-i18next";
import { useChartTheme } from "../useChartTheme";
import { getDonutColors } from "../palette";
import DonutVariantSingle from "../charts/DonutVariantSingle";
import DonutVariantStacked2 from "../charts/DonutVariantStacked2";
import DonutVariantStacked3 from "../charts/DonutVariantStacked3";
import ChartSection from "./ChartSection";

/**
 * Donut Chart section card — renders four donut variants in order:
 * teal single, blue single, 2-color (yellow + teal), multi-color
 * (orange + yellow + teal).
 */
export default function DonutChartSection() {
  const { t } = useTranslation();
  const theme = useChartTheme();
  const colors = getDonutColors(theme);

  return (
    <ChartSection title={t("uiElements:sections.donut")}>
      <DonutVariantSingle color={colors.teal} value={70} />
      <DonutVariantSingle color={colors.blue} value={55} />
      <DonutVariantStacked2 />
      <DonutVariantStacked3 />
    </ChartSection>
  );
}
