import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { NavItem } from "./navigationData";
import { Moon, Sun, TreePine, Check } from "lucide-react";
import styles from "./Sidebar.module.scss";
import { Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme";
import type { Theme } from "../../contexts/ThemeContext";

/**
 * Bottom section with theme-aware menu item styles and theme submenu
 */
type BottomSectionProps = {
  bottomItems: NavItem[];
  renderMenuItem: (item: NavItem) => React.ReactNode;
};

const BottomSection = ({
  bottomItems,
  renderMenuItem,
}: BottomSectionProps): React.JSX.Element => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Get theme icon
  const getThemeIcon = (themeName: Theme) => {
    switch (themeName) {
      case "dark":
        return Moon;
      case "forest":
        return TreePine;
      default:
        return Sun;
    }
  };

  // Get theme label
  const getThemeLabel = (themeName: Theme) => {
    switch (themeName) {
      case "dark":
        return t("settings:darkMode", "Dark");
      case "forest":
        return t("settings:forestMode", "Forest");
      default:
        return t("settings:lightMode", "Light");
    }
  };

  const CurrentThemeIcon = getThemeIcon(theme);

  // Filter out the theme item from bottomItems and render them normally
  const nonThemeItems = bottomItems.filter((item) => item.id !== "theme");

  const handleThemeSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
  };

  return (
    <div className={cn(styles.bottomSection, "shrink-0")}>
      <div className="py-3 border-t border-sidebar-border">
        <Menu
          menuItemStyles={{
            button: ({ active }) => ({
              backgroundColor: active
                ? "var(--color-sidebar-menu-active-bg)"
                : "transparent",
              color: active
                ? "var(--color-sidebar-menu-active-text)"
                : "var(--color-sidebar-menu-inactive-text)",
              "&:hover": {
                backgroundColor: active
                  ? "var(--color-sidebar-menu-active-bg)"
                  : "var(--color-sidebar-menu-hover-bg)",
                color: active
                  ? "var(--color-sidebar-menu-active-text)"
                  : "var(--color-sidebar-menu-inactive-text)",
              },
              borderRadius: "8px",
              margin: "4px 12px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
            }),
            subMenuContent: {
              backgroundColor: "var(--color-sidebar-submenu-bg)",
            },
            SubMenuExpandIcon: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            label: {
              display: "flex",
              alignItems: "center",
            },
            icon: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
          {/* Theme SubMenu */}
          <SubMenu
            icon={<CurrentThemeIcon className="w-5 h-5" />}
            label={t("settings:theme", "Theme")}
            data-tooltip-id={!isThemeMenuOpen ? "sidebar-tooltip" : undefined}
            data-tooltip-content={
              !isThemeMenuOpen ? t("settings:theme", "Theme") : undefined
            }
            onOpenChange={setIsThemeMenuOpen}
          >
            {(["light", "dark", "forest"] as Theme[]).map((themeName) => {
              const ThemeIcon = getThemeIcon(themeName);
              const isActive = theme === themeName;

              return (
                <MenuItem
                  key={themeName}
                  icon={<ThemeIcon className="w-4 h-4" />}
                  active={isActive}
                  onClick={() => handleThemeSelect(themeName)}
                  suffix={isActive ? <Check className="w-4 h-4" /> : undefined}
                >
                  {getThemeLabel(themeName)}
                </MenuItem>
              );
            })}
          </SubMenu>
          {nonThemeItems.map(renderMenuItem)}
        </Menu>
      </div>
    </div>
  );
};

export default BottomSection;
