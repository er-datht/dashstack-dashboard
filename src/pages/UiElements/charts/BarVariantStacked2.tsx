import { useChartTheme } from "../useChartTheme";
import { getBarColors } from "../palette";
import { barStacked2Data } from "../data/mockData";
import BarShell from "../components/BarShell";

/**
 * 2-color stacked bar chart — teal base + light cyan top.
 */
export default function BarVariantStacked2() {
  const theme = useChartTheme();
  const colors = getBarColors(theme);

  return (
    <BarShell
      data={barStacked2Data}
      series={[
        {
          dataKey: "base",
          fill: colors.stacked2Base,
          stackId: "a",
          barSize: 12,
        },
        {
          dataKey: "top",
          fill: colors.stacked2Top,
          stackId: "a",
          barSize: 12,
          radius: [4, 4, 0, 0],
        },
      ]}
    />
  );
}
