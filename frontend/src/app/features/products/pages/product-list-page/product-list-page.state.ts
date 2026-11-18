import { computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Brand, Category, Product, ProductQueryParams, ProductSortOption } from '@core/models/catalog.model';
import { CatalogService, CategoryOptionWithCount, SearchSuggestionsResult } from '@core/services/catalog.service';
import { SelectOption } from '@shared/ui';
import { Subscription } from 'rxjs';

/** Owns catalog query state, URL synchronization, and data loading for the catalog page. */
export class ProductListPageState {
  private readonly catalogService = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private productRequest?: Subscription;
  private routeRequest?: Subscription;

  readonly usingSampleData = this.catalogService.usingSampleData;
  readonly priceError = signal('');
  readonly categories = signal<Category[]>([]);
  readonly categoryOptions = signal<CategoryOptionWithCount[]>([]);
  readonly brands = signal<Brand[]>([]);
  readonly products = signal<Product[]>([]);
  readonly availableSizes = signal<string[]>(['S', 'M', 'L', 'XL', '40', '41', '42', '43', 'ONE SIZE']);
  readonly isLoading = signal(true);
  readonly showMobileFilters = signal(false);
  readonly gridCols = signal<3 | 4>(3);

  readonly search = signal('');
  readonly selectedCategory = signal('all');
  readonly selectedBrand = signal('all');
  readonly selectedSize = signal('ALL');
  readonly inStockOnly = signal(false);
  readonly minPriceInput = signal('');
  readonly maxPriceInput = signal('');
  readonly sort = signal<ProductSortOption>('newest');
  readonly page = signal(1);
  readonly limit = 12;
  readonly totalItems = signal(0);
  readonly totalPages = signal(1);

  readonly isSuggestionsOpen = signal(false);
  readonly searchSuggestions = signal<SearchSuggestionsResult>({ terms: [], matchingProducts: [] });
  readonly quickAddNotice = signal<string | null>(null);
  readonly skeletonPlaceholders = [1, 2, 3, 4, 5, 6, 7, 8];

  readonly selectedBrandName = computed(() => {
    const slug = this.selectedBrand();
    if (slug === 'all') return 'All';
    return this.brands().find((brand) => brand.slug === slug)?.name ?? slug;
  });

  readonly categorySelectOptions = computed<SelectOption[]>(() => [
    { value: 'all', label: 'All Categories' },
    ...this.categories().map((category) => ({ value: category.slug, label: category.name })),
  ]);

  readonly brandSelectOptions = computed<SelectOption[]>(() => [
    { value: 'all', label: 'All Brands' },
    ...this.brands().map((brand) => ({ value: brand.slug, label: brand.name })),
  ]);

