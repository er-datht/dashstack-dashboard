import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import classnames from "classnames";
import TableCommon, { type ColumnDefinition } from "../TableCommon";
import getDealDetailsColumns from "./columns";
import type { Deal, DealDetailsTableProps } from "./types";
import { useDeals } from "../../hooks/useDeals";
import styles from "./DealDetailsTable.module.scss";

const DealDetailsTable = ({ className = "" }: DealDetailsTableProps) => {
  const { t } = useTranslation("dashboard");
  const { deals, isLoading, error } = useDeals();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("october");
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 10;

  // Pagination logic
  const pageCount = Math.ceil(deals.length / itemsPerPage);
  const paginatedDeals = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return deals.slice(startIndex, startIndex + itemsPerPage);
  }, [deals, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setIsDropdownOpen(false);
  };

  // Get columns configuration from columns.tsx with translation function
  const dealColumns = getDealDetailsColumns(t);

  // Convert to ColumnDefinition for TableCommon
  const columns: ColumnDefinition<Deal>[] = dealColumns.map((col) => ({
    key: col.key,
    header: col.header,
    align: col.align,
    width: col.width,
  }));

  // Render cell content using the formatters from columns.tsx
  const renderCell = (deal: Deal, column: ColumnDefinition<Deal>) => {
    const dealColumn = dealColumns.find((col) => col.key === column.key);

    if (dealColumn?.formatter && dealColumn.dataField) {
      // Use the formatter if defined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return dealColumn.formatter((deal as any)[dealColumn.dataField], deal);
    }

    if (dealColumn?.dataField) {
      // Otherwise return the raw value
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (deal as any)[dealColumn.dataField];
    }

    return null;
  };

  return (
    <div className={classnames("card", styles.container, className)}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={classnames("text-primary", styles.title)}>
          {t("dealDetailsTitle")}
        </h2>

        {/* Month Dropdown */}
        <div className={styles.dropdown}>
          <button
            className={classnames(
              "text-primary hover-bg-muted hover-border-primary",
              styles.dropdownButton
            )}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            disabled={isLoading}
          >
            <span>{t(`months.${selectedMonth}`)}</span>
            <ChevronDown
              className={classnames(styles.dropdownIcon, {
                [styles.open]: isDropdownOpen,
              })}
            />
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              {[
                "january",
                "february",
                "march",
                "april",
                "may",
                "june",
                "july",
                "august",
                "september",
                "october",
                "november",
                "december",
              ].map((month) => (
                <button
                  key={month}
                  className={classnames(
                    "text-primary hover-bg-muted",
                    styles.dropdownItem,
                    {
                      [styles.active]: month === selectedMonth,
                      "bg-sidebar-menu-active text-sidebar-menu-active":
                        month === selectedMonth,
                    }
                  )}
                  onClick={() => handleMonthSelect(month)}
                >
                  {t(`months.${month}`)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Content */}
      {error ? (
        <div className={styles.errorState}>
          <p className={classnames("text-error", styles.errorText)}>
            Error: {error}
          </p>
        </div>
      ) : (
        <TableCommon
          columns={columns}
          data={paginatedDeals}
          renderCell={renderCell}
          loading={isLoading}
          hasPagination={true}
          pageCount={pageCount}
          pageCurrent={currentPage}
          onPageChange={handlePageChange}
          pageSize={itemsPerPage}
          totalItems={deals.length}
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
        />
      )}
    </div>
  );
};

export default DealDetailsTable;
