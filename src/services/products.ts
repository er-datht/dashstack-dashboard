/**
 * Products API Service
 * Handles all product-related API calls and mock data
 */

import type { Product, PromotionalBanner } from "../types/product";

/**
 * Mock Data for Promotional Banners
 */
const MOCK_PROMOTIONAL_BANNERS: PromotionalBanner[] = [
  {
    id: "1",
    dateRange: "September 12-22",
    title: "Enjoy free home delivery in this summer",
    subtitle: "Designer Dresses - Pick from trendy Designer Dress.",
    ctaText: "Get Started",
    ctaLink: "/products",
  },
  {
    id: "2",
    dateRange: "October 1-15",
    title: "Fall Collection Sale - Up to 50% Off",
    subtitle: "Premium watches and accessories at unbeatable prices.",
    ctaText: "Shop Now",
    ctaLink: "/products",
  },
  {
    id: "3",
    dateRange: "Year Round",
    title: "Subscribe and Save 20%",
    subtitle: "Get exclusive deals and early access to new products.",
    ctaText: "Join Now",
    ctaLink: "/products",
  },
];

/**
 * Mock Data for Products
 */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Apple Watch Series 4",
    price: 120.0,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    rating: 4,
    reviewCount: 131,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400",
    ],
  },
  {
    id: "2",
    name: "Wireless Headphones",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    rating: 5,
    reviewCount: 256,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400",
    ],
  },
  {
    id: "3",
    name: "Smart Watch Pro",
    price: 199.0,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    rating: 4,
    reviewCount: 89,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    ],
  },
  {
    id: "4",
    name: "Premium Sunglasses",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
    rating: 4,
    reviewCount: 64,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
    ],
  },
  {
    id: "5",
    name: "Leather Backpack",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    rating: 5,
    reviewCount: 143,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"],
  },
  {
    id: "6",
    name: "Vintage Camera",
    price: 299.0,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
    rating: 4,
    reviewCount: 78,
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
    ],
  },
];

/**
 * Get all promotional banners
 */
export const getPromotionalBanners = async (): Promise<PromotionalBanner[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_PROMOTIONAL_BANNERS;
};

/**
 * Get all products
 */
export const getProducts = async (): Promise<Product[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return MOCK_PRODUCTS;
};

/**
 * Get a single product by ID
 */
export const getProductById = async (
  id: string
): Promise<Product | undefined> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_PRODUCTS.find((product) => product.id === id);
};
