import { useChartTheme } from "../useChartTheme";
import { getDonutColors } from "../palette";
import { donutStacked2Data } from "../data/mockData";
import PieShell from "../components/PieShell";

/**
 * 2-color donut chart — yellow + teal slices on a light track.
 */
export default function DonutVariantStacked2() {
  const theme = useChartTheme();
  const colors = getDonutColors(theme);

  return (
    <PieShell
      data={donutStacked2Data}
      cells={[
        { fill: colors.yellow },
        { fill: colors.teal },
        { fill: colors.track },
      ]}
      innerRadius="60%"
    />
  );
}
