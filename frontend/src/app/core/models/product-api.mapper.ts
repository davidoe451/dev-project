import type { Product as CatalogProduct, PaginatedProductsResult } from './catalog.model';
import type { ApiResponse, Product, ProductsResponseData, ProductCategory } from './product.model';

export function unwrapResponse<T>(response: T | ApiResponse<T>): T {
  return typeof response === 'object' && response !== null && 'data' in response ? response.data : response;
}

export function mapAdminProduct(product: Product | CatalogProduct): Product {
  if (!('basePrice' in product)) {
    return { ...product, id: String(product.id), categoryId: String(product.categoryId) };
  }
  return {
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.basePrice,
    stock: product.variants.reduce((total, variant) => total + variant.stock, 0),
    categoryId: String(product.categoryId),
    category: product.category ? {
      id: String(product.category.id), name: product.category.name, slug: product.category.slug,
    } : undefined,
    brand: product.brand?.name,
    brandSlug: product.brand?.slug,
    sizes: [...new Set(product.variants.map((variant) => variant.size))].join(','),
    images: [...product.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder).map((image) => image.url).join(','),
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.createdAt,
  };
}

export function mapAdminProducts(response: ProductsResponseData | PaginatedProductsResult): ProductsResponseData {
  return {
    items: response.items.map(mapAdminProduct),
    meta: 'meta' in response ? response.meta : {
      total: response.total, page: response.page, limit: response.limit, totalPages: response.totalPages,
    },
  };
}

export function mapAdminCategories(categories: ProductCategory[]): ProductCategory[] {
  return categories.map((category) => ({ ...category, id: String(category.id) }));
}
