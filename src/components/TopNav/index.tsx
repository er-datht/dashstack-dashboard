import { Search, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";

type TopNavProps = {
  sidebarCollapsed?: boolean;
};

export default function TopNav({ sidebarCollapsed = false }: TopNavProps) {
  const { t } = useTranslation();
  return (
    <header
      className={`fixed top-0 right-0 h-[69px] bg-surface dark:bg-nav-dark border-b border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 ${
        sidebarCollapsed ? "left-20" : "left-64"
      }`}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t("common:search")}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-surface-secondary-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notification Bell */}
          <button
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            aria-label={t("navigation:notifications")}
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Language Selector */}
          <LanguageSwitcher />

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <img
              src="https://ui-avatars.com/api/?name=Moni+Roy&background=818cf8&color=fff&size=128"
              alt="Moni Roy"
              className="w-9 h-9 rounded-full"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                Moni Roy
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
