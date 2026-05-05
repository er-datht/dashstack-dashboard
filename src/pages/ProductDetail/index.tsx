import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Pencil,
  Star,
} from "lucide-react";
import Slider from "react-slick";
import classnames from "classnames";
import { useProduct } from "../../hooks/useProduct";
import { useWishlist } from "../../contexts/WishlistContext";
import { ROUTES } from "../../routes/routes";
import type { Product } from "../../types/product";
import type { ProductStatus } from "../../types/products";
import styles from "./ProductDetail.module.scss";

type ImageArrowProps = {
  onClick?: () => void;
  label: string;
};

const GalleryNextArrow = ({
  onClick,
  label,
}: ImageArrowProps): React.JSX.Element => (
  <button
    onClick={onClick}
    className={classnames(styles.galleryArrow, styles.galleryArrowNext)}
    aria-label={label}
    type="button"
  >
    <ChevronRight className="w-5 h-5" />
  </button>
);

const GalleryPrevArrow = ({
  onClick,
  label,
}: ImageArrowProps): React.JSX.Element => (
  <button
    onClick={onClick}
    className={classnames(styles.galleryArrow, styles.galleryArrowPrev)}
    aria-label={label}
    type="button"
  >
    <ChevronLeft className="w-5 h-5" />
  </button>
);

const STOCK_STATUS_KEY: Record<ProductStatus, string> = {
  active: "products.detail.specs.stockStatus.active",
  inactive: "products.detail.specs.stockStatus.inactive",
  out_of_stock: "products.detail.specs.stockStatus.out_of_stock",
  discontinued: "products.detail.specs.stockStatus.discontinued",
};

function renderStars(rating: number): React.JSX.Element[] {
  return Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < rating;
    return (
      <Star
        key={index}
        className="w-4 h-4 transition-colors duration-200 ease-in-out"
        style={{
          color: isFilled ? "#fbbf24" : "var(--color-gray-300)",
        }}
        fill={isFilled ? "currentColor" : "none"}
      />
    );
  });
}

function buildStockValue(
  product: Product,
  t: (key: string, options?: Record<string, unknown>) => string
): string | null {
  const hasStock = typeof product.stock === "number";
  const statusText = product.status ? t(STOCK_STATUS_KEY[product.status]) : "";
  const stockText = hasStock
    ? `${product.stock} ${t("products.detail.specs.stockUnits")}`
    : "";

  if (!statusText && !stockText) {
    return null;
  }
  if (statusText && stockText) {
    return `${statusText} · ${stockText}`;
  }
  return statusText || stockText;
}

