/**
 * Type definitions for RevenueChart component
 */

/**
 * Represents a single data point in the revenue chart
 */
export type RevenueDataPoint = {
  /** Total sales/profit volume in base units (e.g., 5000, 10000) for X-axis */
  volume: number;
  /** Sales percentage (0-100 range) for Y-axis plotting */
  salesPercentage: number;
  /** Profit percentage (0-100 range) for Y-axis plotting */
  profitPercentage: number;
  /** Sales value in base units (e.g., 5000 for 5k) for tooltip display */
  sales: number;
  /** Profit value in base units (e.g., 3000 for 3k) for tooltip display */
  profit: number;
};

/**
 * Represents revenue data for a specific month
 */
export type MonthData = {
  /** Month identifier (e.g., "january", "october") */
  month: string;
  /** Array of data points for the month */
  data: RevenueDataPoint[];
};

/**
 * Props for the RevenueChart component
 */
export type RevenueChartProps = {
  /** Optional CSS class name for styling */
  className?: string;
};
