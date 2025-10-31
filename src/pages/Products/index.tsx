import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Package } from "lucide-react";
import PromotionalBanner from "../../components/PromotionalBanner";
import ProductCard from "../../components/ProductCard";
import { useProducts } from "../../hooks/useProducts";
import { useBanners } from "../../hooks/useBanners";
import styles from "./Products.module.scss";
import classnames from "classnames";

export default function Products() {
  const { t } = useTranslation("dashboard");
  const {
    products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProducts();

  const {
    banners,
    isLoading: isLoadingBanners,
    error: bannersError,
  } = useBanners();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Combined loading and error states
  const isLoading = isLoadingProducts || isLoadingBanners;
  const error = productsError || bannersError;

  const handleWishlistToggle = (productId: string) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Package className="w-6 h-6 icon-brand" />
          </div>
          <h1 className={styles.title}>{t("products.title")}</h1>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>{t("products.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Package className="w-6 h-6 icon-brand" />
          </div>
          <h1 className={styles.title}>{t("products.title")}</h1>
        </div>
        <div className={classnames(styles.errorContainer, "card")}>
          <p className={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Package className="w-6 h-6 icon-brand" />
        </div>
        <h1 className={styles.title}>{t("products.title")}</h1>
      </div>

      {/* Promotional Banner */}
      {banners.length > 0 && <PromotionalBanner banners={banners} />}

      {/* Products Grid */}
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isWishlisted={wishlist.has(product.id)}
            onWishlistToggle={handleWishlistToggle}
          />
        ))}
      </div>
    </div>
  );
}
