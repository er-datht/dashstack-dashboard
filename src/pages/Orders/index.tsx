import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import { useOrders } from "../../hooks/useOrders";
import type { OrderListItem, OrderFilters } from "../../types/orders";
import type { ColumnDefinition } from "../../components/TableCommon";
import TableCommon from "../../components/TableCommon";
import OrderStatusBadge from "./OrderStatusBadge";
import FilterBar from "./FilterBar";

const ITEMS_PER_PAGE = 9;

const DEFAULT_FILTERS: OrderFilters = {
  dates: [],
  types: [],
  statuses: [],
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Orders(): React.JSX.Element {
  const { t } = useTranslation("orders");
  const { orders, isLoading } = useOrders();
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (filters.dates.length > 0) {
      result = result.filter((order) => {
        const orderDate = new Date(order.date);
        return filters.dates.some((d) => isSameDay(d, orderDate));
      });
    }

    if (filters.types.length > 0) {
      result = result.filter((order) => filters.types.includes(order.type));
    }

    if (filters.statuses.length > 0) {
      result = result.filter((order) =>
        filters.statuses.includes(order.status)
      );
    }

    return result;
  }, [orders, filters]);

  const pageCount = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handleFiltersChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(0);
  };

  const formatDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(dateStr));
  };

  const columns: ColumnDefinition<OrderListItem>[] = [
    { key: "id", header: t("columns.id"), align: "left", width: "80px" },
    { key: "name", header: t("columns.name"), align: "left" },
    { key: "address", header: t("columns.address"), align: "left" },
    { key: "date", header: t("columns.date"), align: "left" },
    { key: "type", header: t("columns.type"), align: "left" },
    { key: "status", header: t("columns.status"), align: "left", width: "130px" },
  ];

  const renderCell = (
    order: OrderListItem,
    column: ColumnDefinition<OrderListItem>
  ) => {
    switch (column.key) {
      case "id":
        return (
          <span className="text-sm text-secondary">#{order.id}</span>
        );
      case "name":
        return (
          <span className="text-sm font-medium text-primary">
            {order.name}
          </span>
        );
      case "address":
        return (
          <span className="text-sm text-secondary">{order.address}</span>
        );
      case "date":
        return (
          <span className="text-sm text-secondary">
            {formatDate(order.date)}
          </span>
        );
      case "type":
        return (
          <span className="text-sm text-secondary">
            {t(`orderTypes.${order.type}`)}
          </span>
        );
      case "status":
        return <OrderStatusBadge status={order.status} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-page min-h-screen">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
          <ClipboardList className="w-6 h-6 text-warning" />
        </div>
        <h1 className="text-2xl font-semibold text-primary">
          {t("orderList")}
        </h1>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
      />

      {/* Orders Table */}
      <TableCommon
        columns={columns}
        data={paginatedOrders}
        renderCell={renderCell}
        loading={isLoading}
        hasPagination={true}
        pageCount={pageCount}
        pageCurrent={currentPage}
        onPageChange={setCurrentPage}
        pageSize={ITEMS_PER_PAGE}
        totalItems={filteredOrders.length}
        pageRangeDisplayed={5}
        marginPagesDisplayed={2}
        className="card"
      />
    </div>
  );
}
