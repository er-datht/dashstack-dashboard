import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PromotionalBanner } from "../../types/product";
import styles from "./PromotionalBanner.module.scss";
import classnames from "classnames";

type PromotionalBannerProps = {
  banners: PromotionalBanner[];
};

type ArrowProps = {
  onClick?: () => void;
};

const NextArrow = ({ onClick }: ArrowProps) => (
  <button
    onClick={onClick}
    className={styles.arrowNext}
    aria-label="Next slide"
  >
    <ChevronRight className="w-6 h-6" />
  </button>
);

const PrevArrow = ({ onClick }: ArrowProps) => (
  <button
    onClick={onClick}
    className={styles.arrowPrev}
    aria-label="Previous slide"
  >
    <ChevronLeft className="w-6 h-6" />
  </button>
);

export default function PromotionalBanner({ banners }: PromotionalBannerProps) {
  const { t } = useTranslation("dashboard");

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    pauseOnHover: true,
  };

  return (
    <div className={styles.bannerContainer}>
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id}>
            <div className={classnames(styles.banner, "card")}>
              <div className={styles.bannerContent}>
                <p className={styles.dateRange}>{banner.dateRange}</p>
                <h2 className={styles.title}>{banner.title}</h2>
                <p className={styles.subtitle}>{banner.subtitle}</p>
                <button className={styles.ctaButton}>
                  {banner.ctaText || t("products.getStarted")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
