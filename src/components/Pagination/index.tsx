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
        <div className="text-sm font-semibold text-secondary">
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
        pageClassName="text-primary"
        pageLinkClassName="min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors hover-bg-muted flex items-center justify-center cursor-pointer focus:outline-none"
        // Active page
        activeClassName=""
        activeLinkClassName="bg-primary !text-on-primary hover-bg-primary-dark"
        // Previous button
        previousClassName=""
        previousLinkClassName="p-2 rounded-lg border border-default !text-primary hover-bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer focus:outline-none"
        // Next button
        nextClassName=""
        nextLinkClassName="p-2 rounded-lg border border-default !text-primary hover-bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer focus:outline-none"
        // Break (ellipsis)
        breakClassName=""
        breakLinkClassName="min-w-[40px] h-10 px-3 flex items-center justify-center !text-tertiary cursor-default"
        // Disabled state
        disabledClassName="opacity-50 cursor-not-allowed"
        disabledLinkClassName="pointer-events-none"
      />
    </div>
  );
};

export default Pagination;
