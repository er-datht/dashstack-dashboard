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
    description:
      "A premium smartwatch with health tracking, GPS, and a vibrant Retina display.",
    longDescription:
      "The Apple Watch Series 4 redefines what a watch can do with a stunning edge-to-edge Retina display, an electrical heart sensor for ECG readings, and fall detection that calls for help when you need it.\n\nWith advanced sensors, it tracks your activity all day, helps you reach your fitness goals, and stays connected through cellular and Wi-Fi so you can leave your phone behind.",
    category: "Watches",
    sku: "AW-SR4-001",
    stock: 24,
    status: "active",
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
    description:
      "Over-ear wireless headphones with active noise cancellation and 30-hour battery life.",
    longDescription:
      "Immerse yourself in studio-quality sound with adaptive active noise cancellation that adjusts to your environment in real time. The plush memory-foam ear cushions and lightweight headband keep you comfortable through long listening sessions.\n\nQuick-charge support delivers five hours of playback from a 10-minute charge, and seamless multipoint pairing lets you switch between your phone and laptop without missing a beat.",
    category: "Audio",
    sku: "WH-PRO-002",
    stock: 58,
    status: "active",
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
    description:
      "Pro-grade smart watch with always-on AMOLED display and multi-band GPS.",
    longDescription:
      "Train smarter with built-in workout modes for over 100 sports, advanced recovery insights, and continuous SpO2 monitoring. The titanium case and sapphire crystal stand up to the toughest sessions.\n\nA full week of battery life on a single charge means you can leave the charger at home, while seamless smartphone notifications keep you in sync wherever your day takes you.",
    category: "Watches",
    sku: "SW-PRO-003",
    stock: 12,
    status: "active",
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
    description:
      "UV400-protected polarized sunglasses with a hand-finished acetate frame.",
    longDescription:
      "Crafted from Italian acetate and fitted with polarized lenses, these sunglasses cut glare from water, snow, and pavement while protecting your eyes from harmful UV rays.\n\nThe lightweight frame, spring-hinged temples, and hand-polished finish deliver all-day comfort and timeless style for everything from city commutes to beach getaways.",
    category: "Accessories",
    sku: "SG-PRM-004",
    stock: 37,
    status: "active",
  },
  {
    id: "5",
    name: "Leather Backpack",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    rating: 5,
    reviewCount: 143,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"],
    description:
      "Full-grain leather backpack with a padded laptop sleeve and water-resistant lining.",
    longDescription:
      "Designed for the daily commute and weekend getaways alike, this backpack features a dedicated 15-inch laptop sleeve, organized interior pockets, and quick-access exterior compartments.\n\nThe full-grain leather develops a rich patina over time, while the water-resistant lining and YKK zippers keep your essentials safe in any weather.",
    category: "Bags",
    sku: "LB-CLS-005",
    stock: 41,
    status: "active",
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
    description:
      "Collector-grade 35mm rangefinder camera, fully restored and CLA-serviced.",
    longDescription:
      "A meticulously restored 35mm rangefinder with a precision-ground lens and a buttery-smooth shutter mechanism, ideal for photographers who appreciate the craft of analog film.\n\nEvery unit ships fully serviced (clean, lubricate, adjust) and includes a leather case, original-style lens cap, and a one-year warranty on mechanical components.",
    category: "Cameras",
    sku: "VC-RFR-006",
    stock: 0,
    status: "out_of_stock",
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
