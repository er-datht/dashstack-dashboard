import { useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Sidebar as ProSidebar,
  Menu,
  MenuItem,
} from "react-pro-sidebar";
import { Tooltip } from "react-tooltip";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../utils/cn";
import { THEMES } from "../../constants/common";
import {
  getNavSections,
  getBottomItems,
  type NavItem,
  type NavSection,
} from "./navigationData";
import "./sidebar-custom.scss";
import "react-tooltip/dist/react-tooltip.css";

type SidebarProps = {
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

export default function Sidebar({
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
}: SidebarProps): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggle = useCallback((): void => {
    const newCollapsed = !isCollapsed;
    setInternalCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  const navSections = useMemo<NavSection[]>(() => getNavSections(t), [t]);

  const bottomItems = useMemo<NavItem[]>(
    () => getBottomItems(t, theme),
    [t, theme]
  );

  // Combine all navigation items for unified keyboard navigation
  const allNavItems = useMemo(() => {
    const mainItems = navSections.flatMap((section) => section.items);
    return [...mainItems, ...bottomItems];
  }, [navSections, bottomItems]);

  // Derive active item from current route
  const activeItemId = useMemo(() => {
    const currentPath = location.pathname;
    const activeItem = allNavItems.find((item) => item.route === currentPath);
    return activeItem?.id || "dashboard";
  }, [location.pathname, allNavItems]);

  const handleItemClick = useCallback(
    (itemId: string): void => {
      if (itemId === "theme") {
        toggleTheme();
        return;
      }

      // Find the item and navigate to its route
      const item = allNavItems.find((navItem) => navItem.id === itemId);
      if (item?.route) {
        navigate(item.route);
      } else {
        // For items without routes, show a console warning in development
        if (import.meta.env.DEV) {
          console.warn(
            `Navigation item "${itemId}" does not have a route configured yet.`
          );
        }
      }
    },
    [allNavItems, navigate, toggleTheme]
  );

  // Render menu item with active state and icon
  const renderMenuItem = useCallback(
    (item: NavItem) => {
      const isActive = activeItemId === item.id;
      const isThemeButton = item.id === "theme";
      const Icon = item.icon;

      return (
        <MenuItem
          key={item.id}
          active={isActive && !isThemeButton}
          icon={<Icon className="w-5 h-5" />}
          onClick={() => handleItemClick(item.id)}
          className={cn({
            "theme-button": isThemeButton,
          })}
          data-tooltip-id={isCollapsed ? "sidebar-tooltip" : undefined}
          data-tooltip-content={isCollapsed ? item.label : undefined}
        >
          {item.label}
        </MenuItem>
      );
    },
    [activeItemId, handleItemClick, isCollapsed]
  );

  return (
    <div className={cn("sidebar-wrapper", { "dark-mode": theme === THEMES.DARK })}>
      <ProSidebar
        collapsed={isCollapsed}
        width="256px"
        collapsedWidth="80px"
        backgroundColor={theme === THEMES.DARK ? "#15171d" : "#ffffff"}
        rootStyles={{
          border: "none",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Logo Section */}
        <div
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-[69px]"
          role="banner"
        >
          {isCollapsed ? (
            <div className={cn("flex items-center", { "mr-1": isCollapsed })}>
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                D
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                S
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Dash
                </span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  Stack
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleToggle}
            className={cn(
              "rounded-lg transition-colors cursor-pointer shrink-0",
              {
                "p-1": isCollapsed,
                "p-2": !isCollapsed,
              }
            )}
            aria-label={
              isCollapsed
                ? t("navigation.expandSidebar", "Expand sidebar")
                : t("navigation.collapseSidebar", "Collapse sidebar")
            }
            aria-expanded={!isCollapsed}
            aria-controls="sidebar-navigation"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4">
          <Menu
            menuItemStyles={{
              button: ({ active }) => ({
                backgroundColor: active
                  ? theme === THEMES.DARK
                    ? "#3b82f6"
                    : "#2563eb"
                  : "transparent",
                color: active
                  ? "#ffffff"
                  : theme === THEMES.DARK
                  ? "#d1d5db"
                  : "#374151",
                "&:hover": {
                  backgroundColor: active
                    ? theme === THEMES.DARK
                      ? "#3b82f6"
                      : "#2563eb"
                    : theme === THEMES.DARK
                    ? "#374151"
                    : "#e5e7eb",
                  color: active
                    ? "#ffffff"
                    : theme === THEMES.DARK
                    ? "#d1d5db"
                    : "#374151",
                },
                borderRadius: "8px",
                margin: "4px 12px",
                padding: "10px 12px",
              }),
            }}
          >
            {navSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {!isCollapsed && section.title && (
                  <div className="px-6 mb-2 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                )}
                {section.items.map(renderMenuItem)}
              </div>
            ))}
          </Menu>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 py-3">
          <Menu
            menuItemStyles={{
              button: ({ active }) => ({
                backgroundColor: active
                  ? theme === THEMES.DARK
                    ? "#3b82f6"
                    : "#2563eb"
                  : "transparent",
                color: active
                  ? "#ffffff"
                  : theme === THEMES.DARK
                  ? "#d1d5db"
                  : "#374151",
                "&:hover": {
                  backgroundColor: active
                    ? theme === THEMES.DARK
                      ? "#3b82f6"
                      : "#2563eb"
                    : theme === THEMES.DARK
                    ? "#374151"
                    : "#e5e7eb",
                  color: active
                    ? "#ffffff"
                    : theme === THEMES.DARK
                    ? "#d1d5db"
                    : "#374151",
                },
                borderRadius: "8px",
                margin: "4px 12px",
                padding: "10px 12px",
              }),
            }}
          >
            {bottomItems.map(renderMenuItem)}
          </Menu>
        </div>
      </ProSidebar>

      {/* Tooltip for collapsed sidebar */}
      {isCollapsed && (
        <Tooltip
          id="sidebar-tooltip"
          place="right"
          variant={theme === THEMES.DARK ? "light" : "dark"}
          offset={12}
          style={{
            backgroundColor: theme === THEMES.DARK ? "#374151" : "#1f2937",
            color: theme === THEMES.DARK ? "#f9fafb" : "#ffffff",
            borderRadius: "6px",
            padding: "8px 12px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            zIndex: 1000,
          }}
        />
      )}
    </div>
  );
}
