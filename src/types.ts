export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  quantity?: number;
}

export interface Category {
  id: number;
  name: string;
  image: string;
  productCount: number;
}
