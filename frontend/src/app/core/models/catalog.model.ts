export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  origin?: string;
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  price: number;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  material: string;
  basePrice: number;
  categoryId: number;
  category: Category;
  brandId: number;
  brand: Brand;
  gender: 'men' | 'women' | 'unisex';
  season: 'fw26' | 'ss26' | 'core';
  images: ProductImage[];
  variants: ProductVariant[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export type ProductSortOption = 'newest' | 'price_asc' | 'price_desc';

export interface ProductQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  gender?: string;
  season?: string;
  size?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  inStockOnly?: boolean;
  sort?: ProductSortOption;
  page?: number;
  limit?: number;
}

export interface PaginatedProductsResult {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  availableSizes: string[];
}
