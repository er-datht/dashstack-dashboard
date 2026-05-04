import classnames from "classnames";

type TooltipEntry = {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
  payload?: { fill?: string; name?: string };
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
};

const formatLabel = (raw: string | number | undefined): string => {
  if (raw === undefined || raw === null) return "";
  const text = String(raw);
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export default function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const rows = payload.filter((entry) => {
    const name = entry.name ?? entry.payload?.name;
    return name !== "track";
  });

  if (rows.length === 0) return null;

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--spacing-3)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {rows.map((entry, index) => {
        const dotColor = entry.color ?? entry.payload?.fill ?? "currentColor";
        const label = formatLabel(entry.name ?? entry.dataKey);
        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-2)",
              marginBottom:
                index === rows.length - 1 ? 0 : "var(--spacing-1)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: dotColor,
                flexShrink: 0,
              }}
            />
            <span
              className={classnames("text-secondary")}
              style={{ fontSize: "var(--font-size-sm)" }}
            >
              {label}:
            </span>
            <span
              className={classnames("text-primary")}
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
