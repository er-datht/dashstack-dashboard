/**
 * Table Type Definitions
 * Types related to Table screen and data tables
 */

import type { ID } from "./common";

export type TableColumn<T = Record<string, unknown>> = {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => unknown);
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
};

export type TableData<T = Record<string, unknown>> = {
  rows: T[];
  totalRows: number;
  page: number;
  pageSize: number;
};

export type TableFilter = {
  column: string;
  operator: FilterOperator;
  value: unknown;
};

export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "lessThan"
  | "between";

export type TableSort = {
  column: string;
  direction: "asc" | "desc";
};

export type TableSelection = {
  selectedIds: ID[];
  selectAll: boolean;
};
