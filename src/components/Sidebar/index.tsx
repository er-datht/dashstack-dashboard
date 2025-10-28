import { useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sidebar as ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Tooltip } from "react-tooltip";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../utils/cn";
import { THEMES, THEME_COLORS } from "../../constants/common";
import {
  getNavSections,
  getBottomItems,
  type NavItem,
  type NavSection,
} from "./navigationData";
import styles from "./Sidebar.module.scss";
import { isDarkTheme } from "../../utils/theme";
import BottomSection from "./BottomSection";
import LogoSection from "./LogoSection";

type SidebarProps = {
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

/**
 * Wrapper component that applies theme-specific classes to the sidebar
 */
const SidebarWrapper = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(styles.sidebarWrapper, { "dark-mode": isDarkTheme(theme) })}
    >
      {children}
    </div>
  );
};

/**
 * ProSidebar container with theme-based background color
 */
type SidebarContainerProps = {
  children: React.ReactNode;
  isCollapsed: boolean;
};

const SidebarContainer = ({
  children,
  isCollapsed,
}: SidebarContainerProps): React.JSX.Element => {
  const { theme } = useTheme();

  return (
    <ProSidebar
      collapsed={isCollapsed}
      width="256px"
      collapsedWidth="80px"
      backgroundColor={
        isDarkTheme(theme) ? THEME_COLORS.NAV_DARK : THEME_COLORS.NAV
      }
      rootStyles={{
        border: "none",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 40,
      }}
    >
      {children}
    </ProSidebar>
  );
};

/**
 * Navigation section with theme-aware menu item styles
 */
type NavigationSectionProps = {
  navSections: NavSection[];
  isCollapsed: boolean;
  renderMenuItem: (item: NavItem) => React.ReactNode;
};

const NavigationSection = ({
  navSections,
  isCollapsed,
  renderMenuItem,
}: NavigationSectionProps): React.JSX.Element => {
  const { theme } = useTheme();

  return (
    <div className={cn(styles.navigationSection, "flex-1 overflow-y-auto")}>
      <div className="py-4">
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
    </div>
  );
};

/**
 * Tooltip component with theme-aware styling
 */
const SidebarTooltip = ({
  isCollapsed,
}: {
  isCollapsed: boolean;
}): React.JSX.Element | null => {
  const { theme } = useTheme();

  if (!isCollapsed) return null;

  return (
    <Tooltip
      id="sidebar-tooltip"
      place="right"
      className={cn(
        "border-14px rounded-md py-2 px-3 text-sm font-medium z-1000",
        {
          "bg-gray-700!": isDarkTheme(theme),
          "bg-gray-800!": !isDarkTheme(theme),
          "text-gray-50!": isDarkTheme(theme),
          "text-surface!": !isDarkTheme(theme),
        }
      )}
      variant={theme === THEMES.DARK ? "light" : "dark"}
      offset={12}
      style={{
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    />
  );
};

export default function Sidebar({
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
}: SidebarProps): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const { toggleTheme } = useTheme();

  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggle = useCallback((): void => {
    const newCollapsed = !isCollapsed;
    setInternalCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  const navSections = useMemo<NavSection[]>(() => getNavSections(t), [t]);

  const bottomItems = useMemo<NavItem[]>(() => getBottomItems(t), [t]);

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
    <SidebarWrapper>
      <SidebarContainer isCollapsed={isCollapsed}>
        <div
          className={cn(styles.sidebarContentWrapper, "flex flex-col h-full")}
        >
          {/* Logo Section */}
          <LogoSection isCollapsed={isCollapsed} onToggle={handleToggle} />

          {/* Navigation Sections */}
          <NavigationSection
            navSections={navSections}
            isCollapsed={isCollapsed}
            renderMenuItem={renderMenuItem}
          />

          {/* Bottom Section */}
          <BottomSection
            bottomItems={bottomItems}
            renderMenuItem={renderMenuItem}
          />
        </div>
      </SidebarContainer>

      {/* Tooltip for collapsed sidebar */}
      <SidebarTooltip isCollapsed={isCollapsed} />
    </SidebarWrapper>
  );
}
