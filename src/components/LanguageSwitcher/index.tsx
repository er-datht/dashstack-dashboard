import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className = "" }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "jp", label: "日本語", flag: "🇯🇵" },
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
      <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
        <span className="text-lg">{currentLanguageData.flag}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {currentLanguageData.label}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 before:content-[''] before:absolute before:bottom-full before:right-0 before:w-full before:h-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${
                lang.code === currentLang ||
                currentLang.startsWith(lang.code + "-")
                  ? "bg-gray-50 dark:bg-gray-800"
                  : ""
              } ${lang.code === languages[0].code ? "rounded-t-lg" : ""} ${
                lang.code === languages[languages.length - 1].code
                  ? "rounded-b-lg"
                  : ""
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lang.label}
              </span>
              {(lang.code === currentLang ||
                currentLang.startsWith(lang.code + "-")) && (
                <span className="ml-auto text-blue-600 dark:text-blue-400">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
