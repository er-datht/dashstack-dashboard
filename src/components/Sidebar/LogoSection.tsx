import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";
import styles from "./Sidebar.module.scss";

/**
 * Logo section with collapse/expand toggle button
 */
type LogoSectionProps = {
  isCollapsed: boolean;
  onToggle: () => void;
};

const LogoSection = ({
  isCollapsed,
  onToggle,
}: LogoSectionProps): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className={cn(styles.logoSection, "shrink-0")}>
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
          onClick={onToggle}
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
    </div>
  );
};

export default LogoSection;
