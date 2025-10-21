import { useTranslation } from 'react-i18next';
import { ClipboardList } from 'lucide-react';

export default function Orders() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
          <ClipboardList className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('orders.orderList', 'Orders')}
        </h1>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg shadow-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Orders page content will be displayed here.
        </p>
      </div>
    </div>
  );
}
