import type { PaginatedProductsResult, Product } from './catalog.model';

export interface CatalogApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  isActive: boolean;
  createdAt: string;
  category: { id: number; name: string; slug: string };
  brand: { id: number; name: string; slug: string };
  images: { id: number; url: string; isPrimary: boolean; sortOrder: number }[];
  variants: { id: number; sku: string; size: string; color: string; price: number | string; stock: number }[];
}

export interface CatalogApiList {
  items: CatalogApiProduct[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function mapCatalogProduct(raw: CatalogApiProduct, apiUrl: string): Product {
  if (!Array.isArray(raw.images) || !Array.isArray(raw.variants)) {
    throw new Error('Catalog response is missing variant or gallery data');
  }
  const price = Number(raw.price);
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? '',
    material: '',
    basePrice: price,
    categoryId: raw.category.id,
    category: raw.category,
    brandId: raw.brand.id,
    brand: raw.brand,
    gender: raw.category.slug === 'men' || raw.category.slug === 'women' ? raw.category.slug : 'unisex',
    season: 'core',
    images: raw.images.map((image) => ({
      ...image,
      productId: raw.id,
      url: new URL(image.url, `${apiUrl}/`).href,
      alt: raw.name,
    })),
    variants: raw.variants.map((variant) => ({
      ...variant,
      productId: raw.id,
      price: Number(variant.price ?? price),
      colorHex: ({ black: '#111827', white: '#ffffff', grey: '#64748b', gray: '#64748b', blue: '#1e3a5f' } as Record<string, string>)[variant.color.toLowerCase()] ?? '#64748b',
    })),
    isFeatured: false,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
  };
}

export function mapCatalogList(raw: CatalogApiList, apiUrl: string): PaginatedProductsResult {
  if (!Array.isArray(raw.items) || !raw.meta) throw new Error('Invalid catalog response');
  const items = raw.items.map((product) => mapCatalogProduct(product, apiUrl));
  return {
    items,
    total: raw.meta.total,
    page: raw.meta.page,
    limit: raw.meta.limit,
    totalPages: Math.max(1, raw.meta.totalPages),
    availableSizes: [...new Set(items.flatMap((product) => product.variants.map((variant) => variant.size)))],
  };
}
