import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartTooltip from "./ChartTooltip";

export type PieCell = {
  /** Resolved hex color for this cell. */
  fill: string;
};

export type PieShellProps = {
  data: ReadonlyArray<{ name: string; value: number }>;
  cells: ReadonlyArray<PieCell>;
  /**
   * Inner radius percentage (e.g. `"60%"`). Omit for a solid pie; pass for a
   * donut. When omitted the rendered Pie has no `innerRadius` prop so recharts
   * treats it as 0 (solid pie).
   */
  innerRadius?: string;
};

/**
 * Shared pie/donut chart shell — owns the recharts container, chart wrapper,
 * tooltip wiring, and the `<Pie>` element with all fixed render props
 * (`cx`, `cy`, `outerRadius`, `startAngle`, `endAngle`, `stroke`,
 * `isAnimationActive`). Variants declare only `data` + `cells` (+ optional
 * `innerRadius` for donuts).
 *
 * Cells render in declaration order — variants are responsible for the full
 * cell list including any track cell. The shell never auto-appends a track,
 * so variants like `DonutVariantStacked3` that render no track work as
 * authored.
 */
export default function PieShell({
  data,
  cells,
  innerRadius,
}: PieShellProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Tooltip content={<ChartTooltip />} />
        <Pie
          data={data as { name: string; value: number }[]}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="85%"
          startAngle={90}
          endAngle={-270}
          stroke="none"
          isAnimationActive={false}
          {...(innerRadius !== undefined && { innerRadius })}
        >
          {cells.map((cell, index) => (
            <Cell key={index} fill={cell.fill} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
