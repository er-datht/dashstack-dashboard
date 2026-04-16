import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../utils/cn";

import enFlag from "../../assets/icons/flags/en.svg";
import jpFlag from "../../assets/icons/flags/jp.svg";

type LanguageSwitcherProps = {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
};

const languages = [
  { code: "en", label: "English", flag: enFlag },
  { code: "jp", label: "\u65E5\u672C\u8A9E", flag: jpFlag },
];

const LanguageSwitcher = ({
  isOpen,
  onClose,
  onToggle,
}: LanguageSwitcherProps): React.JSX.Element => {
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language;
  const currentLanguageData =
    languages.find((lang) => lang.code === currentLang) || languages[0];

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

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    onClose();
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer bg-transparent"
      >
        <img
          src={currentLanguageData.flag}
          alt={currentLanguageData.label}
          className="w-[44px] h-[30px]"
        />
        <span className="text-sm font-medium hidden sm:inline text-topnav-text-primary">
          {currentLanguageData.label}
        </span>
        <ChevronDown
          className="w-4 h-4 text-topnav-text-secondary transition-transform duration-200"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t("navigation:languageSwitcher.selectLanguage")}
          className={cn(
            "absolute right-0 top-full mt-2 w-[220px] rounded-[14px] shadow-lg z-50",
            "bg-usermenu-bg border border-usermenu-border",
            "animate-usermenu-enter",
          )}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-usermenu-separator">
            <span className="text-sm font-medium text-usermenu-text">
              {t("navigation:languageSwitcher.selectLanguage")}
            </span>
          </div>

          {/* Language rows */}
          {languages.map((lang, index) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "w-full flex items-center gap-3 p-[18px] text-left text-sm",
                "text-usermenu-text transition-colors cursor-pointer",
                "hover:bg-usermenu-hover",
                {
                  "rounded-b-[14px]": index === languages.length - 1,
                },
              )}
            >
              <img
                src={lang.flag}
                alt={lang.label}
                className="w-[44px] h-[30px]"
              />
              <span className="font-semibold">{lang.label}</span>
              {lang.code === currentLang && (
                <Check className="w-4 h-4 ml-auto text-usermenu-text" />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default LanguageSwitcher;