export default function ProductDetail(): React.JSX.Element {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { product, isLoading, error } = useProduct(id);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const sliderRef = useRef<Slider>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>{t("products.detail.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={classnames(styles.errorContainer, "card")}>
          <p className={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <div className={classnames(styles.notFoundContainer, "card")}>
          <h2 className={styles.notFoundTitle}>
            {t("products.detail.notFound.title")}
          </h2>
          <p className={styles.notFoundText}>
            {t("products.detail.notFound.description")}
          </p>
          <button
            type="button"
            className={classnames(
              styles.actionButton,
              styles.actionButtonPrimary
            )}
            onClick={() => navigate(ROUTES.PRODUCTS)}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("products.detail.notFound.back")}
          </button>
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const wishlistLabel = wishlisted
    ? t("products.detail.actions.removeFromWishlist")
    : t("products.detail.actions.addToWishlist");

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const nextImageLabel = t("products.detail.gallery.nextImage");
  const previousImageLabel = t("products.detail.gallery.previousImage");

  const sliderSettings = {
    dots: false,
    infinite: galleryImages.length > 1,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: galleryImages.length > 1,
    nextArrow: <GalleryNextArrow label={nextImageLabel} />,
    prevArrow: <GalleryPrevArrow label={previousImageLabel} />,
    beforeChange: (_current: number, next: number) => setCurrentSlide(next),
  };

  const aboutParagraphs = product.longDescription
    ? product.longDescription
        .split("\n\n")
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 0)
    : [];

  const stockValue = buildStockValue(product, t);
  const ratingValue = `${product.rating.toFixed(1)} / 5`;

  return (
    <div className={styles.container}>
      <nav
        className={styles.breadcrumb}
        aria-label={t("products.detail.breadcrumb.label")}
      >
        <Link to={ROUTES.PRODUCTS} className={styles.breadcrumbLink}>
          {t("products.detail.breadcrumb.products")}
        </Link>
        <ChevronRight
          className={classnames("w-4 h-4", styles.breadcrumbSeparator)}
          aria-hidden="true"
        />
        <span
          className={styles.breadcrumbCurrent}
          aria-current="page"
          title={product.name}
        >
          {product.name}
        </span>
      </nav>

      <div className={styles.heroGrid}>
        <div className={styles.galleryContainer}>
          {galleryImages.length > 1 ? (
            <Slider ref={sliderRef} {...sliderSettings}>
              {galleryImages.map((image, index) => (
                <div key={index}>
                  <div className={styles.galleryImageWrapper}>
                    <img
                      src={image}
                      alt={t("products.detail.gallery.imageAlt", {
                        name: product.name,
                        index: index + 1,
                      })}
                      className={styles.galleryImage}
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className={styles.galleryImageWrapper}>
              <img
                src={galleryImages[0]}
                alt={product.name}
                className={styles.galleryImage}
                loading="lazy"
              />
            </div>
          )}

          {galleryImages.length > 1 && (
            <div className={styles.galleryDots}>
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={classnames(styles.galleryDot, {
                    [styles.galleryDotActive]: index === currentSlide,
                  })}
                  onClick={() => sliderRef.current?.slickGoTo(index)}
                  aria-label={t("products.detail.gallery.goToImage", {
                    index: index + 1,
                  })}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoColumn}>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productPrice}>${product.price.toFixed(2)}</p>

          <div className={styles.ratingRow}>
            <div className={styles.starRow}>{renderStars(product.rating)}</div>
            <span className={styles.reviewCount}>({product.reviewCount})</span>
          </div>

          {product.description && (
            <p className={styles.shortDescription}>{product.description}</p>
          )}

          <div className={styles.actionBar}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => toggleWishlist(product.id)}
              aria-label={wishlistLabel}
            >
              <Heart
                className="w-4 h-4"
                style={{
                  color: wishlisted
                    ? "var(--color-error-500)"
                    : "var(--color-gray-400)",
                }}
                fill={wishlisted ? "currentColor" : "none"}
              />
              {wishlistLabel}
            </button>

            <Link
              to={`/products/${product.id}/edit`}
              className={classnames(
                styles.actionButton,
                styles.actionButtonPrimary
              )}
              aria-label={t("products.detail.actions.edit")}
            >
              <Pencil className="w-4 h-4" />
              {t("products.detail.actions.edit")}
            </Link>
          </div>
        </div>
      </div>

      <section className={classnames(styles.section, "card")}>
        <h2 className={styles.sectionHeading}>
          {t("products.detail.specifications")}
        </h2>
        <div className={styles.specsGrid}>
          {product.sku && (
            <div className={styles.specRow}>
              <span className={styles.specLabel}>
                {t("products.detail.specs.sku")}
              </span>
              <span className={styles.specValue}>{product.sku}</span>
            </div>
          )}
          {product.category && (
            <div className={styles.specRow}>
              <span className={styles.specLabel}>
                {t("products.detail.specs.category")}
              </span>
              <span className={styles.specValue}>{product.category}</span>
            </div>
          )}
          {stockValue && (
            <div className={styles.specRow}>
              <span className={styles.specLabel}>
                {t("products.detail.specs.stock")}
              </span>
              <span className={styles.specValue}>{stockValue}</span>
            </div>
          )}
          <div className={styles.specRow}>
            <span className={styles.specLabel}>
              {t("products.detail.specs.rating")}
            </span>
            <span className={styles.specValue}>{ratingValue}</span>
          </div>
          <div className={styles.specRow}>
            <span className={styles.specLabel}>
              {t("products.detail.specs.reviews")}
            </span>
            <span className={styles.specValue}>{product.reviewCount}</span>
          </div>
        </div>
      </section>

      {aboutParagraphs.length > 0 && (
        <section className={classnames(styles.section, "card")}>
          <h2 className={styles.sectionHeading}>
            {t("products.detail.about")}
          </h2>
          {aboutParagraphs.map((paragraph, index) => (
            <p key={index} className={styles.aboutParagraph}>
              {paragraph}
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
