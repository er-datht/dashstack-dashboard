import type { ProductStock } from '../types/productStock';

// localStorage persistence (D4) — schema-versioned write-through.
const STORAGE_KEY = 'dashstack-product-stock';
const SCHEMA_VERSION = 1;

type StoredShape = {
  version: number;
  data: ProductStock[];
};

// Mock product stock data
const seedProductStockData: ProductStock[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop',
    name: 'Galaxy Watch Active 2',
    category: 'Digital Product',
    price: 999,
    amount: 10,
    availableColors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Blue', hex: '#4880FF' },
      { name: 'Orange', hex: '#FF6B35' },
    ],
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    name: 'Premium Sunglasses',
    category: 'Fashion',
    price: 450,
    amount: 25,
    availableColors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Yellow', hex: '#FFB800' },
    ],
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    name: 'Wireless Headphones',
    category: 'Digital Product',
    price: 1250,
    amount: 15,
    availableColors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Blue', hex: '#4880FF' },
      { name: 'Purple', hex: '#9333EA' },
      { name: 'Pink', hex: '#EC4899' },
    ],
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    name: 'Running Sneakers',
    category: 'Fashion',
    price: 850,
    amount: 30,
    availableColors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Orange', hex: '#FF6B35' },
      { name: 'Green', hex: '#22C55E' },
      { name: 'Blue', hex: '#4880FF' },
    ],
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop',
    name: 'Leather Handbag',
    category: 'Fashion',
    price: 2100,
    amount: 8,
    availableColors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Yellow', hex: '#FFB800' },
      { name: 'Pink', hex: '#EC4899' },
    ],
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop',
    name: 'Smart Watch Pro',
    category: 'Digital Product',
    price: 1800,
    amount: 12,
    availableColors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Blue', hex: '#4880FF' },
      { name: 'Red', hex: '#EF4444' },
    ],
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop',
    name: 'Casual T-Shirt',
    category: 'Fashion',
    price: 299,
    amount: 50,
    availableColors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Blue', hex: '#4880FF' },
      { name: 'Green', hex: '#22C55E' },
      { name: 'Yellow', hex: '#FFB800' },
      { name: 'Purple', hex: '#9333EA' },
    ],
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop',
    name: 'Laptop Stand',
    category: 'Digital Product',
    price: 550,
    amount: 20,
    availableColors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Orange', hex: '#FF6B35' },
    ],
  },
  {
    id: '9',
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop',
    name: 'Designer Jacket',
    category: 'Fashion',
    price: 3500,
    amount: 5,
    availableColors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Blue', hex: '#4880FF' },
      { name: 'Purple', hex: '#9333EA' },
    ],
  },
  {
    id: '10',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    name: 'Bluetooth Speaker',
    category: 'Digital Product',
    price: 750,
    amount: 18,
    availableColors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Red', hex: '#EF4444' },
      { name: 'Green', hex: '#22C55E' },
      { name: 'Yellow', hex: '#FFB800' },
    ],
  },
];

// Module-scoped in-memory array — lazily initialized from localStorage on
// first read. Subsequent calls return the same reference.
let productStockData: ProductStock[] | null = null;

/**
 * Read the stored value from localStorage and validate its shape +
 * schema version. Returns `null` on any failure (missing key, JSON parse
 * error, version mismatch, malformed shape) so the caller can fall back
 * to seed.
 */
function loadFromStorage(): ProductStock[] | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredShape;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.version !== SCHEMA_VERSION ||
      !Array.isArray(parsed.data)
    ) {
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Serialize the current array under the schema-versioned envelope.
 * Silently no-ops on storage errors (quota exceeded, disabled storage).
 */
function writeToStorage(data: ProductStock[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const payload: StoredShape = { version: SCHEMA_VERSION, data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Persistence is best-effort — never break the UX over a write failure.
  }
}

/**
 * Lazy-init the in-memory array. On first call, hydrates from
 * localStorage; on miss/error, falls back to a fresh copy of the seed and
 * persists it so subsequent reads succeed.
 */
function ensureLoaded(): ProductStock[] {
  if (productStockData !== null) return productStockData;

  const stored = loadFromStorage();
  if (stored) {
    productStockData = stored;
  } else {
    // Clone the seed so consumers can mutate without poisoning the seed.
    productStockData = seedProductStockData.map((p) => ({
      ...p,
      availableColors: p.availableColors.map((c) => ({ ...c })),
    }));
    writeToStorage(productStockData);
  }

  return productStockData;
}

export const productStockService = {
  /**
   * Get all product stock data
   * Simulates API call with delay; hydrates from localStorage on first read.
   */
  async getProductStock(): Promise<ProductStock[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return ensureLoaded();
  },

  /**
   * Delete a product by ID
   * Simulates API delete operation; writes through to localStorage.
   */
  async deleteProduct(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = ensureLoaded();
    const index = current.findIndex((product) => product.id === id);
    if (index !== -1) {
      current.splice(index, 1);
      writeToStorage(current);
    }
  },

  /**
   * Update a product by ID with a partial patch.
   * Returns the merged entry. Throws if the id is unknown.
   * Note: `availableColors` is replaced (not merged) to match form semantics.
   */
  async updateProduct(
    id: string,
    patch: Partial<ProductStock>,
  ): Promise<ProductStock> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = ensureLoaded();
    const index = current.findIndex((product) => product.id === id);
    if (index === -1) {
      throw new Error(`ProductStock entry with id "${id}" not found`);
    }
    const merged: ProductStock = { ...current[index], ...patch };
    current[index] = merged;
    writeToStorage(current);
    return merged;
  },
};
