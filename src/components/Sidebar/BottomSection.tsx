import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import type { NavItem } from "./navigationData";
import { THEME_COLORS, THEMES } from "../../constants/common";
import { Moon, Sun } from "lucide-react";
import styles from "./Sidebar.module.scss";
import { Menu } from "react-pro-sidebar";
import { isDarkTheme } from "../../utils/theme";
import { cn } from "../../utils/cn";
/**
 * Bottom section with theme-aware menu item styles and dynamic theme button
 */
type BottomSectionProps = {
  bottomItems: NavItem[];
  renderMenuItem: (item: NavItem) => React.ReactNode;
};

const BottomSection = ({
  bottomItems,
  renderMenuItem,
}: BottomSectionProps): React.JSX.Element => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Override the theme item with dynamic icon and label based on current theme
  const itemsWithDynamicTheme = bottomItems.map((item) => {
    if (item.id === "theme") {
      return {
        ...item,
        label:
          theme === THEMES.DARK
            ? t("settings:lightMode")
            : t("settings:darkMode"),
        icon: theme === THEMES.DARK ? Sun : Moon,
      };
    }
    return item;
  });

  return (
    <div className={cn(styles.bottomSection, "shrink-0")}>
      <div className="border-t border-gray-200 dark:border-gray-700 py-3">
        <Menu
          menuItemStyles={{
            button: ({ active }) => ({
              backgroundColor: active
                ? isDarkTheme(theme)
                  ? THEME_COLORS.PRIMARY_LIGHT
                  : THEME_COLORS.PRIMARY_DARK
                : "transparent",
              color: active
                ? THEME_COLORS.SURFACE
                : isDarkTheme(theme)
                ? THEME_COLORS.GRAY[300]
                : THEME_COLORS.GRAY[700],
              "&:hover": {
                backgroundColor: active
                  ? isDarkTheme(theme)
                    ? THEME_COLORS.PRIMARY_LIGHT
                    : THEME_COLORS.PRIMARY_DARK
                  : isDarkTheme(theme)
                  ? THEME_COLORS.GRAY[700]
                  : THEME_COLORS.GRAY[200],
                color: active
                  ? THEME_COLORS.SURFACE
                  : isDarkTheme(theme)
                  ? THEME_COLORS.GRAY[300]
                  : THEME_COLORS.GRAY[700],
              },
              borderRadius: "8px",
              margin: "4px 12px",
              padding: "10px 12px",
            }),
          }}
        >
          {itemsWithDynamicTheme.map(renderMenuItem)}
        </Menu>
      </div>
    </div>
  );
};

export default BottomSection;
