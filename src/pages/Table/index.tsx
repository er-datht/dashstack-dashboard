import { useTranslation } from 'react-i18next';
import { Table as TableIcon } from 'lucide-react';

export default function Table() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900/20 rounded-lg flex items-center justify-center">
          <TableIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('navigation.table', 'Table')}
        </h1>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-surface-dark p-6 rounded-lg shadow-sm">
        <p className="text-gray-600 dark:text-gray-400">
          {t('table.description', 'View and manage data tables here.')}
        </p>
      </div>
    </div>
  );
}
