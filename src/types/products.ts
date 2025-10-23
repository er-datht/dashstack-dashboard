/**
 * Products Type Definitions
 * Types related to Products and ProductStock screens
 */

import type { ID } from "./common";

export type Product = {
  id: ID;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  sku?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProductStatus =
  | "active"
  | "inactive"
  | "out_of_stock"
  | "discontinued";

export type ProductCategory = {
  id: ID;
  name: string;
  description?: string;
  productCount?: number;
};

export type ProductStock = {
  productId: ID;
  quantity: number;
  location: string;
  lastRestocked?: string;
  minThreshold?: number;
};

export type ProductFormData = {
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  sku?: string;
  status: ProductStatus;
};
