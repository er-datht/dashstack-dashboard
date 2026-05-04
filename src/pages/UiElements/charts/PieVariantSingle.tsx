import { useChartTheme } from "../useChartTheme";
import { getPieColors } from "../palette";
import { pieData } from "../data/mockData";
import PieShell from "../components/PieShell";

type PieVariantSingleProps = {
  /** Hex color for the filled slice. */
  color: string;
  /** Filled portion as a percentage (0–100). */
  value: number;
};

/**
 * Single-slice pie chart on a light track. Used four times across the Pie
 * Chart section with different colors and proportions.
 */
export default function PieVariantSingle({
  color,
  value,
}: PieVariantSingleProps) {
  const theme = useChartTheme();
  const colors = getPieColors(theme);

  return (
    <PieShell
      data={pieData(value)}
      cells={[{ fill: color }, { fill: colors.track }]}
    />
  );
}
