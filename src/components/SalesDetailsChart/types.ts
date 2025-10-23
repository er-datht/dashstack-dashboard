export interface SalesDataPoint {
  volume: number;
  percentage: number;
  value: number;
}

export interface MonthData {
  month: string;
  data: SalesDataPoint[];
}

export interface SalesDetailsChartProps {
  className?: string;
}
