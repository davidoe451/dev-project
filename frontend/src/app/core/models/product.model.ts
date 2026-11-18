export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: string | number;
  stock: number;
  categoryId: string;
  brand?: string;
  brandSlug?: string;
  sizes: string;
  images: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ProductCategory;
}

export interface ProductsResponseData {
  items: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  categoryId: string;
  slug?: string;
  description?: string;
  stock?: number;
  brand?: string;
  sizes?: string;
  images?: string;
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  brand?: string;
  sizes?: string;
  images?: string;
  isActive?: boolean;
  description?: string;
  slug?: string;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
}
