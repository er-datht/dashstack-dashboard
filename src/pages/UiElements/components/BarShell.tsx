import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartTooltip from "./ChartTooltip";

export type BarSeries = {
  /** Key in the data record this bar reads from. */
  dataKey: string;
  /** Resolved hex color for this series. */
  fill: string;
  /** Stack identifier — omit for grouped (side-by-side) bars. */
  stackId?: string;
  /** Per-bar width in pixels — omit to use recharts' default grouped sizing. */
  barSize?: number;
  /** Per-corner radius `[topLeft, topRight, bottomRight, bottomLeft]`. */
  radius?: [number, number, number, number];
};

export type BarShellProps = {
  data: ReadonlyArray<Record<string, unknown>>;
  series: ReadonlyArray<BarSeries>;
};

/**
 * Shared bar chart shell — owns the recharts container, chart wrapper, hidden
 * axes, and tooltip wiring. Variants declare only `data` + `series` and
 * delegate render to this shell so the per-variant body stays focused on the
 * meaningful differences (series shape, colors, optional radius/barSize).
 *
 * Optional series props (`stackId`, `barSize`, `radius`) are forwarded only
 * when defined to preserve recharts' default behavior when omitted (e.g.
 * grouped variant has no `barSize` so default grouped sizing applies).
 */
export default function BarShell({ data, series }: BarShellProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data as Record<string, unknown>[]}>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={<ChartTooltip />}
        />
        {series.map((s, index) => (
          <Bar
            key={`${s.dataKey}-${index}`}
            dataKey={s.dataKey}
            fill={s.fill}
            {...(s.stackId !== undefined && { stackId: s.stackId })}
            {...(s.barSize !== undefined && { barSize: s.barSize })}
            {...(s.radius !== undefined && { radius: s.radius })}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
