import { useTranslation } from "react-i18next";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("navigation.settings", "Settings")}
        </h1>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Settings Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            General Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your application settings and preferences here.
          </p>
        </div>

        {/* Other Settings Sections */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Other Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Additional settings will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}
