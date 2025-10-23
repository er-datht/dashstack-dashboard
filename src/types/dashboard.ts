/**
 * Dashboard Type Definitions
 * Types related to Dashboard screen
 */

import type { ID } from "./common";

// Dashboard Statistics
export type DashboardStats = {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
};

// Dashboard Chart Data
export type ChartData = {
  labels: string[];
  datasets: ChartDataset[];
};

export type ChartDataset = {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
};

// Recent Activity
export type RecentActivity = {
  id: ID;
  type: "order" | "user" | "product" | "system";
  message: string;
  timestamp: string;
  userId?: ID;
};
