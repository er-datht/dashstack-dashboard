import { useChartTheme } from "../useChartTheme";
import { getBarColors } from "../palette";
import { barPlainData } from "../data/mockData";
import BarShell from "../components/BarShell";

/**
 * Plain blue bar chart — single series rendering varying-height bars.
 */
export default function BarVariantPlain() {
  const theme = useChartTheme();
  const colors = getBarColors(theme);

  return (
    <BarShell
      data={barPlainData}
      series={[
        {
          dataKey: "value",
          fill: colors.plainBlue,
          barSize: 12,
          radius: [4, 4, 0, 0],
        },
      ]}
    />
  );
}
