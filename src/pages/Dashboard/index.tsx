import { useTranslation } from 'react-i18next';
import { LayoutDashboard } from 'lucide-react';
import SalesDetailsChart from '../../components/SalesDetailsChart';

export default function Dashboard() {
  const { t } = useTranslation('dashboard');

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
          <LayoutDashboard className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('title')}
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalUser')}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">40,689</p>
              <p className="text-xs text-green-600 mt-1">
                8.5% {t('upFromYesterday')}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalOrder')}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">10,293</p>
              <p className="text-xs text-green-600 mt-1">
                1.3% {t('upFromPastWeek')}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalSales')}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">$89,000</p>
              <p className="text-xs text-red-600 mt-1">
                4.3% {t('downFromYesterday')}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalPending')}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">2,040</p>
              <p className="text-xs text-green-600 mt-1">
                1.8% {t('upFromYesterday')}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Details Chart */}
      <SalesDetailsChart className="mb-6" />

      {/* Content Placeholder */}
      <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {t('welcomeTitle')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('welcomeMessage')}
        </p>
      </div>
    </div>
  );
}
