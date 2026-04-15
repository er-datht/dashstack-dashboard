import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";
import UserMenu from "../UserMenu";

type TopNavProps = {
  sidebarCollapsed?: boolean;
};

export default function TopNav({ sidebarCollapsed = false }: TopNavProps) {
  const { t } = useTranslation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [langForceClose, setLangForceClose] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleUserMenu = () => {
    setIsUserMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        // Force close language switcher when user menu opens
        setLangForceClose(true);
      }
      return next;
    });
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  const handleLangSwitcherOpen = () => {
    // Close user menu when language switcher opens
    setIsUserMenuOpen(false);
    // Reset force close so it can be triggered again
    setLangForceClose(false);
  };

  // Click-outside detection — only listen when menu is open
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isUserMenuOpen]);

  // Reset langForceClose after it takes effect
  useEffect(() => {
    if (langForceClose && !isUserMenuOpen) {
      setLangForceClose(false);
    }
  }, [langForceClose, isUserMenuOpen]);

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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
            <input
              type="text"
              placeholder={t("common:search")}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-primary focus:outline-none placeholder:text-topnav-text-secondary bg-topnav-search-bg border border-topnav-border focus:border-transparent"
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
          <LanguageSwitcher
            forceClose={langForceClose}
            onOpen={handleLangSwitcherOpen}
          />

          {/* User Profile + UserMenu */}
          <div ref={containerRef} className="relative">
            <button
              onClick={toggleUserMenu}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen ? "true" : "false"}
              className="flex items-center gap-3 pl-4 border-l border-l-topnav-border cursor-pointer bg-transparent"
            >
              <img
                src="https://ui-avatars.com/api/?name=Moni+Roy&background=818cf8&color=fff&size=128"
                alt="Moni Roy"
                className="w-9 h-9 rounded-full"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold leading-tight text-topnav-text-primary">
                  Moni Roy
                </p>
                <p className="text-xs leading-tight text-topnav-text-secondary">
                  Admin
                </p>
              </div>
              <ChevronDown
                className="w-4 h-4 text-topnav-text-secondary transition-transform duration-200"
                style={{
                  transform: isUserMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            <UserMenu isOpen={isUserMenuOpen} onClose={closeUserMenu} />
          </div>
        </div>
      </div>
    </header>
  );
}
