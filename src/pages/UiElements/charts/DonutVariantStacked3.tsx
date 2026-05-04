import { useChartTheme } from "../useChartTheme";
import { getDonutColors } from "../palette";
import { donutStacked3Data } from "../data/mockData";
import PieShell from "../components/PieShell";

/**
 * Multi-color donut chart — 5 segments filling the full ring (yellow → teal
 * → light teal → blue → orange) with no track cell.
 */
export default function DonutVariantStacked3() {
  const theme = useChartTheme();
  const colors = getDonutColors(theme);

  return (
    <PieShell
      data={donutStacked3Data}
      cells={[
        { fill: colors.yellow },
        { fill: colors.teal },
        { fill: colors.tealLight },
        { fill: colors.blue },
        { fill: colors.orange },
      ]}
      innerRadius="60%"
    />
  );
}
