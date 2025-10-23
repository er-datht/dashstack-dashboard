/**
 * Pricing Type Definitions
 * Types related to Pricing screen
 */

import type { ID } from "./common";

export type PricingPlan = {
  id: ID;
  name: string;
  description: string;
  price: number;
  billingPeriod: BillingPeriod;
  features: PricingFeature[];
  isPopular?: boolean;
  isCustom?: boolean;
  maxUsers?: number;
  maxStorage?: number;
  support?: SupportLevel;
};

export type BillingPeriod = "monthly" | "yearly" | "lifetime";

export type PricingFeature = {
  name: string;
  included: boolean;
  value?: string | number;
};

export type SupportLevel = "basic" | "priority" | "premium" | "enterprise";

export type Subscription = {
  id: ID;
  planId: ID;
  userId: ID;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
};

export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial";
