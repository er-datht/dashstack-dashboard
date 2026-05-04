import { useTranslation } from "react-i18next";
import { useChartTheme } from "../useChartTheme";
import { getPieColors } from "../palette";
import PieVariantSingle from "../charts/PieVariantSingle";
import ChartSection from "./ChartSection";

/**
 * Pie Chart section card — four single-slice pies in a responsive grid.
 * Slice colors and proportions: blue 25%, purple 25%, orange 33%, blue 33%.
 */
export default function PieChartSection() {
  const { t } = useTranslation();
  const theme = useChartTheme();
  const colors = getPieColors(theme);

  return (
    <ChartSection title={t("uiElements:sections.pie")}>
      <PieVariantSingle color={colors.blue} value={25} />
      <PieVariantSingle color={colors.purple} value={25} />
      <PieVariantSingle color={colors.orange} value={33} />
      <PieVariantSingle color={colors.blue} value={33} />
    </ChartSection>
  );
}
