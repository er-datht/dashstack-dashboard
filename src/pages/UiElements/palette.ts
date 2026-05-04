import type { Theme } from "../../contexts/ThemeContext";

/**
 * Per-theme palette for the Bar Chart variants.
 *
 * Light theme values match the design screenshot's saturated brand hues.
 * Dark and forest themes nudge saturation/brightness so colors read against
 * their respective card backgrounds.
 */
export type BarPalette = {
  /** Variant a — single plain blue bars. */
  plainBlue: string;
  /** Variant b — base segment of the 2-color stack (teal). */
  stacked2Base: string;
  /** Variant b — top segment of the 2-color stack (light cyan). */
  stacked2Top: string;
  /** Variant c — first series of the grouped pair (purple). */
  groupedA: string;
  /** Variant c — second series of the grouped pair (orange). */
  groupedB: string;
  /** Variant d — base segment of the 3-color pink stack (lightest). */
  stacked3Base: string;
  /** Variant d — middle segment of the 3-color pink stack (mid). */
  stacked3Mid: string;
  /** Variant d — top segment of the 3-color pink stack (lightest pink/peach). */
  stacked3Top: string;
};

/**
 * Per-theme palette for the Pie Chart single-slice variants.
 *
 * Each pie renders one colored slice on a light track. The track color is
 * shared between pie and donut variants.
 */
export type PiePalette = {
  blue: string;
  purple: string;
  orange: string;
  /** Light lavender track shared with donuts. */
  track: string;
};

/**
 * Per-theme palette for the Donut Chart variants.
 */
export type DonutPalette = {
  teal: string;
  /** Lighter teal — used as a 5th segment in the multi-color donut. */
  tealLight: string;
  blue: string;
  yellow: string;
  orange: string;
  /** Light lavender track shared with pies. */
  track: string;
};

/**
 * Get bar chart colors for the active theme.
 */
export function getBarColors(theme: Theme): BarPalette {
  switch (theme) {
    case "dark":
      return {
        plainBlue: "#7B8AF0",
        stacked2Base: "#10B981",
        stacked2Top: "#5EEAD4",
        groupedA: "#A78BFA",
        groupedB: "#FB923C",
        stacked3Base: "#F472B6",
        stacked3Mid: "#EC4899",
        stacked3Top: "#FBCFE8",
      };
    case "forest":
      return {
        plainBlue: "#6366F1",
        stacked2Base: "#22D3EE",
        stacked2Top: "#5EEAD4",
        groupedA: "#A78BFA",
        groupedB: "#FB923C",
        stacked3Base: "#F472B6",
        stacked3Mid: "#EC4899",
        stacked3Top: "#FBCFE8",
      };
    default: // light
      return {
        plainBlue: "#5A6ACF",
        stacked2Base: "#10B981",
        stacked2Top: "#A7F3D0",
        groupedA: "#8B5CF6",
        groupedB: "#F97316",
        stacked3Base: "#F9A8D4",
        stacked3Mid: "#EC4899",
        stacked3Top: "#FBCFE8",
      };
  }
}

/**
 * Get pie chart colors for the active theme.
 */
export function getPieColors(theme: Theme): PiePalette {
  switch (theme) {
    case "dark":
      return {
        blue: "#7B8AF0",
        purple: "#A78BFA",
        orange: "#FB923C",
        track: "#1F2937",
      };
    case "forest":
      return {
        blue: "#6366F1",
        purple: "#A78BFA",
        orange: "#FB923C",
        track: "#14532D",
      };
    default: // light
      return {
        blue: "#5A6ACF",
        purple: "#8B5CF6",
        orange: "#F97316",
        track: "#EEF2FF",
      };
  }
}

/**
 * Get donut chart colors for the active theme.
 */
export function getDonutColors(theme: Theme): DonutPalette {
  switch (theme) {
    case "dark":
      return {
        teal: "#5EEAD4",
        tealLight: "#A7F3D0",
        blue: "#7B8AF0",
        yellow: "#FBBF24",
        orange: "#FB923C",
        track: "#1F2937",
      };
    case "forest":
      return {
        teal: "#22D3EE",
        tealLight: "#99F6E4",
        blue: "#6366F1",
        yellow: "#FBBF24",
        orange: "#FB923C",
        track: "#14532D",
      };
    default: // light
      return {
        teal: "#5DD3B0",
        tealLight: "#A7F3D0",
        blue: "#5A8DEE",
        yellow: "#F9D67A",
        orange: "#F08A5F",
        track: "#EEF2FF",
      };
  }
}
