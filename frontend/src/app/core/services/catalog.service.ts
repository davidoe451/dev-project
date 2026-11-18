import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Brand,
  Category,
  PaginatedProductsResult,
  Product,
  ProductQueryParams,
} from '../models/catalog.model';
import { MOCK_BRANDS, MOCK_CATEGORIES, MOCK_PRODUCTS } from '../data/mock-catalog.data';

export interface SearchSuggestionsResult {
  terms: string[];
  matchingProducts: Product[];
}

export interface CategoryOptionWithCount {
  key: string;
  label: string;
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  readonly usingSampleData = signal(false);

  retryLiveCatalog(): void {
    this.usingSampleData.set(false);
  }

  private sample<T>(value: T): Observable<T> {
    this.usingSampleData.set(true);
    return of(value);
  }

  private readProducts(response: Product[] | { data: Product[] }): Product[] {
    const products = 'data' in response ? response.data : response;
    if (!Array.isArray(products) || products.some((product) => !Array.isArray(product.variants) || !Array.isArray(product.images))) {
      throw new Error('Catalog response is missing variant or gallery data');
    }
    return products;
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<Category[] | { data: Category[] }>(`${this.apiUrl}/categories`)
      .pipe(
        map((response) => {
          const categories = 'data' in response ? response.data : response;
          if (!Array.isArray(categories)) throw new Error('Invalid category list');
          return categories;
        }),
        catchError(() => this.sample(MOCK_CATEGORIES)),
      );
  }

  getBrands(): Observable<Brand[]> {
    return this.http
      .get<Brand[] | { data: Brand[] }>(`${this.apiUrl}/brands`)
      .pipe(
        map((response) => {
          const brands = 'data' in response ? response.data : response;
          if (!Array.isArray(brands)) throw new Error('Invalid brand list');
          return brands;
        }),
        catchError(() => this.sample(MOCK_BRANDS)),
      );
  }

  getFeaturedProducts(limit = 4): Observable<Product[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http
      .get<Product[] | { data: Product[] }>(`${this.apiUrl}/products/featured`, { params })
      .pipe(
        map((response) => this.readProducts(response)),
        catchError(() =>
          this.sample(MOCK_PRODUCTS.filter((p) => p.isActive && p.isFeatured).slice(0, limit)),
        ),
      );
  }

  getCuratedDrops(categoryKey = 'ALL', limit = 4): Observable<Product[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (categoryKey && categoryKey !== 'ALL') {
      params = params.set('category', categoryKey);
    }
    return this.http
      .get<Product[] | { data: Product[] }>(`${this.apiUrl}/products/curated`, { params })
      .pipe(
        map((response) => this.readProducts(response)),
        catchError(() => {
          const active = MOCK_PRODUCTS.filter((p) => p.isActive);
          if (!categoryKey || categoryKey === 'ALL') return this.sample(active.slice(0, limit));
          const filtered = active.filter(
            (p) =>
              p.category.slug.toLowerCase() === categoryKey.toLowerCase() ||
              p.category.name.toLowerCase() === categoryKey.toLowerCase(),
          );
          return this.sample(filtered.slice(0, limit));
        }),
      );
  }

  getCategoryOptionsWithCounts(): Observable<CategoryOptionWithCount[]> {
    return this.http
      .get<CategoryOptionWithCount[] | { data: CategoryOptionWithCount[] }>(`${this.apiUrl}/categories/options`)
      .pipe(
        map((response) => {
          const options = 'data' in response ? response.data : response;
          if (!Array.isArray(options)) throw new Error('Invalid category options');
          return options;
        }),
        catchError(() => {
          const active = MOCK_PRODUCTS.filter((p) => p.isActive);
          return this.sample([
            { key: 'all', label: 'All Ready-to-Wear', count: active.length },
            ...MOCK_CATEGORIES.map((cat) => ({
              key: cat.slug,
              label: cat.name,
              count: active.filter((p) => p.categoryId === cat.id).length,
            })),
          ]);
        }),
      );
  }

