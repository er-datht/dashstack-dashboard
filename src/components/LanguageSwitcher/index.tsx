import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

type LanguageSwitcherProps = {
  className?: string;
  forceClose?: boolean;
  onOpen?: () => void;
};

const LanguageSwitcher = ({
  className = "",
  forceClose,
  onOpen,
}: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", label: "English", flag: "\u{1F1FA}\u{1F1F8}" },
    { code: "jp", label: "\u65E5\u672C\u8A9E", flag: "\u{1F1EF}\u{1F1F5}" },
  ];

  const currentLang = i18n.language;
  const currentLanguageData =
    languages.find((lang) => lang.code === currentLang) || languages[0];

  // Handle forceClose prop
  useEffect(() => {
    if (forceClose) {
      setIsOpen(false);
    }
  }, [forceClose]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    setIsOpen(true);
    onOpen?.();
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
              <span className="text-lg flex items-center gap-3">
                {lang.flag} {lang.label}
              </span>
              {(lang.code === currentLang ||
                currentLang.startsWith(lang.code + "-")) && (
                <span className="ml-auto text-primary">&#10003;</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
