import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { appConfig } from "../../configs/app-config";
import { ROUTES } from "../../routes/routes";

import manageAccountIcon from "../../assets/icons/manage-account.svg";
import changePasswordIcon from "../../assets/icons/change-password.svg";
import activityLogIcon from "../../assets/icons/activity-log.svg";
import logOutIcon from "../../assets/icons/log-out.svg";

type UserMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

type MenuItem = {
  key: string;
  labelKey: string;
  icon: string;
  action: "placeholder" | "logout";
};

const menuItems: MenuItem[] = [
  {
    key: "manageAccount",
    labelKey: "navigation:userMenu.manageAccount",
    icon: manageAccountIcon,
    action: "placeholder",
  },
  {
    key: "changePassword",
    labelKey: "navigation:userMenu.changePassword",
    icon: changePasswordIcon,
    action: "placeholder",
  },
  {
    key: "activityLog",
    labelKey: "navigation:userMenu.activityLog",
    icon: activityLogIcon,
    action: "placeholder",
  },
  {
    key: "logOut",
    labelKey: "navigation:userMenu.logOut",
    icon: logOutIcon,
    action: "logout",
  },
];

export default function UserMenu({
  isOpen,
  onClose,
}: UserMenuProps): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    localStorage.removeItem(appConfig.auth.tokenKey);
    localStorage.removeItem(appConfig.auth.refreshTokenKey);
    navigate(ROUTES.LOGIN);
    onClose();
  };

  const handlePlaceholder = () => {
    onClose();
    setToast(t("navigation:userMenu.comingSoon"));
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.action === "logout") {
      handleLogout();
    } else {
      handlePlaceholder();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-full mt-2 w-[220px] rounded-[14px] shadow-lg z-50",
            "bg-usermenu-bg border border-usermenu-border",
            "animate-usermenu-enter"
          )}
        >
          {menuItems.map((item, index) => (
            <button
              key={item.key}
              role="menuitem"
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center gap-3 p-[18px] text-left text-sm",
                "text-usermenu-text transition-colors cursor-pointer",
                "hover:bg-usermenu-hover",
                {
                  "border-b border-usermenu-separator":
                    index < menuItems.length - 1,
                  "rounded-t-[14px]": index === 0,
                  "rounded-b-[14px]": index === menuItems.length - 1,
                }
              )}
            >
              <img
                src={item.icon}
                alt={t(item.labelKey)}
                className="w-5 h-5 flex-shrink-0"
              />
              <span>{t(item.labelKey)}</span>
            </button>
          ))}
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
}
