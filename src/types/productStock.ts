export type ProductColor = {
  name: string;
  hex: string;
};

export type ProductStock = {
  id: string;
  image: string;
  name: string;
  category: string;
  price: number;
  amount: number;
  availableColors: ProductColor[];
};
