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
      className={`fixed top-0 right-0 z-30 h-topnav text-topnav-bg border border-topnav-border bg-topnav-bg ${
        sidebarCollapsed ? "left-20" : "left-64"
      }`}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-topnav-search-placeholder" />
            <input
              type="text"
              placeholder={t("common:search")}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none text-topnav-text-primary bg-topnav-search-bg border border-topnav-border focus:ring-2 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-lg transition-colors cursor-pointer"
            aria-label={t("navigation:notifications")}
            style={{
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--color-topnav-button-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Bell className="w-5 h-5 text-topnav-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-topnav-notification"></span>
          </button>

          {/* Language Selector */}
          <LanguageSwitcher />

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-l-topnav-border">
            <img
              src="https://ui-avatars.com/api/?name=Moni+Roy&background=818cf8&color=fff&size=128"
              alt="Moni Roy"
              className="w-9 h-9 rounded-full"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight text-topnav-text-primary">
                Moni Roy
              </p>
              <p className="text-xs leading-tight text-topnav-text-secondary">
                Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
