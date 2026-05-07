import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import ProductStock from "../index";
import type { ProductStock as ProductStockType } from "../../../types/productStock";

/**
 * Tests for the ProductStock listing page (src/pages/ProductStock/index.tsx).
 *
 * SPEC: Behavior derived from
 *   openspec/changes/implement-product-stock-edit-delete/specs/product-stock/spec.md
 *
 *   Coverage:
 *   - Page renders rows from the useProductStock hook
 *   - Trash button opens the ConfirmModal (alertdialog)
 *   - Cancel in modal closes it without removing the row
 *   - Confirm removes the row AND surfaces the deleteSuccess toast
 *   - Page-clamp: deleting the only row on page 2 drops the page index to 1
 *   - Pencil button navigates to /products/:id/edit
 *
 *   useProductStock and react-router-dom's useNavigate are both mocked so the
 *   tests don't need a real QueryClientProvider or Router.
 *
 *   The implementation has not yet wired Edit/Delete (they currently log) and
 *   the useProductStock hook does not yet exist — the rewrite per
 *   tasks.md §4–§5 is the TDD target. Tests are expected to fail until then.
 */

// --- Mocks ----------------------------------------------------------------

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// useProductStock mock — drives the page's data + mutation surface.
const mockDeleteProduct = vi.fn();
const mockUpdateProduct = vi.fn();
const mockUseProductStockReturn = {
  products: [] as ProductStockType[],
  isLoading: false,
  error: null as string | null,
  deleteProduct: mockDeleteProduct,
  updateProduct: mockUpdateProduct,
  refetch: vi.fn(),
  isDeletingProduct: false,
  isUpdatingProduct: false,
};

vi.mock("../../../hooks/useProductStock", () => ({
  useProductStock: () => mockUseProductStockReturn,
}));

// --- Fixtures -------------------------------------------------------------

function makeProduct(id: string, name: string): ProductStockType {
  return {
    id,
    image: `img-${id}.jpg`,
    name,
    category: "Digital Product",
    price: 100,
    amount: 10,
    availableColors: [{ name: "Black", hex: "#000000" }],
  };
}

const twoProducts: ProductStockType[] = [
  makeProduct("1", "Galaxy Watch"),
  makeProduct("2", "Premium Sunglasses"),
];

// 11 products to force pagination into 2 pages (itemsPerPage = 10).
const elevenProducts: ProductStockType[] = Array.from({ length: 11 }, (_, i) =>
  makeProduct(String(i + 1), `Product ${i + 1}`)
);

// --- Tests ----------------------------------------------------------------

