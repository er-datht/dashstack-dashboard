import { useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import classNames from "classnames";
import { useTheme } from "../../contexts/ThemeContext";
import { cn } from "../../utils";
import NavItemComponent from "./NavItem";
import {
  getNavSections,
  getBottomItems,
  type NavItem,
  type NavSection,
} from "./navigationData";

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, itemId: string): void => {
      const currentIndex = allNavItems.findIndex((item) => item.id === itemId);
      let nextIndex: number;
      let nextItem: NavItem | undefined;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          nextIndex = (currentIndex + 1) % allNavItems.length;
          nextItem = allNavItems[nextIndex];
          document
            .querySelector<HTMLButtonElement>(`[data-nav-id="${nextItem.id}"]`)
            ?.focus();
          break;

        case "ArrowUp":
          e.preventDefault();
          nextIndex =
            (currentIndex - 1 + allNavItems.length) % allNavItems.length;
          nextItem = allNavItems[nextIndex];
          document
            .querySelector<HTMLButtonElement>(`[data-nav-id="${nextItem.id}"]`)
            ?.focus();
          break;

        case "Home":
          e.preventDefault();
          nextItem = allNavItems[0];
          document
            .querySelector<HTMLButtonElement>(`[data-nav-id="${nextItem.id}"]`)
            ?.focus();
          break;

        case "End":
          e.preventDefault();
          nextItem = allNavItems[allNavItems.length - 1];
          document
            .querySelector<HTMLButtonElement>(`[data-nav-id="${nextItem.id}"]`)
            ?.focus();
          break;
      }
    },
    [allNavItems]
  );

  // Reusable NavItem render function
  const renderNavItem = useCallback(
    (item: NavItem) => {
      const isActive = activeItemId === item.id;
      const isThemeButton = item.id === "theme";

      return (
        <NavItemComponent
          key={item.id}
          id={item.id}
          label={item.label}
          icon={item.icon}
          isActive={isActive}
          isCollapsed={isCollapsed}
          isThemeButton={isThemeButton}
          onItemClick={handleItemClick}
          onKeyDown={handleKeyDown}
        />
      );
    },
    [activeItemId, isCollapsed, handleItemClick, handleKeyDown]
  );

  return (
    <aside
      aria-label="Main navigation"
      role="complementary"
      className={classNames(
        "fixed left-0 top-0 h-screen bg-[#f8f9fc] dark:bg-[#1a1d24] border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out z-40",
        {
          "w-20": isCollapsed,
          "w-64": !isCollapsed,
        }
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-[69px]"
          role="banner"
        >
          {isCollapsed ? (
            <div
              className={cn("flex items-center", {
                "mr-1": isCollapsed,
              })}
            >
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
        <nav
          id="sidebar-navigation"
          aria-label="Primary navigation"
          className="flex-1 overflow-y-auto py-4 px-3"
        >
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {!isCollapsed && section.title && (
                <h3
                  id={`nav-section-${sectionIndex}`}
                  className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {section.title}
                </h3>
              )}
              <ul
                className="space-y-1"
                aria-labelledby={
                  !isCollapsed && section.title
                    ? `nav-section-${sectionIndex}`
                    : undefined
                }
              >
                {section.items.map(renderNavItem)}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <nav
          aria-label="Secondary navigation"
          className="border-t border-gray-200 dark:border-gray-700 p-3"
        >
          <ul className="space-y-1">{bottomItems.map(renderNavItem)}</ul>
        </nav>
      </div>
    </aside>
  );
}
