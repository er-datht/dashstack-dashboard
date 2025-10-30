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
        className="flex items-center justify-between p-4 h-[69px] border-b border-sidebar-border"
        role="banner"
      >
        {isCollapsed ? (
          <div className={cn("flex items-center", { "mr-1": isCollapsed })}>
            <span className="text-lg font-bold text-sidebar-logo-text">D</span>
            <span className="text-lg font-bold text-sidebar-logo-brand">S</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-xl font-bold text-sidebar-logo-text">
                Dash
              </span>
              <span className="text-xl font-bold text-sidebar-logo-brand">
                Stack
              </span>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "rounded-lg transition-colors cursor-pointer shrink-0 text-sidebar-logo-icon",
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
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default LogoSection;