  getProducts(params: ProductQueryParams): Observable<PaginatedProductsResult> {
    let httpParams = new HttpParams();

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category && params.category !== 'all') httpParams = httpParams.set('category', params.category);
    if (params.brand && params.brand !== 'all') httpParams = httpParams.set('brand', params.brand);
    if (params.gender && params.gender !== 'all') httpParams = httpParams.set('gender', params.gender);
    if (params.season && params.season !== 'all') httpParams = httpParams.set('season', params.season);
    if (params.size && params.size !== 'ALL') httpParams = httpParams.set('size', params.size);
    if (params.minPrice !== undefined && params.minPrice !== null) httpParams = httpParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined && params.maxPrice !== null) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    if (params.inStockOnly !== undefined && params.inStockOnly !== null) httpParams = httpParams.set('inStockOnly', params.inStockOnly.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http
      .get<PaginatedProductsResult | { data: PaginatedProductsResult }>(`${this.apiUrl}/products`, { params: httpParams })
      .pipe(
        map((response) => {
          const result = 'data' in response ? response.data : response;
          if (!Array.isArray(result.items) || result.items.some((product) => !Array.isArray(product.variants) || !Array.isArray(product.images))) {
            throw new Error('Catalog response is missing variant or gallery data');
          }
          return result;
        }),
        catchError(() => {
          // Fallback to local filtering if backend is unreachable
          return this.getMockProducts(params);
        }),
      );
  }

  getSearchSuggestions(rawQuery: string): Observable<SearchSuggestionsResult> {
    const q = rawQuery.trim().toLowerCase();
    if (!q) {
      return of({ terms: [], matchingProducts: [] });
    }

    const vocabulary = [
      'trench coat',
      'bomber jacket',
      'technical shell',
      'boxy hoodie',
      'wool trousers',
      'cargo jeans',
      'chelsea boots',
      'low sneakers',
      'nylon sling',
      'overshirt',
      'merino knit',
      'leather belt',
    ];

    const terms = vocabulary.filter((t) => t.includes(q)).slice(0, 4);

    return this.getProducts({ search: q, limit: 4 }).pipe(
      map((res) => ({
        terms,
        matchingProducts: res.items.slice(0, 4),
      })),
      catchError(() => {
        const matchingProducts = MOCK_PRODUCTS.filter(
          (p) =>
            p.isActive &&
            (p.name.toLowerCase().includes(q) ||
              p.brand.name.toLowerCase().includes(q) ||
              p.category.name.toLowerCase().includes(q) ||
              p.material.toLowerCase().includes(q)),
        ).slice(0, 4);
        return this.sample({ terms, matchingProducts });
      }),
    );
  }

  getProductByIdOrSlug(idOrSlug: string): Observable<Product | null> {
    return this.http
      .get<Product | { data: Product }>(`${this.apiUrl}/products/${idOrSlug}`)
      .pipe(
        map((response) => {
          const product = 'data' in response ? response.data : response;
          if (!Array.isArray(product.variants) || !Array.isArray(product.images)) {
            throw new Error('Product response is missing variant or gallery data');
          }
          return product;
        }),
        catchError(() => {
          const found =
            MOCK_PRODUCTS.find((p) => String(p.id) === idOrSlug || p.slug === idOrSlug) ?? null;
          return this.sample(found);
        }),
      );
  }

  getRelatedProducts(product: Product, limit = 4): Observable<Product[]> {
    const target = product.id ?? product.slug;
    const params = new HttpParams().set('limit', limit.toString());
    return this.http
      .get<Product[] | { data: Product[] }>(`${this.apiUrl}/products/${target}/related`, { params })
      .pipe(
        map((response) => this.readProducts(response)),
        catchError(() => {
          const related = MOCK_PRODUCTS.filter((p) => p.id !== product.id && p.isActive)
            .sort((a, b) => {
              const aSameCat = a.categoryId === product.categoryId ? 1 : 0;
              const bSameCat = b.categoryId === product.categoryId ? 1 : 0;
              return bSameCat - aSameCat;
            })
            .slice(0, limit);
          return this.sample(related);
        }),
      );
  }

  private getMockProducts(params: ProductQueryParams): Observable<PaginatedProductsResult> {
    const search = (params.search ?? '').trim().toLowerCase();
    const category = (params.category ?? '').trim().toLowerCase();
    const brand = (params.brand ?? '').trim().toLowerCase();
    const gender = (params.gender ?? '').trim().toLowerCase();
    const season = (params.season ?? '').trim().toLowerCase();
    const size = (params.size ?? '').trim().toUpperCase();
    const inStockOnly = params.inStockOnly === true;
    const minPrice = params.minPrice ?? null;
    const maxPrice = params.maxPrice ?? null;
    const sort = params.sort ?? 'newest';
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 8);

    const allActive = MOCK_PRODUCTS.filter((p) => p.isActive);

    const availableSizes = Array.from(
      new Set(allActive.flatMap((p) => p.variants.map((v) => v.size))),
    );

    let filtered = allActive.filter((product) => {
      if (search) {
        const matchesName = product.name.toLowerCase().includes(search);
        const matchesBrand = product.brand.name.toLowerCase().includes(search);
        const matchesCat = product.category.name.toLowerCase().includes(search);
        const matchesSku = product.variants.some((v) => v.sku.toLowerCase().includes(search));
        const matchesMaterial = product.material.toLowerCase().includes(search);
        if (!matchesName && !matchesBrand && !matchesCat && !matchesSku && !matchesMaterial) {
          return false;
        }
      }

      if (category && category !== 'all' && product.category.slug !== category) {
        return false;
      }

      if (brand && brand !== 'all' && product.brand.slug !== brand) {
        return false;
      }

      if (gender && gender !== 'all') {
        if (product.gender !== gender && product.gender !== 'unisex') {
          return false;
        }
      }

      if (season && season !== 'all') {
        if (product.season !== season && product.season !== 'core') {
          return false;
        }
      }

      if (size && size !== 'ALL') {
        const hasSize = product.variants.some((v) => v.size.toUpperCase() === size);
        if (!hasSize) return false;
      }

      if (inStockOnly) {
        const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        if (totalStock <= 0) return false;
      }

      const minVariantPrice = product.variants.length
        ? Math.min(...product.variants.map((v) => v.price))
        : product.basePrice;

      if (minPrice !== null && !Number.isNaN(minPrice) && minVariantPrice < minPrice) {
        return false;
      }
      if (maxPrice !== null && !Number.isNaN(maxPrice) && minVariantPrice > maxPrice) {
        return false;
      }

      return true;
    });

    filtered = [...filtered].sort((a, b) => {
      const getMin = (p: typeof a) =>
        p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : p.basePrice;
      if (sort === 'price_asc') {
        return getMin(a) - getMin(b);
      }
      if (sort === 'price_desc') {
        return getMin(b) - getMin(a);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return this.sample({
      items,
      total,
      page: safePage,
      limit,
      totalPages,
      availableSizes,
    });
  }
}
