import { renderHook, waitFor, act } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React from "react";
import type { ProductStock } from "../../types/productStock";

/**
 * Tests for the new useProductStock hook at src/hooks/useProductStock.ts.
 *
 * SPEC: Behavior derived from
 *   openspec/changes/implement-product-stock-edit-delete/design.md (D3, D4)
 *   openspec/changes/implement-product-stock-edit-delete/specs/product-stock-persistence/spec.md
 *
 *   Hook contract from design.md D3:
 *     useProductStock(): {
 *       products, isLoading, error,
 *       deleteProduct(id) => Promise<void>,
 *       updateProduct(id, patch) => Promise<ProductStock>,
 *       refetch,
 *       isDeletingProduct,
 *       isUpdatingProduct,
 *     }
 *   Query key: ["productStock"]
 *
 *   Coverage:
 *   - Initial render: isLoading then settles with products
 *   - deleteProduct optimistically removes from cache before resolution
 *   - deleteProduct rollback restores cache when service rejects
 *   - updateProduct optimistically merges patch into cache
 *   - updateProduct rollback restores cache when service rejects
 *   - localStorage write-through after a successful delete
 *
 *   The implementation file does not yet exist — the import on line 35 will
 *   fail until opsx:apply creates it. That is the intended TDD failure.
 */

// --- Mock the productStockService -----------------------------------------
//
// The hook delegates all I/O to productStockService. We mock the service so we
// can drive resolve/reject paths deterministically without a network or a
// fake timer dance.
const mockGetProductStock = vi.fn<() => Promise<ProductStock[]>>();
const mockDeleteProduct = vi.fn<(id: string) => Promise<void>>();
const mockUpdateProduct = vi.fn<
  (id: string, patch: Partial<ProductStock>) => Promise<ProductStock>
>();

vi.mock("../../services/productStock", () => ({
  productStockService: {
    getProductStock: () => mockGetProductStock(),
    deleteProduct: (id: string) => mockDeleteProduct(id),
    updateProduct: (id: string, patch: Partial<ProductStock>) =>
      mockUpdateProduct(id, patch),
  },
}));

// Import AFTER the vi.mock so the hook resolves the mocked service.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { useProductStock } from "../useProductStock";

// --- Fixtures -------------------------------------------------------------

const seed: ProductStock[] = [
  {
    id: "1",
    image: "img-1.jpg",
    name: "Galaxy Watch Active 2",
    category: "Digital Product",
    price: 999,
    amount: 10,
    availableColors: [{ name: "Black", hex: "#000000" }],
  },
  {
    id: "2",
    image: "img-2.jpg",
    name: "Premium Sunglasses",
    category: "Fashion",
    price: 450,
    amount: 25,
    availableColors: [{ name: "Black", hex: "#000000" }],
  },
];

// --- Helpers --------------------------------------------------------------

function makeWrapper(): {
  wrapper: React.FC<{ children: React.ReactNode }>;
  queryClient: QueryClient;
} {
  // A fresh QueryClient per test isolates the cache and disables retries so
  // rejected mutations surface immediately (rather than retrying).
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );

  return { wrapper, queryClient };
}

