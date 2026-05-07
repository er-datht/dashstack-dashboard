/**
 * Tests for productStockService — direct, service-level coverage of the
 * persistence behavior documented in
 *   openspec/changes/implement-product-stock-edit-delete/specs/product-stock-persistence/spec.md
 *
 * The service caches its in-memory array at module scope, so we use
 * `vi.resetModules()` between tests to force fresh imports and prevent
 * cross-test bleed.
 */

const STORAGE_KEY = "dashstack-product-stock";
const CURRENT_VERSION = 1;

type ProductStockServiceModule = typeof import("../productStock");

async function importFreshService(): Promise<ProductStockServiceModule> {
  vi.resetModules();
  return await import("../productStock");
}

describe("productStockService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("first read (hydration)", () => {
    it("seeds storage and returns the seed when localStorage is empty", async () => {
      const { productStockService } = await importFreshService();

      const products = await productStockService.getProductStock();

      expect(products.length).toBeGreaterThan(0);
      // Seed data was written through.
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.version).toBe(CURRENT_VERSION);
      expect(parsed.data).toHaveLength(products.length);
    });

    it("returns the stored data when localStorage has a valid entry with the current version", async () => {
      const stored = [
        {
          id: "stored-1",
          image: "img.jpg",
          name: "Stored Product",
          category: "Test",
          price: 42,
          amount: 7,
          availableColors: [{ name: "Black", hex: "#000000" }],
        },
      ];
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: CURRENT_VERSION, data: stored }),
      );

      const { productStockService } = await importFreshService();
      const products = await productStockService.getProductStock();

      expect(products).toHaveLength(1);
      expect(products[0].id).toBe("stored-1");
      expect(products[0].name).toBe("Stored Product");
    });
  });

  describe("invalid storage falls back to seed", () => {
    it("resets to seed when stored JSON is malformed", async () => {
      localStorage.setItem(STORAGE_KEY, "{not valid json");

      const { productStockService } = await importFreshService();
      const products = await productStockService.getProductStock();

      // Seed has multiple entries; malformed value should not produce them.
      expect(products.length).toBeGreaterThan(1);
      // Storage was rewritten with the current schema version.
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(raw!);
      expect(parsed.version).toBe(CURRENT_VERSION);
    });

    it("resets to seed when stored schema version does not match the current version", async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 999,
          data: [
            {
              id: "old",
              image: "img.jpg",
              name: "Old",
              category: "Old",
              price: 1,
              amount: 1,
              availableColors: [],
            },
          ],
        }),
      );

      const { productStockService } = await importFreshService();
      const products = await productStockService.getProductStock();

      // The "old" entry is discarded; seed (multiple entries) is returned.
      expect(products.length).toBeGreaterThan(1);
      expect(products.find((p) => p.id === "old")).toBeUndefined();
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(parsed.version).toBe(CURRENT_VERSION);
    });
  });

  describe("write-through", () => {
    // Pre-seed localStorage with a known fixture so the test does not depend
    // on the service module's in-memory cache state (which is module-scoped
    // and outlives `vi.resetModules` in some test runners).
    const fixture = [
      {
        id: "a",
        image: "img-a.jpg",
        name: "A",
        category: "Cat",
        price: 10,
        amount: 1,
        availableColors: [{ name: "Black", hex: "#000000" }],
      },
      {
        id: "b",
        image: "img-b.jpg",
        name: "B",
        category: "Cat",
        price: 20,
        amount: 2,
        availableColors: [{ name: "Red", hex: "#FF0000" }],
      },
      {
        id: "c",
        image: "img-c.jpg",
        name: "C",
        category: "Cat",
        price: 30,
        amount: 3,
        availableColors: [{ name: "Blue", hex: "#0000FF" }],
      },
    ];

    function seedFixture() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: CURRENT_VERSION, data: fixture }),
      );
    }

    it("persists deletions to localStorage", async () => {
      seedFixture();
      const { productStockService } = await importFreshService();

      const before = await productStockService.getProductStock();
      expect(before).toHaveLength(3);

      await productStockService.deleteProduct("b");

      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(parsed.data.find((p: { id: string }) => p.id === "b")).toBeUndefined();
      expect(parsed.data).toHaveLength(2);
    });

    it("persists updates to localStorage with merged fields", async () => {
      seedFixture();
      const { productStockService } = await importFreshService();

      await productStockService.getProductStock();

      const merged = await productStockService.updateProduct("a", {
        amount: 999,
      });

      expect(merged.amount).toBe(999);
      // Other fields preserved.
      expect(merged.name).toBe("A");
      expect(merged.price).toBe(10);

      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      const stored = parsed.data.find((p: { id: string }) => p.id === "a");
      expect(stored.amount).toBe(999);
      expect(stored.name).toBe("A");
    });
  });

  describe("updateProduct error path", () => {
    it("rejects with an error when the id is unknown and does not modify storage", async () => {
      const { productStockService } = await importFreshService();
      // Hydrate first so the storage envelope exists.
      await productStockService.getProductStock();
      const before = localStorage.getItem(STORAGE_KEY);

      await expect(
        productStockService.updateProduct("does-not-exist", { amount: 1 }),
      ).rejects.toThrow();

      // Storage must be untouched.
      expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
    });
  });
});
