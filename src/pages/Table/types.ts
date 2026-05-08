import type { ProductColor } from "../../types/productStock";
import type { StatusType } from "../../components/StatusBadge";

export type FilterValue =
  | "all"
  | "basic"
  | "cellContent"
  | "statesAndInteraction";

export type GenericRow = {
  id: string;
  label: string;
  value: string;
};

export type MockUser = {
  id: string;
  avatar: string;
  name: string;
  email: string;
};

export type MockOrder = {
  id: string;
  orderId: string;
  customer: string;
  status: StatusType;
};

export type MockProductWithColors = {
  id: string;
  name: string;
  availableColors: ProductColor[];
};

export type MockProductWithActions = {
  id: string;
  name: string;
};
