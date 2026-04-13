import { useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sidebar as ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Tooltip } from "react-tooltip";
import { cn } from "../../utils/cn";
import {
  getNavSections,
  getBottomItems,
  type NavItem,
  type NavSection,
} from "./navigationData";
import styles from "./Sidebar.module.scss";
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
  return <div className={styles.sidebarWrapper}>{children}</div>;
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
  return (
    <ProSidebar
      collapsed={isCollapsed}
      width="256px"
      collapsedWidth="80px"
      backgroundColor="var(--color-sidebar-bg)"
      className="border-none h-screen fixed left-0 top-0 z-40"
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
  return (
    <div className={cn(styles.navigationSection, "flex-1 overflow-y-auto")}>
      <div className="py-4">
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
            }),
          }}
        >
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {!isCollapsed && section.title && (
                <div className="px-6 mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-sidebar-section-header">
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
  if (!isCollapsed) return null;

  return (
    <Tooltip
      id="sidebar-tooltip"
      place="right"
      className="rounded-md py-2 px-3 text-sm font-medium bg-sidebar-tooltip-bg text-sidebar-tooltip shadow-lg z-[1070]"
      offset={12}
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
      // Theme button is handled in BottomSection
      if (itemId === "theme") {
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
    [allNavItems, navigate]
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
    <>
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
      </SidebarWrapper>

      {/* Tooltip for collapsed sidebar */}
      <SidebarTooltip isCollapsed={isCollapsed} />
    </>
  );
}
