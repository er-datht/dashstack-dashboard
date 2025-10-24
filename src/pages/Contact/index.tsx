import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';

export default function Contact() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('navigation.contact', 'Contact')}
        </h1>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-surface-dark p-6 rounded-lg shadow-sm">
        <p className="text-gray-600 dark:text-gray-400">
          {t('contact.description', 'Manage your contacts and customer information here.')}
        </p>
      </div>
    </div>
  );
}
