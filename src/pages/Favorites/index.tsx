import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import ProductCard from "../../components/ProductCard";
import { useProducts } from "../../hooks/useProducts";
import { useWishlist } from "../../contexts/WishlistContext";
import { ROUTES } from "../../routes/routes";
import styles from "./Favorites.module.scss";

export default function Favorites() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const { products, isLoading, error } = useProducts();
  const { wishlistIds, toggleWishlist, isWishlisted } = useWishlist();

  // Filter products to show only favorites
  const favoriteProducts = useMemo(() => {
    return products.filter((product) => wishlistIds.includes(product.id));
  }, [products, wishlistIds]);

  const handleWishlistToggle = (productId: string) => {
    toggleWishlist(productId);
  };

  const handleBrowseProducts = () => {
    navigate(ROUTES.PRODUCTS);
  };

  if (isLoading) {
    return (
      <div className="p-6 sm:p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-error-light rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 icon-error" />
          </div>
          <h1 className="text-2xl sm:text-xl font-bold text-primary m-0">
            {t("products.favorites")}
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className={styles.spinner}></div>
          <p className="mt-4 text-base text-secondary font-medium">
            {t("products.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 sm:p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-error-light rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 icon-error" />
          </div>
          <h1 className="text-2xl sm:text-xl font-bold text-primary m-0">
            {t("products.favorites")}
          </h1>
        </div>
        <div className="card p-6 text-center">
          <p className="text-base text-error font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-4">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-error-light rounded-lg flex items-center justify-center">
          <Heart className="w-6 h-6 icon-error" />
        </div>
        <h1 className="text-2xl sm:text-xl font-bold text-primary m-0">
          {t("products.favorites")}
        </h1>
      </div>

      {/* Empty State */}
      {favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <Heart
            className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
            style={{ color: "var(--color-gray-400)" }}
          />
          <h2 className="text-xl font-semibold text-primary mb-2">
            {t("favorites.emptyTitle", "No Favorites Yet")}
          </h2>
          <p className="text-base text-secondary mb-6 max-w-md">
            {t(
              "favorites.emptyDescription",
              "Start adding products to your favorites by clicking the heart icon on any product."
            )}
          </p>
          <button
            className="px-6 py-3 bg-primary text-white rounded-lg text-base font-medium cursor-pointer transition-all duration-200 ease-in-out flex items-center gap-2 hover-bg-primary-dark hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            onClick={handleBrowseProducts}
          >
            <ShoppingBag className="w-5 h-5" />
            {t("favorites.browseProducts", "Browse Products")}
          </button>
        </div>
      ) : (
        /* Products Grid */
        <div className={styles.productsGrid}>
          {favoriteProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={isWishlisted(product.id)}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
