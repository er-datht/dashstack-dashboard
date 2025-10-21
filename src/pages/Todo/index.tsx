import { useTranslation } from 'react-i18next';
import { CheckSquare } from 'lucide-react';

export default function Todo() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
          <CheckSquare className="w-6 h-6 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('navigation.todo', 'To-Do')}
        </h1>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg shadow-sm">
        <p className="text-gray-600 dark:text-gray-400">
          {t('todo.description', 'Manage your tasks and to-do lists here.')}
        </p>
      </div>
    </div>
  );
}
