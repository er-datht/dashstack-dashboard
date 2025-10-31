import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
};

const ImageNextArrow = ({ onClick }: ImageArrowProps) => (
  <button
    onClick={onClick}
    className={classnames(styles.imageArrow, styles.imageArrowNext)}
    aria-label="Next image"
  >
    <ChevronRight className="w-4 h-4" />
  </button>
);

const ImagePrevArrow = ({ onClick }: ImageArrowProps) => (
  <button
    onClick={onClick}
    className={classnames(styles.imageArrow, styles.imageArrowPrev)}
    aria-label="Previous image"
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
  const navigate = useNavigate();
  const sliderRef = useRef<Slider>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const handleEditClick = () => {
    navigate(`/products/${product.id}/edit`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlistToggle(product.id);
  };

  const sliderSettings = {
    dots: false,
    infinite: images.length > 1,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: images.length > 1,
    nextArrow: <ImageNextArrow />,
    prevArrow: <ImagePrevArrow />,
    beforeChange: (_current: number, next: number) => setCurrentSlide(next),
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={classnames(styles.star, {
          [styles.starFilled]: index < rating,
        })}
        fill={index < rating ? "currentColor" : "none"}
      />
    ));
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
          className={classnames(styles.heartIcon, {
            [styles.heartIconFilled]: isWishlisted,
          })}
          fill={isWishlisted ? "currentColor" : "none"}
        />
      </button>

      {/* Product Image Carousel */}
      <div className={styles.imageContainer}>
        {images.length > 1 ? (
          <Slider ref={sliderRef} {...sliderSettings}>
            {images.map((image, index) => (
              <div key={index}>
                <div className={styles.imageWrapper}>
                  <img
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
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
                onClick={() => sliderRef.current?.slickGoTo(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={styles.content}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.price}>${product.price.toFixed(2)}</p>

        {/* Rating */}
        <div className={styles.rating}>
          <div className={styles.stars}>{renderStars(product.rating)}</div>
          <span className={styles.reviewCount}>({product.reviewCount})</span>
        </div>

        {/* Edit Button */}
        <button className={styles.editButton} onClick={handleEditClick}>
          {t("products.editProduct")}
        </button>
      </div>
    </div>
  );
}
