import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings,
  Calendar,
  User,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../utils/cn";

type NotificationDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NotificationItem = {
  key: string;
  titleKey: string;
  descriptionKey: string;
  Icon: LucideIcon;
  iconBgClass: string;
};

const notifications: NotificationItem[] = [
  {
    key: "settings",
    titleKey: "navigation:notifications.items.settings.title",
    descriptionKey: "navigation:notifications.items.settings.description",
    Icon: Settings,
    iconBgClass: "bg-notification-icon-settings",
  },
  {
    key: "eventUpdate",
    titleKey: "navigation:notifications.items.eventUpdate.title",
    descriptionKey: "navigation:notifications.items.eventUpdate.description",
    Icon: Calendar,
    iconBgClass: "bg-notification-icon-event",
  },
  {
    key: "profile",
    titleKey: "navigation:notifications.items.profile.title",
    descriptionKey: "navigation:notifications.items.profile.description",
    Icon: User,
    iconBgClass: "bg-notification-icon-profile",
  },
  {
    key: "applicationError",
    titleKey: "navigation:notifications.items.applicationError.title",
    descriptionKey:
      "navigation:notifications.items.applicationError.description",
    Icon: AlertCircle,
    iconBgClass: "bg-notification-icon-error",
  },
];

const NotificationDropdown = ({
  isOpen,
  onClose,
}: NotificationDropdownProps): React.JSX.Element => {
  const { t } = useTranslation();
  const [toast, setToast] = useState<string | null>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast]);

  const handlePlaceholder = () => {
    onClose();
    setToast(t("navigation:userMenu.comingSoon"));
  };

  return (
    <>
      {isOpen && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-full mt-2 w-[320px] rounded-[14px] shadow-lg z-50",
            "bg-usermenu-bg border border-usermenu-border",
            "animate-usermenu-enter"
          )}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-usermenu-separator">
            <span className="text-sm font-medium text-usermenu-text">
              {t("navigation:notifications.title")}
            </span>
          </div>

          {/* Notification items */}
          {notifications.map((item) => {
            const { Icon } = item;
            return (
              <button
                key={item.key}
                role="menuitem"
                onClick={handlePlaceholder}
                className={cn(
                  "w-full flex items-center gap-3 p-[18px] text-left",
                  "transition-colors cursor-pointer",
                  "hover:bg-usermenu-hover"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                    item.iconBgClass
                  )}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-usermenu-text leading-tight">
                    {t(item.titleKey)}
                  </p>
                  <p className="text-xs text-topnav-text-secondary truncate mt-1">
                    {t(item.descriptionKey)}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Footer */}
          <button
            role="menuitem"
            onClick={handlePlaceholder}
            className={cn(
              "w-full px-5 py-3.5 border-t border-usermenu-separator",
              "text-center text-sm text-topnav-text-secondary",
              "transition-colors cursor-pointer",
              "hover:bg-usermenu-hover rounded-b-[14px]"
            )}
          >
            {t("navigation:notifications.seeAll")}
          </button>
        </div>
      )}

      {/* Toast notification - rendered outside isOpen guard so it stays visible after menu closes */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-lg shadow-lg bg-usermenu-bg text-usermenu-text border border-usermenu-border text-sm">
          {toast}
        </div>
      )}
    </>
  );
};

export default NotificationDropdown;
