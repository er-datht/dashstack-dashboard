import type { ReactNode } from "react";

export type ChartSectionProps = {
  /** Section heading text — typically a translated string. */
  title: string;
  /** Chart variant components to render inside the responsive grid. */
  children: ReactNode;
};

/**
 * Shared section wrapper for the UI Elements chart gallery — renders a
 * `card`-class section with a heading and a 4-column responsive grid
 * (1 col mobile / 2 col tablet / 4 col desktop). Section components pass
 * their ordered chart variants as children.
 */
export default function ChartSection({ title, children }: ChartSectionProps) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold text-primary mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </section>
  );
}
