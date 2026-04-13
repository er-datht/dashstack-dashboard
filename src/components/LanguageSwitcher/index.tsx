import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className = "" }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "jp", label: "日本語", flag: "🇯🇵" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
  ];

  const currentLang = i18n.language;
  const currentLanguageData =
    languages.find((lang) => lang.code === currentLang) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer bg-transparent hover:bg-topnav-button-hover">
        <span className="text-lg">{currentLanguageData.flag}</span>
        <span className="text-sm font-medium hidden sm:inline text-topnav-text-primary">
          {currentLanguageData.label}
        </span>
        <ChevronDown className="w-4 h-4 text-topnav-text-secondary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-surface-primary border-border-default z-50 before:content-[''] before:absolute before:bottom-full before:right-0 before:w-full before:h-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              // className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
              //   lang.code === languages[0].code ? "rounded-t-lg" : ""
              // } ${
              //   lang.code === languages[languages.length - 1].code
              //     ? "rounded-b-lg"
              //     : ""
              // }`}

              className={cn(
                "w-full  flex items-center gap-3 px-4 py-2.5 transition-colors text-left text-topnav-text-primary",
                {
                  "rounded-t-lg": lang.code === languages[0].code,
                  "rounded-b-lg":
                    lang.code === languages[languages.length - 1].code,
                  "bg-topnav-text-active":
                    lang.code === currentLang ||
                    currentLang.startsWith(lang.code + "-"),
                }
              )}
              onMouseEnter={(e) => {
                if (
                  !(
                    lang.code === currentLang ||
                    currentLang.startsWith(lang.code + "-")
                  )
                ) {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-topnav-button-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (
                  !(
                    lang.code === currentLang ||
                    currentLang.startsWith(lang.code + "-")
                  )
                ) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium text-topnav-text-primary">
                {lang.label}
              </span>
              {(lang.code === currentLang ||
                currentLang.startsWith(lang.code + "-")) && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
