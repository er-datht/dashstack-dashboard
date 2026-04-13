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

/**
 * Order List Page Types
 */

export type OrderListStatus =
  | "completed"
  | "processing"
  | "on_hold"
  | "rejected";

export type OrderType =
  | "health_medicine"
  | "book_stationary"
  | "services_industry"
  | "fashion_beauty"
  | "home_living"
  | "electronics"
  | "mobile_phone"
  | "accessories";

export type OrderListItem = {
  id: string;
  name: string;
  address: string;
  date: string;
  type: OrderType;
  status: OrderListStatus;
};

export type OrderFilters = {
  dates: Date[];
  types: OrderType[];
  statuses: OrderListStatus[];
};
