/**
 * Product Type Definitions
 */

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  images?: string[];
};

export type PromotionalBanner = {
  id: string;
  dateRange: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
};
