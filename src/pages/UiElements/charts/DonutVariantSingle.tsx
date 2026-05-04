import { useChartTheme } from "../useChartTheme";
import { getDonutColors } from "../palette";
import { donutSingleData } from "../data/mockData";
import PieShell from "../components/PieShell";

type DonutVariantSingleProps = {
  /** Hex color for the filled arc. */
  color: string;
  /** Filled portion as a percentage (0–100). */
  value: number;
};

/**
 * Single-color donut chart on a light track. Reused for the teal and blue
 * donut variants by passing different colors.
 */
export default function DonutVariantSingle({
  color,
  value,
}: DonutVariantSingleProps) {
  const theme = useChartTheme();
  const colors = getDonutColors(theme);

  return (
    <PieShell
      data={donutSingleData(value)}
      cells={[{ fill: color }, { fill: colors.track }]}
      innerRadius="60%"
    />
  );
}
