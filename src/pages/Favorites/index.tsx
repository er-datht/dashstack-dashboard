import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

export default function Favorites() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
          <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('products.favorites', 'Favorites')}
        </h1>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg shadow-sm">
        <p className="text-gray-600 dark:text-gray-400">
          {t('favorites.description', 'Your favorite products and items will appear here.')}
        </p>
      </div>
    </div>
  );
}
