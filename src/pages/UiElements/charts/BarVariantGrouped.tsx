import { useChartTheme } from "../useChartTheme";
import { getBarColors } from "../palette";
import { barGroupedData } from "../data/mockData";
import BarShell from "../components/BarShell";

/**
 * Grouped bar chart — two side-by-side series (purple + orange) at each x.
 *
 * Note: no `stackId` and no `barSize` on either series — recharts default
 * grouped sizing keeps the side-by-side layout proportionate.
 */
export default function BarVariantGrouped() {
  const theme = useChartTheme();
  const colors = getBarColors(theme);

  return (
    <BarShell
      data={barGroupedData}
      series={[
        {
          dataKey: "a",
          fill: colors.groupedA,
          radius: [4, 4, 0, 0],
        },
        {
          dataKey: "b",
          fill: colors.groupedB,
          radius: [4, 4, 0, 0],
        },
      ]}
    />
  );
}
