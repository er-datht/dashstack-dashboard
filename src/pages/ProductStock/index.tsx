import { useTranslation } from 'react-i18next';
import { Archive } from 'lucide-react';

export default function ProductStock() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
          <Archive className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('products.stock', 'Product Stock')}
        </h1>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-surface-dark p-6 rounded-lg shadow-sm">
        <p className="text-gray-600 dark:text-gray-400">
          {t('productStock.description', 'Manage your product inventory and stock levels here.')}
        </p>
      </div>
    </div>
  );
}
