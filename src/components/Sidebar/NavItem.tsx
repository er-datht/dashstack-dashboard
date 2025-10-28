import { type LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

type NavItemProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
  isThemeButton?: boolean;
  onItemClick: (itemId: string) => void;
  onKeyDown: (e: React.KeyboardEvent, itemId: string) => void;
};

export default function NavItem({
  id,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
  isThemeButton = false,
  onItemClick,
  onKeyDown,
}: NavItemProps): React.JSX.Element {
  return (
    <li>
      <button
        data-nav-id={id}
        onClick={() => onItemClick(id)}
        onKeyDown={(e) => onKeyDown(e, id)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
          isActive && !isThemeButton
            ? "bg-sidebar-menu-active-bg text-sidebar-menu-active-text shadow-sm"
            : "text-sidebar-menu-inactive hover:bg-sidebar-menu-hover",
          isCollapsed && "justify-center"
        )}
        title={isCollapsed ? label : undefined}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
      </button>
    </li>
  );
}