describe("useProductStock", () => {
  beforeEach(() => {
    mockGetProductStock.mockReset();
    mockDeleteProduct.mockReset();
    mockUpdateProduct.mockReset();
    localStorage.clear();
  });

  describe("initial fetch", () => {
    it("starts in isLoading=true and settles with the fetched products", async () => {
      mockGetProductStock.mockResolvedValueOnce(seed);

      const { wrapper } = makeWrapper();
      const { result } = renderHook(() => useProductStock(), { wrapper });

      // SPEC: design.md D3 — products defaults to [] until query resolves.
      expect(result.current.isLoading).toBe(true);
      expect(result.current.products).toEqual([]);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual(seed);
      expect(result.current.error).toBeNull();
    });
  });

  describe("deleteProduct - optimistic update", () => {
    it("removes the entry from the cache optimistically before the mutation resolves", async () => {
      mockGetProductStock.mockResolvedValueOnce(seed);

      // Hold the delete promise open so we can observe the optimistic state
      // before the mutation resolves.
      let resolveDelete: () => void = () => {};
      mockDeleteProduct.mockImplementationOnce(
        () => new Promise<void>((resolve) => (resolveDelete = resolve))
      );

      const { wrapper } = makeWrapper();
      const { result } = renderHook(() => useProductStock(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.products).toHaveLength(2);

      // Fire the delete but don't await — onMutate should run synchronously
      // and update the cache.
      let deletePromise: Promise<void>;
      act(() => {
        deletePromise = result.current.deleteProduct("1");
      });

      // Optimistic state: the deleted id is already gone from products.
      await waitFor(() => {
        expect(result.current.products.map((p) => p.id)).toEqual(["2"]);
      });

      // Resolve the underlying service call and let the mutation finish.
      await act(async () => {
        resolveDelete();
        await deletePromise!;
      });

      expect(result.current.products.map((p) => p.id)).toEqual(["2"]);
    });
  });

  describe("deleteProduct - rollback on error", () => {
    it("restores the cache to the pre-mutation snapshot when the service rejects", async () => {
      mockGetProductStock.mockResolvedValueOnce(seed);
      mockDeleteProduct.mockRejectedValueOnce(new Error("network down"));

      const { wrapper } = makeWrapper();
      const { result } = renderHook(() => useProductStock(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.products).toHaveLength(2);

      await act(async () => {
        await expect(result.current.deleteProduct("1")).rejects.toThrow();
      });

      // SPEC: design.md D3 delete `onError` restores the snapshot — both
      // entries are present again.
      expect(result.current.products.map((p) => p.id).sort()).toEqual([
        "1",
        "2",
      ]);
    });
  });

  describe("updateProduct - optimistic merge", () => {
    it("merges the patch into the cached entry optimistically", async () => {
      mockGetProductStock.mockResolvedValueOnce(seed);

      let resolveUpdate: (value: ProductStock) => void = () => {};
      mockUpdateProduct.mockImplementationOnce(
        () =>
          new Promise<ProductStock>(
            (resolve) => (resolveUpdate = resolve)
          )
      );

      const { wrapper } = makeWrapper();
      const { result } = renderHook(() => useProductStock(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let updatePromise: Promise<ProductStock>;
      act(() => {
        updatePromise = result.current.updateProduct("1", { amount: 99 });
      });

      // Optimistic merge applied before service resolves: id 1 now has
      // amount=99 and retains other fields.
      await waitFor(() => {
        const entry = result.current.products.find((p) => p.id === "1");
        expect(entry?.amount).toBe(99);
        expect(entry?.name).toBe("Galaxy Watch Active 2");
      });

      const serverResponse: ProductStock = {
        ...seed[0],
        amount: 99,
      };

      await act(async () => {
        resolveUpdate(serverResponse);
        await updatePromise!;
      });

      const finalEntry = result.current.products.find((p) => p.id === "1");
      expect(finalEntry).toEqual(serverResponse);
    });
  });

  describe("updateProduct - rollback on error", () => {
    it("restores the previous entry when the service rejects", async () => {
      mockGetProductStock.mockResolvedValueOnce(seed);
      mockUpdateProduct.mockRejectedValueOnce(new Error("server 500"));

      const { wrapper } = makeWrapper();
      const { result } = renderHook(() => useProductStock(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await expect(
          result.current.updateProduct("1", { amount: 99 })
        ).rejects.toThrow();
      });

      // SPEC: design.md D3 update `onError` restores the snapshot — id 1's
      // amount is back to its original value of 10.
      const entry = result.current.products.find((p) => p.id === "1");
      expect(entry?.amount).toBe(10);
    });
  });

  describe("localStorage write-through after delete", () => {
    it("writes the post-delete array to localStorage under dashstack-product-stock", async () => {
      // SPEC: openspec/changes/.../specs/product-stock-persistence/spec.md
      //   Storage key: "dashstack-product-stock"
      //   Stored value: { version: number, data: ProductStock[] }
      //
      // Persistence lives inside productStockService.deleteProduct (design.md
      // D4), so the mocked deleteProduct simulates that write-through.
      mockGetProductStock.mockResolvedValueOnce(seed);
      mockDeleteProduct.mockImplementationOnce(async (id: string) => {
        const remaining = seed.filter((p) => p.id !== id);
        localStorage.setItem(
          "dashstack-product-stock",
          JSON.stringify({ version: 1, data: remaining })
        );
      });

      const { wrapper } = makeWrapper();
      const { result } = renderHook(() => useProductStock(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.deleteProduct("1");
      });

      const raw = localStorage.getItem("dashstack-product-stock");
      expect(raw).not.toBeNull();

      const parsed = JSON.parse(raw!) as {
        version: number;
        data: ProductStock[];
      };
      expect(parsed.data.map((p) => p.id)).toEqual(["2"]);
    });
  });
});
