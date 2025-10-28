import React from "react";
import ReactPaginate from "react-paginate";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PaginationProps = {
  // Current page (0-indexed for ReactPaginate)
  currentPage: number;
  // Total number of pages
  totalPages: number;
  // Callback when page changes (0-indexed)
  onPageChange: (page: number) => void;
  // Optional: Items per page for showing "X to Y of Z"
  pageSize?: number;
  // Optional: Total items for showing "X to Y of Z"
  totalItems?: number;
  // Optional: Show pagination info text
  showInfo?: boolean;
  // Optional: Page range displayed
  pageRangeDisplayed?: number;
  // Optional: Margin pages displayed
  marginPagesDisplayed?: number;
  // Optional: Custom className
  className?: string;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  showInfo = true,
  pageRangeDisplayed = 3,
  marginPagesDisplayed = 1,
  className = "",
}) => {
  const { t } = useTranslation("common");

  // Handle page change
  const handlePageChange = (selectedItem: { selected: number }) => {
    onPageChange(selectedItem.selected);
  };

  // Calculate pagination info
  const firstItem = totalItems && pageSize ? currentPage * pageSize + 1 : 0;
  const lastItem =
    totalItems && pageSize
      ? Math.min((currentPage + 1) * pageSize, totalItems)
      : 0;

  // Don't render if only one page or no pages
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Pagination Info */}
      {showInfo && totalItems && pageSize && (
        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400!">
          {t("pagination.showing", {
            from: firstItem,
            to: lastItem,
            total: totalItems,
          })}
        </div>
      )}

      {/* ReactPaginate */}
      <ReactPaginate
        breakLabel="..."
        nextLabel={<ChevronRight className="w-5 h-5" />}
        previousLabel={<ChevronLeft className="w-5 h-5" />}
        onPageChange={handlePageChange}
        pageRangeDisplayed={pageRangeDisplayed}
        marginPagesDisplayed={marginPagesDisplayed}
        pageCount={totalPages}
        forcePage={currentPage}
        renderOnZeroPageCount={null}
        // Container
        containerClassName="flex items-center gap-2"
        // Page item
        pageClassName=""
        pageLinkClassName="min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors text-gray-700 dark:text-gray-300! hover:bg-gray-100 dark:hover:bg-gray-700! flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400! focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-0!"
        // Active page
        activeClassName=""
        activeLinkClassName="bg-primary-600! dark:bg-primary-500! text-white! hover:bg-primary-700! dark:hover:bg-primary-600! focus:outline-none! focus:ring-2! focus:ring-primary-700! dark:focus:ring-primary-500! focus:ring-offset-2! focus:ring-offset-white! dark:focus:ring-offset-0!"
        // Previous button
        previousClassName=""
        previousLinkClassName="p-2 rounded-lg border border-gray-300 dark:border-gray-600! text-gray-700 dark:text-gray-300! hover:bg-gray-100 dark:hover:bg-gray-700! disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400! focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-0!"
        // Next button
        nextClassName=""
        nextLinkClassName="p-2 rounded-lg border border-gray-300 dark:border-gray-600! text-gray-700 dark:text-gray-300! hover:bg-gray-100 dark:hover:bg-gray-700! disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400! focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-0!"
        // Break (ellipsis)
        breakClassName=""
        breakLinkClassName="min-w-[40px] h-10 px-3 flex items-center justify-center text-gray-400 dark:text-gray-500! cursor-default"
        // Disabled state
        disabledClassName="opacity-50 cursor-not-allowed"
        disabledLinkClassName="pointer-events-none"
      />
    </div>
  );
};

export default Pagination;
