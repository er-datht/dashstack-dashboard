import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
import TableCommon, {
  type ColumnDefinition,
} from "../../../components/TableCommon";
import StatusBadge from "../../../components/StatusBadge";
import ColorDots from "../../../components/ColorDots";
import Section from "./Section";
import VariantCard from "./VariantCard";
import {
  mockOrders,
  mockProductsWithActions,
  mockProductsWithColors,
  mockUsers,
} from "../mockData";
import type {
  MockOrder,
  MockProductWithActions,
  MockProductWithColors,
  MockUser,
} from "../types";

type CellContentSectionProps = {
  showToast: (text: string) => void;
};

export default function CellContentSection({
  showToast,
}: CellContentSectionProps): React.JSX.Element {
  const { t } = useTranslation();

  const userColumns: ColumnDefinition<MockUser>[] = [
    { key: "avatar", header: "", align: "left", width: "60px" },
    { key: "name", header: t("tables:columns.name"), align: "left" },
    { key: "email", header: t("tables:columns.email"), align: "left" },
  ];

  const renderUserCell = (
    user: MockUser,
    column: ColumnDefinition<MockUser>,
  ) => {
    switch (column.key) {
      case "avatar":
        return (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
            loading="lazy"
          />
        );
      case "name":
        return (
          <span className="text-sm font-medium text-primary">{user.name}</span>
        );
      case "email":
        return <span className="text-sm text-secondary">{user.email}</span>;
      default:
        return null;
    }
  };

  const orderColumns: ColumnDefinition<MockOrder>[] = [
    { key: "orderId", header: t("tables:columns.orderId"), align: "left" },
    { key: "customer", header: t("tables:columns.customer"), align: "left" },
    { key: "status", header: t("tables:columns.status"), align: "left" },
  ];

  const renderOrderCell = (
    order: MockOrder,
    column: ColumnDefinition<MockOrder>,
  ) => {
    switch (column.key) {
      case "orderId":
        return (
          <span className="text-sm font-medium text-primary">
            {order.orderId}
          </span>
        );
      case "customer":
        return <span className="text-sm text-primary">{order.customer}</span>;
      case "status":
        return <StatusBadge status={order.status} />;
      default:
        return null;
    }
  };

  const colorColumns: ColumnDefinition<MockProductWithColors>[] = [
    { key: "name", header: t("tables:columns.name"), align: "left" },
    { key: "colors", header: t("tables:columns.colors"), align: "left" },
  ];

  const renderColorCell = (
    product: MockProductWithColors,
    column: ColumnDefinition<MockProductWithColors>,
  ) => {
    switch (column.key) {
      case "name":
        return (
          <span className="text-sm font-medium text-primary">
            {product.name}
          </span>
        );
      case "colors":
        return <ColorDots colors={product.availableColors} />;
      default:
        return null;
    }
  };

  const actionColumns: ColumnDefinition<MockProductWithActions>[] = [
    { key: "name", header: t("tables:columns.name"), align: "left" },
    {
      key: "actions",
      header: t("tables:columns.actions"),
      align: "left",
      width: "120px",
    },
  ];

  const renderActionCell = (
    product: MockProductWithActions,
    column: ColumnDefinition<MockProductWithActions>,
  ) => {
    switch (column.key) {
      case "name":
        return (
          <span className="text-sm font-medium text-primary">
            {product.name}
          </span>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast(t("tables:toast.edited"))}
              className="p-2 rounded-lg transition-all hover-bg-brand-light shrink-0"
              aria-label={t("tables:actions.edit")}
            >
              <Pencil className="w-4 h-4 shrink-0 text-brand-primary" />
            </button>
            <button
              type="button"
              onClick={() => showToast(t("tables:toast.deleted"))}
              className="p-2 rounded-lg transition-all hover:bg-danger-muted shrink-0"
              aria-label={t("tables:actions.delete")}
            >
              <Trash2 className="w-4 h-4 shrink-0 text-danger" />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Section title={t("tables:sections.cellContent.title")}>
      <VariantCard title={t("tables:variants.cellContent.avatars")}>
        <TableCommon<MockUser>
          columns={userColumns}
          data={mockUsers}
          renderCell={renderUserCell}
          hasPagination={false}
        />
      </VariantCard>
      <VariantCard title={t("tables:variants.cellContent.statusBadges")}>
        <TableCommon<MockOrder>
          columns={orderColumns}
          data={mockOrders}
          renderCell={renderOrderCell}
          hasPagination={false}
        />
      </VariantCard>
      <VariantCard title={t("tables:variants.cellContent.colorDots")}>
        <TableCommon<MockProductWithColors>
          columns={colorColumns}
          data={mockProductsWithColors}
          renderCell={renderColorCell}
          hasPagination={false}
        />
      </VariantCard>
      <VariantCard title={t("tables:variants.cellContent.actions")}>
        <TableCommon<MockProductWithActions>
          columns={actionColumns}
          data={mockProductsWithActions}
          renderCell={renderActionCell}
          hasPagination={false}
        />
      </VariantCard>
    </Section>
  );
}
