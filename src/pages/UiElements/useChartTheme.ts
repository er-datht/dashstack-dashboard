import { useContext } from "react";
import { ThemeContext, type Theme } from "../../contexts/ThemeContext";

/**
 * Resolve the active theme for chart palette lookups.
 *
 * Unlike `useTheme()`, this hook does not throw when no `ThemeProvider` is
 * present in the tree — it falls back to the `light` theme. This keeps the
 * UI Elements chart components renderable in isolation (e.g. unit tests
 * that render a single section without wrapping it in app providers), while
 * still picking up the active theme inside the running app where the
 * provider is present.
 *
 * The fallback is safe because chart palettes are purely visual; there is no
 * functional behavior tied to the resolved theme value.
 */
export function useChartTheme(): Theme {
  const context = useContext(ThemeContext);
  return context?.theme ?? "light";
}