describe("ProductStock page", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockDeleteProduct.mockReset();
    mockUpdateProduct.mockReset();
    mockUseProductStockReturn.products = twoProducts;
    mockUseProductStockReturn.isLoading = false;
    mockUseProductStockReturn.error = null;
    mockUseProductStockReturn.isDeletingProduct = false;
    mockUseProductStockReturn.isUpdatingProduct = false;
  });

  describe("rendering", () => {
    it("renders rows from the useProductStock hook", () => {
      render(<ProductStock />);

      expect(screen.getByText("Galaxy Watch")).toBeInTheDocument();
      expect(screen.getByText("Premium Sunglasses")).toBeInTheDocument();
    });
  });

  describe("delete flow", () => {
    it("opens the ConfirmModal when the trash button is clicked", () => {
      render(<ProductStock />);

      const trashButton = screen.getByRole("button", {
        name: /delete Galaxy Watch/i,
      });
      fireEvent.click(trashButton);

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("closes the modal without removing the row when Cancel is clicked", () => {
      render(<ProductStock />);

      fireEvent.click(
        screen.getByRole("button", { name: /delete Galaxy Watch/i })
      );

      const dialog = screen.getByRole("alertdialog");
      // SPEC: ConfirmModal cancelLabel comes from the products namespace key
      // `cancel` (or whichever key the page passes — react-i18next mock
      // returns keys verbatim). The button's accessible name is exactly
      // that key.
      const cancelButton = within(dialog).getByRole("button", {
        name: "cancel",
      });
      fireEvent.click(cancelButton);

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(mockDeleteProduct).not.toHaveBeenCalled();
      // Row still present in the table.
      expect(screen.getByText("Galaxy Watch")).toBeInTheDocument();
    });

    it("removes the row, calls deleteProduct, and shows the deleteSuccess toast when Confirm is clicked", async () => {
      mockDeleteProduct.mockResolvedValueOnce(undefined);

      const { rerender } = render(<ProductStock />);

      fireEvent.click(
        screen.getByRole("button", { name: /delete Galaxy Watch/i })
      );

      const dialog = screen.getByRole("alertdialog");
      // SPEC: products namespace key `delete` is the confirm label.
      const confirmButton = within(dialog).getByRole("button", {
        name: "delete",
      });
      fireEvent.click(confirmButton);

      // The page calls deleteProduct(id) on the hook.
      expect(mockDeleteProduct).toHaveBeenCalledWith("1");

      // Simulate the optimistic cache update by updating the mock's
      // products list and re-rendering — the page would normally see this
      // change via React Query's cache.
      mockUseProductStockReturn.products = twoProducts.filter(
        (p) => p.id !== "1"
      );
      rerender(<ProductStock />);

      // Toast appears with the i18n key (mock returns keys verbatim).
      await waitFor(() => {
        expect(screen.getByText("deleteSuccess")).toBeInTheDocument();
      });

      // Row is removed from the table.
      expect(screen.queryByText("Galaxy Watch")).not.toBeInTheDocument();
    });
  });

  describe("page-clamp on delete", () => {
    it("drops currentPage from 2 → 1 when the user deletes the only row on page 2", async () => {
      // Start with 11 rows so pagination shows 2 pages (10 + 1).
      mockUseProductStockReturn.products = elevenProducts;
      mockDeleteProduct.mockResolvedValueOnce(undefined);

      const { rerender } = render(<ProductStock />);

      // Navigate to page 2. react-paginate renders page numbers as
      // <a role="button" aria-label="Page N"> when no hrefBuilder is provided
      // (which is the case in TableCommon), so we query by button role and
      // the "Page 2" accessible name.
      // The page is 0-indexed internally (currentPage 0 = page 1, 1 = page 2).
      const pageTwoButton = screen.getByRole("button", { name: "Page 2" });
      fireEvent.click(pageTwoButton);

      // Only "Product 11" should be visible on page 2.
      expect(screen.getByText("Product 11")).toBeInTheDocument();
      expect(screen.queryByText("Product 1")).not.toBeInTheDocument();

      // Click trash on Product 11 and confirm.
      fireEvent.click(
        screen.getByRole("button", { name: /delete Product 11/i })
      );
      const dialog = screen.getByRole("alertdialog");
      fireEvent.click(within(dialog).getByRole("button", { name: "delete" }));

      // After delete, the hook now reports 10 products.
      mockUseProductStockReturn.products = elevenProducts.filter(
        (p) => p.id !== "11"
      );
      rerender(<ProductStock />);

      // Page clamp: currentPage drops back to page 1 — Product 1 is visible
      // again.
      await waitFor(() => {
        expect(screen.getByText("Product 1")).toBeInTheDocument();
      });
      expect(screen.queryByText("Product 11")).not.toBeInTheDocument();
    });
  });

  describe("edit flow", () => {
    it("navigates to /products/:id/edit when the pencil button is clicked", () => {
      render(<ProductStock />);

      const pencilButton = screen.getByRole("button", {
        name: /edit Galaxy Watch/i,
      });
      fireEvent.click(pencilButton);

      // SPEC: spec.md scenario "Edit button navigates to edit route" — the
      // route uses the row's product id.
      expect(mockNavigate).toHaveBeenCalledWith("/products/1/edit");
    });
  });
});
