/**
 * Orders Type Definitions
 * Types related to Orders screen
 */

import type { ID } from "./common";

export type Order = {
  id: ID;
  orderNumber: string;
  customerId: ID;
  customerName: string;
  customerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress?: Address;
  billingAddress?: Address;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
};

export type OrderItem = {
  id: ID;
  productId: ID;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Address = {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
};
