/**
 * Hard-coded mock data for every UI Elements chart variant.
 * Decoupling data from JSX makes proportions easy to tweak without touching
 * chart rendering logic.
 */

// ───────────────────────── Bar charts ─────────────────────────

export const barPlainData = [
  { name: "A", value: 60 },
  { name: "B", value: 80 },
  { name: "C", value: 45 },
  { name: "D", value: 90 },
  { name: "E", value: 55 },
  { name: "F", value: 70 },
];

export const barStacked2Data = [
  { name: "A", base: 30, top: 50 },
  { name: "B", base: 45, top: 35 },
  { name: "C", base: 25, top: 60 },
  { name: "D", base: 50, top: 40 },
  { name: "E", base: 35, top: 55 },
  { name: "F", base: 40, top: 45 },
];

export const barGroupedData = [
  { name: "A", a: 40, b: 60 },
  { name: "B", a: 70, b: 45 },
  { name: "C", a: 55, b: 75 },
  { name: "D", a: 35, b: 65 },
  { name: "E", a: 60, b: 50 },
];

export const barStacked3Data = [
  { name: "A", base: 25, mid: 35, top: 30 },
  { name: "B", base: 30, mid: 40, top: 20 },
  { name: "C", base: 20, mid: 30, top: 40 },
  { name: "D", base: 35, mid: 25, top: 35 },
  { name: "E", base: 25, mid: 35, top: 30 },
  { name: "F", base: 30, mid: 30, top: 25 },
];

// ───────────────────────── Pie charts ─────────────────────────

/**
 * Build a 2-slice dataset for a single-slice pie:
 * one filled slice + one track slice that adds up to 100.
 */
export function pieData(filledPct: number) {
  const filled = Math.max(0, Math.min(100, filledPct));
  return [
    { name: "filled", value: filled },
    { name: "track", value: 100 - filled },
  ];
}

// ───────────────────────── Donut charts ─────────────────────────

/**
 * Single-color donut data — alias for pieData since the structure is the
 * same; the variant differentiator is the inner radius on the rendering side.
 */
export const donutSingleData = pieData;

/**
 * 2-color donut: yellow + teal slices on a light track.
 * Values sum to 100 across all three slices.
 */
export const donutStacked2Data = [
  { name: "yellow", value: 30 },
  { name: "teal", value: 25 },
  { name: "track", value: 45 },
];

/**
 * Multi-color donut: 5 segments filling the full ring (no track).
 * Order matches the design clockwise from 12 o'clock: yellow → teal →
 * tealLight → blue → orange.
 */
export const donutStacked3Data = [
  { name: "yellow", value: 12 },
  { name: "teal", value: 42 },
  { name: "tealLight", value: 10 },
  { name: "blue", value: 22 },
  { name: "orange", value: 14 },
];