  readonly sortOptions: SelectOption[] = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ];

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.search().trim()) count++;
    if (this.selectedCategory() !== 'all') count++;
    if (this.selectedBrand() !== 'all') count++;
    if (this.selectedSize() !== 'ALL') count++;
    if (this.inStockOnly()) count++;
    if (this.minPriceInput().trim()) count++;
    if (this.maxPriceInput().trim()) count++;
    return count;
  });

  readonly heroTitle = computed(() => {
    const query = this.search().trim();
    if (query) return `SEARCH: "${query.toUpperCase()}"`;
    const brandSlug = this.selectedBrand();
    if (brandSlug !== 'all') {
      const brandName = this.brands().find((brand) => brand.slug === brandSlug)?.name ?? brandSlug;
      return `${brandName.toUpperCase()} ARCHIVE`;
    }
    const categorySlug = this.selectedCategory();
    if (categorySlug !== 'all') {
      const categoryName = this.categories().find((category) => category.slug === categorySlug)?.name ?? categorySlug;
      return categoryName.toUpperCase();
    }
    return 'ALL READY-TO-WEAR';
  });

  initialize(): void {
    this.loadFilters();
    this.routeRequest = this.route.queryParamMap.subscribe((params) => {
      this.search.set(params.get('search') ?? '');
      this.selectedCategory.set(params.get('category') ?? 'all');
      this.selectedBrand.set(params.get('brand') ?? 'all');
      this.selectedSize.set((params.get('size') ?? 'ALL').toUpperCase());
      this.inStockOnly.set(params.get('inStock') === 'true');
      this.minPriceInput.set(params.get('minPrice') ?? '');
      this.maxPriceInput.set(params.get('maxPrice') ?? '');

      const sortParam = params.get('sort') as ProductSortOption | null;
      this.sort.set(sortParam === 'price_asc' || sortParam === 'price_desc' || sortParam === 'newest' ? sortParam : 'newest');
      const pageParam = Number(params.get('page') ?? '1');
      this.page.set(Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1);
      this.fetchProducts();
    });
  }

  destroy(): void {
    this.productRequest?.unsubscribe();
    this.routeRequest?.unsubscribe();
  }

  onSearchInput(value: string): void {
    this.search.set(value);
    this.catalogService.getSearchSuggestions(value).subscribe((result) => {
      this.searchSuggestions.set(result);
      this.isSuggestionsOpen.set(true);
    });
  }

  commitSearch(value: string): void {
    this.isSuggestionsOpen.set(false);
    this.search.set(value);
    this.updateQueryParams({ search: value.trim() || null, page: 1 });
  }

  applySuggestionTerm(term: string): void { this.commitSearch(term); }

  clearSearch(): void {
    this.search.set('');
    this.isSuggestionsOpen.set(false);
    this.updateQueryParams({ search: null, page: 1 });
  }

  onCategoryChange(slug: string): void {
    this.selectedCategory.set(slug || 'all');
    this.updateQueryParams({ category: slug && slug !== 'all' ? slug : null, page: 1 });
  }

  onBrandChange(slug: string): void {
    this.selectedBrand.set(slug || 'all');
    this.updateQueryParams({ brand: slug && slug !== 'all' ? slug : null, page: 1 });
  }

  clearBrand(): void {
    this.selectedBrand.set('all');
    this.updateQueryParams({ brand: null, page: 1 });
  }

  onSizeSelect(size: string): void {
    const next = this.selectedSize() === size ? 'ALL' : size;
    this.selectedSize.set(next);
    this.updateQueryParams({ size: next !== 'ALL' ? next : null, page: 1 });
  }

  clearSize(): void {
    this.selectedSize.set('ALL');
    this.updateQueryParams({ size: null, page: 1 });
  }

  toggleInStock(checked: boolean): void {
    this.inStockOnly.set(checked);
    this.updateQueryParams({ inStock: checked ? 'true' : null, page: 1 });
  }

  applyPriceFilter(): void {
    const min = this.minPriceInput().trim();
    const max = this.maxPriceInput().trim();
    if ((min && (!Number.isFinite(Number(min)) || Number(min) < 0)) ||
        (max && (!Number.isFinite(Number(max)) || Number(max) < 0)) ||
        (min && max && Number(min) > Number(max))) {
      this.priceError.set('Enter a valid price range. Minimum price must not exceed maximum price.');
      return;
    }
    this.priceError.set('');
    this.updateQueryParams({ minPrice: min || null, maxPrice: max || null, page: 1 });
  }

  clearPrice(): void {
    this.priceError.set('');
    this.minPriceInput.set('');
    this.maxPriceInput.set('');
    this.updateQueryParams({ minPrice: null, maxPrice: null, page: 1 });
  }

  clearInStock(): void {
    this.inStockOnly.set(false);
    this.updateQueryParams({ inStock: null, page: 1 });
  }

  onSortChange(value: string): void {
    const sort = (value || 'newest') as ProductSortOption;
    this.sort.set(sort);
    this.updateQueryParams({ sort: sort !== 'newest' ? sort : null, page: 1 });
  }

  onPageChange(newPage: number): void {
    this.page.set(newPage);
    this.updateQueryParams({ page: newPage > 1 ? newPage : null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleQuickAdd(payload: { product: Product; size: string }): void {
    const variant = payload.product.variants.find((item) => item.size === payload.size && item.stock > 0)
      ?? payload.product.variants.find((item) => item.size === payload.size);
    if (!variant || variant.stock <= 0) {
      this.quickAddNotice.set(`"${payload.product.name}" in Size ${payload.size} is out of stock.`);
    } else {
      this.quickAddNotice.set(`Added "${payload.product.name}" (Size ${payload.size} · SKU ${variant.sku}) to bag preview.`);
    }
  }

  resetAllFilters(): void {
    this.priceError.set('');
    this.search.set('');
    this.selectedCategory.set('all');
    this.selectedBrand.set('all');
    this.selectedSize.set('ALL');
    this.inStockOnly.set(false);
    this.minPriceInput.set('');
    this.maxPriceInput.set('');
    this.sort.set('newest');
    this.page.set(1);
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  retryLiveCatalog(): void {
    this.catalogService.retryLiveCatalog();
    this.loadFilters();
    this.fetchProducts();
  }

  private updateQueryParams(patch: Record<string, string | number | null>): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: patch, queryParamsHandling: 'merge' });
  }

  private fetchProducts(): void {
    this.productRequest?.unsubscribe();
    this.isLoading.set(true);
    const min = this.minPriceInput().trim();
    const max = this.maxPriceInput().trim();
    const query: ProductQueryParams = {
      search: this.search(), category: this.selectedCategory(), brand: this.selectedBrand(),
      size: this.selectedSize(),
      inStockOnly: this.inStockOnly(), minPrice: min ? Number(min) : null, maxPrice: max ? Number(max) : null,
      sort: this.sort(), page: this.page(), limit: this.limit,
    };
    this.productRequest = this.catalogService.getProducts(query).subscribe((result) => {
      this.products.set(result.items);
      this.totalItems.set(result.total);
      this.totalPages.set(result.totalPages);
      this.page.set(result.page);
      if (result.availableSizes.length) this.availableSizes.set(result.availableSizes);
      this.isLoading.set(false);
    });
  }

  private loadFilters(): void {
    this.catalogService.getCategories().subscribe((categories) => this.categories.set(categories));
    this.catalogService.getBrands().subscribe((brands) => this.brands.set(brands));
    this.catalogService.getCategoryOptionsWithCounts().subscribe((options) => this.categoryOptions.set(options));
  }
}
