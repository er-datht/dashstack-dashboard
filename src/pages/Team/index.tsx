import { useTranslation } from 'react-i18next';
import { UsersRound } from 'lucide-react';

export default function Team() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/20 rounded-lg flex items-center justify-center">
          <UsersRound className="w-6 h-6 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('navigation.team', 'Team')}
        </h1>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg shadow-sm">
        <p className="text-gray-600 dark:text-gray-400">
          {t('team.description', 'Manage your team members and roles here.')}
        </p>
      </div>
    </div>
  );
}
