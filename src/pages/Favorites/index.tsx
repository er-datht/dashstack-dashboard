import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";

export default function Favorites() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-error-light rounded-lg flex items-center justify-center">
          <Heart className="w-6 h-6 text-error" />
        </div>
        <h1 className="text-2xl font-bold text-primary">
          {t("products.favorites", "Favorites")}
        </h1>
      </div>

      {/* Content */}
      <div className="card p-6">
        <p className="text-secondary">
          {t(
            "favorites.description",
            "Your favorite products and items will appear here."
          )}
        </p>
      </div>
    </div>
  );
}
