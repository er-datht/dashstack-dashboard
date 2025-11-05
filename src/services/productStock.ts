import type { ProductStock } from '../types/productStock';

// Mock product stock data
const mockProductStockData: ProductStock[] = [
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

export const productStockService = {
  /**
   * Get all product stock data
   * Simulates API call with delay
   */
  async getProductStock(): Promise<ProductStock[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockProductStockData;
  },

  /**
   * Delete a product by ID
   * Simulates API delete operation
   */
  async deleteProduct(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = mockProductStockData.findIndex((product) => product.id === id);
    if (index !== -1) {
      mockProductStockData.splice(index, 1);
    }
  },
};
