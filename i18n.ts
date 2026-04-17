import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  // Load translation files from public/locales
  .use(HttpBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Default language
    fallbackLng: "en",

    // Supported languages
    supportedLngs: ["en", "jp"],

    debug: false,

    // Namespace for translations
    ns: [
      "common",
      "navigation",
      "auth",
      "dashboard",
      "products",
      "orders",
      "settings",
      "todo",
      "theme",
      "errors",
      "messages",
      "calendar",
      "contact",
    ],
    defaultNS: "common",

    // Language detection options
    detection: {
      // Order of language detection methods
      order: ["localStorage", "navigator", "htmlTag"],

      // Cache user language in localStorage
      caches: ["localStorage"],

      // localStorage key name
      lookupLocalStorage: "i18nextLng",
    },

    // Backend options for loading translation files
    backend: {
      // Path to translation files
      loadPath: "/locales/{{lng}}/{{ns}}.json",

      // Allow cross domain requests
      crossDomain: false,
    },

    // React-i18next options
    react: {
      // Suspend component rendering until translations are loaded
      useSuspense: true,

      // Bind i18n instance to component
      bindI18n: "languageChanged loaded",

      // Bind i18n store to component
      bindI18nStore: "added removed",

      // Re-render component on language change
      transEmptyNodeValue: "",
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p", "span"],
    },

    // Interpolation options
    interpolation: {
      // React already escapes values
      escapeValue: false,

      // Format function for dates, numbers, etc.
      format: (value, format, lng) => {
        if (format === "uppercase") return value.toUpperCase();
        if (format === "lowercase") return value.toLowerCase();
        if (value instanceof Date) {
          return new Intl.DateTimeFormat(lng).format(value);
        }
        return value;
      },
    },

    // Load options
    load: "languageOnly", // Load 'en' instead of 'en-US'

    // Preload languages
    preload: ["en", "jp"],

    // Clean code on language change
    cleanCode: true,

    // Return null for missing keys instead of the key itself
    returnNull: false,

    // Return empty string for missing keys
    returnEmptyString: false,

    // Return objects for missing keys
    returnObjects: false,
  });

export default i18n;
