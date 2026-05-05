/**
 * Product Type Definitions
 */

import type { ProductStatus } from "./products";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  images?: string[];
  description?: string;
  longDescription?: string;
  category?: string;
  sku?: string;
  stock?: number;
  status?: ProductStatus;
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
