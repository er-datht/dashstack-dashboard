import { useChartTheme } from "../useChartTheme";
import { getBarColors } from "../palette";
import { barStacked3Data } from "../data/mockData";
import BarShell from "../components/BarShell";

/**
 * 3-color stacked bar chart — three pink hues (base, mid, top). Only the top
 * series gets a rounded top-radius; base and mid render flat.
 */
export default function BarVariantStacked3() {
  const theme = useChartTheme();
  const colors = getBarColors(theme);

  return (
    <BarShell
      data={barStacked3Data}
      series={[
        {
          dataKey: "base",
          fill: colors.stacked3Base,
          stackId: "a",
          barSize: 12,
        },
        {
          dataKey: "mid",
          fill: colors.stacked3Mid,
          stackId: "a",
          barSize: 12,
        },
        {
          dataKey: "top",
          fill: colors.stacked3Top,
          stackId: "a",
          barSize: 12,
          radius: [4, 4, 0, 0],
        },
      ]}
    />
  );
}
