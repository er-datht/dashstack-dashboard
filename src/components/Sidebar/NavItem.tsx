import { type LucideIcon } from "lucide-react";

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
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
          isActive && !isThemeButton
            ? "bg-blue-600 dark:bg-blue-500 text-white shadow-sm"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        } ${isCollapsed ? "justify-center" : ""}`}
        title={isCollapsed ? label : undefined}
      >
        <Icon
          className={`w-5 h-5 shrink-0 ${
            isActive && !isThemeButton
              ? "text-white"
              : "text-gray-600 dark:text-gray-400"
          }`}
        />
        {!isCollapsed && (
          <span
            className={`text-sm font-medium ${
              isActive && !isThemeButton
                ? "text-white"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {label}
          </span>
        )}
      </button>
    </li>
  );
}
