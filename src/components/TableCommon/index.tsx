import classnames from "classnames";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import styles from "./TableCommon.module.scss";
import Pagination from "../Pagination";

export type ColumnDefinition<T = unknown> = {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  width?: string;
  _phantom?: T; // Phantom type parameter to satisfy TypeScript
};

export type TableCommonProps<T> = {
  columns: ColumnDefinition<T>[];
  data: T[];
  renderCell: (item: T, column: ColumnDefinition<T>) => React.ReactNode;
  className?: string;
  onRowClick?: (item: T) => void;
  // Pagination props
  hasPagination?: boolean;
  pageCount?: number;
  pageCurrent?: number; // 0-indexed
  onPageChange?: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
  pageRangeDisplayed?: number;
  marginPagesDisplayed?: number;
  // Loading state
  loading?: boolean;
};

function TableCommon<T>({
  columns,
  data,
  renderCell,
  className = "",
  onRowClick,
  hasPagination = true,
  pageCount = 1,
  pageCurrent = 0,
  onPageChange,
  pageSize = 10,
  totalItems = 0,
  pageRangeDisplayed = 5,
  marginPagesDisplayed = 2,
  loading = false,
}: TableCommonProps<T>) {
  const { t } = useTranslation("common");

  const getAlignmentClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

  return (
    <>
      <div className={classnames(styles.tableWrapper, className)}>
        <div className={styles.tableContainer}>
          {loading && (
            <div className={styles.loadingOverlay}>
              <Loader2 className={styles.spinner} size={40} />
            </div>
          )}
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={classnames(
                      styles.tableHeaderCell,
                      getAlignmentClass(column.align)
                    )}
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className={styles.emptyState}>
                    {!loading ? t("noData") : t("loading")}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={index}
                    className={classnames(styles.tableRow, {
                      [styles.clickable]: !!onRowClick,
                    })}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={classnames(
                          styles.tableCell,
                          getAlignmentClass(column.align)
                        )}
                      >
                        {renderCell(item, column)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hasPagination && pageCount > 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={pageCurrent}
            totalPages={pageCount}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            totalItems={totalItems}
            showInfo={true}
            pageRangeDisplayed={pageRangeDisplayed}
            marginPagesDisplayed={marginPagesDisplayed}
          />
        </div>
      )}
    </>
  );
}

export default TableCommon;
