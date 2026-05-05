import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Slider from "react-slick";
import type { Product } from "../../types/product";
import styles from "./ProductCard.module.scss";
import classnames from "classnames";

type ProductCardProps = {
  product: Product;
  isWishlisted: boolean;
  onWishlistToggle: (productId: string) => void;
};

type ImageArrowProps = {
  onClick?: () => void;
  label: string;
};

const ImageNextArrow = ({ onClick, label }: ImageArrowProps) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.();
    }}
    className={classnames(styles.imageArrow, styles.imageArrowNext)}
    aria-label={label}
  >
    <ChevronRight className="w-4 h-4" />
  </button>
);

const ImagePrevArrow = ({ onClick, label }: ImageArrowProps) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.();
    }}
    className={classnames(styles.imageArrow, styles.imageArrowPrev)}
    aria-label={label}
  >
    <ChevronLeft className="w-4 h-4" />
  </button>
);

export default function ProductCard({
  product,
  isWishlisted,
  onWishlistToggle,
}: ProductCardProps) {
  const { t } = useTranslation("dashboard");
  const sliderRef = useRef<Slider>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlistToggle(product.id);
  };

  const nextImageLabel = t("products.detail.gallery.nextImage");
  const previousImageLabel = t("products.detail.gallery.previousImage");

  const sliderSettings = {
    dots: false,
    infinite: images.length > 1,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: images.length > 1,
    nextArrow: <ImageNextArrow label={nextImageLabel} />,
    prevArrow: <ImagePrevArrow label={previousImageLabel} />,
    beforeChange: (_current: number, next: number) => setCurrentSlide(next),
  };

  const renderStars = (rating: number) => {
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
  };

  return (
    <div className={classnames(styles.card, "card")}>
      {/* Wishlist Button */}
      <button
        className={styles.wishlistButton}
        onClick={handleWishlistClick}
        aria-label={
          isWishlisted
            ? t("products.removeFromWishlist")
            : t("products.addToWishlist")
        }
      >
        <Heart
          className="w-5 h-5 transition-all duration-200 ease-in-out"
          style={{
            color: isWishlisted
              ? "var(--color-error-500)"
              : "var(--color-gray-400)",
          }}
          fill={isWishlisted ? "currentColor" : "none"}
        />
      </button>

      {/* Card Body Link — wraps image + info so the whole card opens detail */}
      <Link to={`/products/${product.id}`} className={styles.cardLink}>
        {/* Product Image Carousel */}
        <div className={styles.imageContainer}>
          {images.length > 1 ? (
            <Slider ref={sliderRef} {...sliderSettings}>
              {images.map((image, index) => (
                <div key={index}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={image}
                      alt={t("products.detail.gallery.imageAlt", {
                        name: product.name,
                        index: index + 1,
                      })}
                      className={styles.image}
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className={styles.imageWrapper}>
              <img
                src={images[0]}
                alt={product.name}
                className={styles.image}
                loading="lazy"
              />
            </div>
          )}

          {/* Image indicator dots */}
          {images.length > 1 && (
            <div className={styles.imageDots}>
              {images.map((_, index) => (
                <button
                  key={index}
                  className={classnames(styles.imageDot, {
                    [styles.imageDotActive]: index === currentSlide,
                  })}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    sliderRef.current?.slickGoTo(index);
                  }}
                  aria-label={t("products.detail.gallery.goToImage", {
                    index: index + 1,
                  })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info — name, price, rating */}
        <div className="flex flex-col flex-1">
          <h3 className="text-base font-semibold text-primary mb-2 leading-snug overflow-hidden text-ellipsis line-clamp-2">
            {product.name}
          </h3>
          <p
            className="text-xl font-bold mb-3"
            style={{ color: "var(--color-primary-600)" }}
          >
            ${product.price.toFixed(2)}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">{renderStars(product.rating)}</div>
            <span className="text-sm text-secondary font-normal">
              ({product.reviewCount})
            </span>
          </div>
        </div>
      </Link>

      {/* Edit Link — outside the card-body Link; stopPropagation is a defensive guard
          (the card-body Link is a sibling, not a parent, so propagation isn't actually
          a path here — but the guard preserves the regression test contract). */}
      <Link
        to={`/products/${product.id}/edit`}
        onClick={handleEditClick}
        className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-primary text-on-primary border border-primary hover-bg-primary-dark transition-colors duration-200 text-sm font-medium"
      >
        {t("products.editProduct")}
      </Link>
    </div>
  );
}
