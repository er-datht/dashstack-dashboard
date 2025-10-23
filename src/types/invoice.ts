/**
 * Invoice Type Definitions
 * Types related to Invoice screen
 */

import type { ID } from "./common";
import type { Address } from "./orders";

export type Invoice = {
  id: ID;
  invoiceNumber: string;
  customerId: ID;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  notes?: string;
  billingAddress?: Address;
};

export type InvoiceCustomer = {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  company?: string;
};

export type InvoiceItem = {
  id: ID;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
