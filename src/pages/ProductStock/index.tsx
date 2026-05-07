import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Search, Pencil, Trash2, Archive } from "lucide-react";
import { useProductStock } from "../../hooks/useProductStock";
import type { ProductStock, ProductColor } from "../../types/productStock";
import TableCommon, {
  type ColumnDefinition,
} from "../../components/TableCommon";
import ConfirmModal from "../../components/ConfirmModal";

type ColorDotsProps = {
  colors: ProductColor[];
  maxVisible?: number;
};

function ColorDots({
  colors,
  maxVisible = 4,
}: ColorDotsProps): React.JSX.Element {
  const visibleColors = colors.slice(0, maxVisible);
  const remainingCount = colors.length - maxVisible;

  return (
    <div className="flex items-center gap-1.5">
      {visibleColors.map((color, index) => (
        <div
          key={index}
          className="w-5 h-5 rounded-full"
          style={{ backgroundColor: color.hex }}
          title={color.name}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-sm text-secondary ml-1">+{remainingCount}</span>
      )}
    </div>
  );
}

export default function ProductStock(): React.JSX.Element {
  const { t } = useTranslation("products");
  const navigate = useNavigate();

  const { products, isLoading, deleteProduct } = useProductStock();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    text: string;
    variant: "success" | "error";
  } | null>(null);

  const itemsPerPage = 10;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (
    text: string,
    variant: "success" | "error" = "success",
  ) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ text, variant });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(query),
    );
  }, [products, searchQuery]);

  // Pagination logic
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Page-clamp: when the current page becomes empty (e.g. after deleting the
  // last item on it, or after a search filter narrows results so the active
  // page no longer has rows), drop to the last non-empty page.
  useEffect(() => {
    if (paginatedProducts.length === 0 && pageCount > 0) {
      setCurrentPage(pageCount - 1);
    }
  }, [paginatedProducts.length, pageCount]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (productId: string) => {
    navigate(`/products/${productId}/edit`);
  };

  const handleDelete = (productId: string) => {
    setConfirmDeleteId(productId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const idToDelete = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await deleteProduct(idToDelete);
      showToast(t("deleteSuccess"));
    } catch {
      showToast(t("updateError"), "error");
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Define columns for TableCommon
  const columns: ColumnDefinition<ProductStock>[] = [
    { key: "image", header: t("image"), align: "left", width: "80px" },
    { key: "name", header: t("productName"), align: "left" },
    { key: "category", header: t("category"), align: "left" },
    { key: "price", header: t("price"), align: "left" },
    { key: "amount", header: t("amount"), align: "left" },
    { key: "colors", header: t("availableColor"), align: "left" },
    { key: "actions", header: t("action"), align: "left", width: "120px" },
  ];

  // Render cell content
  const renderCell = (
    product: ProductStock,
    column: ColumnDefinition<ProductStock>,
  ) => {
    switch (column.key) {
      case "image":
        return (
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 rounded-lg object-cover"
            loading="lazy"
          />
        );

      case "name":
        return (
          <span className="text-sm font-medium text-primary">
            {product.name}
          </span>
        );

      case "category":
        return (
          <span className="text-sm text-secondary">{product.category}</span>
        );

      case "price":
        return (
          <span className="text-sm font-semibold text-primary">
            {formatCurrency(product.price)}
          </span>
        );

      case "amount":
        return <span className="text-sm text-secondary">{product.amount}</span>;

      case "colors":
        return <ColorDots colors={product.availableColors} />;

      case "actions":
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(product.id);
              }}
              className="p-2 rounded-lg transition-all hover-bg-brand-light shrink-0"
              title={t("edit")}
              aria-label={`${t("edit")} ${product.name}`}
            >
              <Pencil className="w-4 h-4 shrink-0 text-brand-primary" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(product.id);
              }}
              className="p-2 rounded-lg transition-all hover:bg-danger-muted shrink-0"
              title={t("delete")}
              aria-label={`${t("delete")} ${product.name}`}
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
    <div className="p-6 bg-page min-h-screen">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-on-primary px-4 py-3 rounded-lg shadow-lg ${
            toast.variant === "success"
              ? "bg-[var(--color-success-500)]"
              : "bg-[var(--color-error-500)]"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.text}
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 me-4">
          <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center">
            <Archive className="w-6 h-6 text-primary icon-brand" />
          </div>
          <h1 className="text-2xl font-semibold text-primary">
            {t("productStock")}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-sm bg-surface-primary rounded-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
            <input
              type="text"
              placeholder={t("searchByName")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none text-primary bg-surface border border-default focus:border-transparent placeholder:text-topnav-text-secondary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Product Stock Table */}
      <TableCommon
        columns={columns}
        data={paginatedProducts}
        renderCell={renderCell}
        loading={isLoading}
        hasPagination={true}
        pageCount={pageCount}
        pageCurrent={currentPage}
        onPageChange={handlePageChange}
        pageSize={itemsPerPage}
        totalItems={filteredProducts.length}
        pageRangeDisplayed={5}
        marginPagesDisplayed={2}
        className="card"
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        title={t("confirmDeleteTitle")}
        message={t("deleteConfirm")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
