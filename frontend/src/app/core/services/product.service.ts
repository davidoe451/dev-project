import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product as CatalogProduct, PaginatedProductsResult } from '@core/models/catalog.model';
import { mapAdminCategories, mapAdminProduct, mapAdminProducts, unwrapResponse } from '@core/models/product-api.mapper';
import {
  ApiResponse,
  CreateCategoryDto,
  CreateProductDto,
  Product,
  ProductCategory,
  ProductsResponseData,
  UpdateProductDto,
} from '@core/models/product.model';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  // 3-minute TTL for catalog and product data
  private readonly CACHE_TTL_MS = 3 * 60 * 1000;
  // 10-minute TTL for categories
  private readonly CATEGORY_CACHE_TTL_MS = 10 * 60 * 1000;

  private productsCache = new Map<string, CacheEntry<ProductsResponseData>>();
  private productDetailCache = new Map<string, CacheEntry<Product>>();
  private categoriesCache: CacheEntry<ProductCategory[]> | null = null;

  getProducts(
    page = 1,
    limit = 12,
    search?: string,
    brand?: string,
    category?: string,
    forceRefresh = false,
    inStockOnly?: boolean,
  ): Observable<ProductsResponseData> {
    const cacheKey = `${page}_${limit}_${(search || '').trim().toLowerCase()}_${brand || 'ALL'}_${category || 'ALL'}_${inStockOnly ? 'IN_STOCK' : 'ALL_STOCK'}`;
    const cached = this.productsCache.get(cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return of(cached.data);
    }

    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (brand && brand !== 'ALL') {
      params = params.set('brand', brand);
    }
    if (category && category !== 'ALL') {
      params = params.set('category', category);
    }
    if (inStockOnly) {
      params = params.set('inStockOnly', 'true');
    }

    return this.http.get<ProductsResponseData | PaginatedProductsResult | ApiResponse<ProductsResponseData | PaginatedProductsResult>>(this.baseUrl, { params }).pipe(
      map((response) => mapAdminProducts(unwrapResponse(response))),
      tap((data) => {
        if (data && data.items) {
          this.productsCache.set(cacheKey, { data, timestamp: Date.now() });
        }
      }),
    );
  }

  getProductById(id: string, forceRefresh = false): Observable<Product> {
    const cached = this.productDetailCache.get(id);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return of(cached.data);
    }

    return this.http.get<Product | CatalogProduct | ApiResponse<Product | CatalogProduct>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => mapAdminProduct(unwrapResponse(response))),
      tap((data) => {
        if (data) {
          this.productDetailCache.set(id, { data, timestamp: Date.now() });
        }
      }),
    );
  }

  createProduct(dto: CreateProductDto): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(this.baseUrl, dto).pipe(
      map((res) => res.data),
      tap(() => this.clearCache()),
    );
  }

  updateProduct(id: string, dto: UpdateProductDto): Observable<Product> {
    return this.http.patch<ApiResponse<Product>>(`${this.baseUrl}/${id}`, dto).pipe(
      map((res) => res.data),
      tap(() => this.clearCache()),
    );
  }

  deleteProduct(id: string): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.clearCache()),
    );
  }

  getCategories(forceRefresh = false): Observable<ProductCategory[]> {
    if (!forceRefresh && this.categoriesCache && Date.now() - this.categoriesCache.timestamp < this.CATEGORY_CACHE_TTL_MS) {
      return of(this.categoriesCache.data);
    }

    return this.http.get<ProductCategory[] | ApiResponse<ProductCategory[]>>(`${environment.apiUrl}/categories`).pipe(
      map((response) => mapAdminCategories(unwrapResponse(response))),
      tap((data) => {
        if (data) {
          this.categoriesCache = { data, timestamp: Date.now() };
        }
      }),
    );
  }

  createCategory(dto: CreateCategoryDto): Observable<ProductCategory> {
    return this.http.post<ApiResponse<ProductCategory>>(`${this.baseUrl}/categories`, dto).pipe(
      map((res) => res.data),
      tap(() => {
        this.categoriesCache = null;
      }),
    );
  }

  clearCache(): void {
    this.productsCache.clear();
    this.productDetailCache.clear();
    this.categoriesCache = null;
  }
}
