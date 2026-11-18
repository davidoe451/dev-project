import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Product } from '@core/models/catalog.model';
import { AuthService } from '@core/services/auth.service';
import { CatalogService } from '@core/services/catalog.service';
import { ThemeService } from '@core/services/theme.service';
import { AppBadgeComponent, AppButtonComponent } from '@shared/ui';

interface NavCategoryLevel {
  key: string;
  label: string;
  icon: string;
  brands: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AppButtonComponent,
    AppBadgeComponent,
  ],
  templateUrl: './main-layout.component.html',
  styles: [
    `
      :host {
        font-family: inherit;
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent implements OnInit {
  public readonly auth = inject(AuthService);
  public readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);

  @ViewChild('headerSearchInput') headerSearchInputRef?: ElementRef<HTMLInputElement>;

  readonly isMobileMenuOpen = signal<boolean>(false);

  // Search Overlay State (matching fe-dev design)
  readonly isSearchOpen = signal<boolean>(false);
  readonly headerSearchQuery = signal<string>('');
  readonly searchProducts = signal<Product[]>([]);
  readonly isSearching = signal<boolean>(false);
  readonly popularSearchTags = [
    'OUTERWEAR',
    'HOODIES',
    'CARGO',
    'BOMBER',
    'DENIM',
    'TRENCH',
    'BOOTS',
    'KNITWEAR',
  ];

  readonly houseBrands = ['WEAREZ ATELIER', 'MAISON V'];
  readonly luxuryRunwayBrands = ['NOIR LAB', 'PARIS PROTOCOL'];
  readonly contemporaryHeritageBrands = ['TOKYO KINETIC', 'KINETIC LAB'];

  readonly menCategories: NavCategoryLevel[] = [
    { key: 'outerwear', label: 'Outerwear', icon: 'roller_shades', brands: ['WEAREZ ATELIER', 'TOKYO KINETIC', 'NOIR LAB'] },
    { key: 'tops-knitwear', label: 'Tops & Knitwear', icon: 'apparel', brands: ['NOIR LAB', 'MAISON V', 'WEAREZ ATELIER'] },
    { key: 'trousers-denim', label: 'Trousers & Denim', icon: 'styler', brands: ['MAISON V', 'TOKYO KINETIC', 'NOIR LAB'] },
    { key: 'footwear', label: 'Footwear', icon: 'steps', brands: ['WEAREZ ATELIER', 'NOIR LAB'] },
    { key: 'accessories', label: 'Accessories', icon: 'shopping_bag', brands: ['TOKYO KINETIC', 'MAISON V'] },
  ];

  readonly womenCategories: NavCategoryLevel[] = [
    { key: 'outerwear', label: 'Outerwear', icon: 'roller_shades', brands: ['NOIR LAB', 'MAISON V'] },
    { key: 'tops-knitwear', label: 'Tops & Knitwear', icon: 'apparel', brands: ['MAISON V', 'NOIR LAB'] },
    { key: 'trousers-denim', label: 'Trousers & Denim', icon: 'styler', brands: ['NOIR LAB', 'MAISON V'] },
    { key: 'footwear', label: 'Footwear', icon: 'steps', brands: ['NOIR LAB', 'WEAREZ ATELIER'] },
    { key: 'accessories', label: 'Accessories', icon: 'shopping_bag', brands: ['MAISON V', 'TOKYO KINETIC'] },
  ];

  readonly seasonalCollections = [
    { name: "Autumn / Winter '26", tag: 'CAPSULE 04', season: 'fw26' },
    { name: "Spring / Summer '26", tag: 'RUNWAY EDIT', season: 'ss26' },
    { name: 'Core Archive', tag: 'PERMANENT', season: 'core' },
  ];

  readonly activeMenCategory = signal<string>('outerwear');
  readonly activeWomenCategory = signal<string>('outerwear');

  ngOnInit(): void {
    this.fetchSearchProducts();
  }

  fetchSearchProducts(): void {
    this.isSearching.set(true);
    this.catalogService.getProducts({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        this.isSearching.set(false);
        this.searchProducts.set(res.items || []);
      },
      error: () => {
        this.isSearching.set(false);
      },
    });
  }

  readonly headerSearchSuggestions = computed<string[]>(() => {
    const q = this.headerSearchQuery().trim().toLowerCase();
    if (!q || q.length < 1) return [];

    const candidateTerms = new Set<string>();
    const fashionKeywords = [
      'jeans',
      'denim',
      'pants',
      'trousers',
      'cargo',
      'hoodie',
      'hoodies',
      'bomber',
      'jacket',
      'outerwear',
      'coat',
      'trench',
      't-shirt',
      'tee',
      'cardigan',
      'oversized',
      'blazer',
      'sweater',
      'boots',
      'sneakers',
      'leather',
      'wool',
      'cotton',
      'sling',
      'belt',
    ];

    for (const kw of fashionKeywords) {
      if (kw.toLowerCase().includes(q) && kw.toLowerCase() !== q) {
        candidateTerms.add(kw.toUpperCase());
      }
    }

    for (const p of this.searchProducts()) {
      const words = (p.name || '').split(/\s+/).map((w) => w.replace(/[^a-zA-Z0-9-]/g, ''));
      for (const w of words) {
        if (w.length >= 3 && w.toLowerCase().includes(q) && w.toLowerCase() !== q) {
          candidateTerms.add(w.toUpperCase());
        }
      }
      const bName = typeof p.brand === 'string' ? p.brand : p.brand?.name || '';
      if (bName && bName.toLowerCase().includes(q) && bName.toLowerCase() !== q) {
        candidateTerms.add(bName.toUpperCase());
      }
      const cat = p.category?.name || '';
      if (cat && cat.toLowerCase().includes(q) && cat.toLowerCase() !== q) {
        candidateTerms.add(cat.toUpperCase());
      }
    }

    return Array.from(candidateTerms).slice(0, 6);
  });

  readonly searchResults = computed(() => {
    const q = this.headerSearchQuery().trim().toLowerCase();
    if (!q) return [];
    return this.searchProducts()
      .filter((p) => {
        const name = (p.name || '').toLowerCase();
        const brand = (typeof p.brand === 'string' ? p.brand : p.brand?.name || '').toLowerCase();
        const cat = (p.category?.name || p.category?.slug || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const mat = (p.material || '').toLowerCase();
        const sku = p.variants?.some((v) => v.sku.toLowerCase().includes(q)) ?? false;
        return name.includes(q) || brand.includes(q) || cat.includes(q) || desc.includes(q) || mat.includes(q) || sku;
      })
      .slice(0, 6);
  });

  getProductImage(p: Product): string {
    if (p.images && p.images.length > 0) {
      const primary = p.images.find((img) => img.isPrimary) ?? p.images[0];
      if (primary?.url) return primary.url;
    }
    return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800';
  }

  openSearchOverlay(): void {
    this.isSearchOpen.set(true);
    setTimeout(() => {
      this.headerSearchInputRef?.nativeElement?.focus();
    }, 60);
    if (this.searchProducts().length === 0) {
      this.fetchSearchProducts();
    }
  }

  closeSearchOverlay(): void {
    this.isSearchOpen.set(false);
  }

  toggleSearchOverlay(): void {
    if (this.isSearchOpen()) {
      this.closeSearchOverlay();
    } else {
      this.openSearchOverlay();
    }
  }

  onHeaderSearchInput(val: string): void {
    this.headerSearchQuery.set(val);
  }

  applyHeaderSuggestion(term: string): void {
    this.headerSearchQuery.set(term);
    this.onHeaderSearchInput(term);
  }

  executeSearch(customQuery?: string): void {
    const q = (customQuery !== undefined ? customQuery : this.headerSearchQuery()).trim();
    this.closeSearchOverlay();
    this.isMobileMenuOpen.set(false);
    if (q) {
      void this.router.navigate(['/products'], { queryParams: { search: q } });
    } else {
      void this.router.navigate(['/products']);
    }
  }

  onSelectSearchResult(product: Product): void {
    this.closeSearchOverlay();
    this.isMobileMenuOpen.set(false);
    void this.router.navigate(['/products', product.slug || product.id]);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggleSearchOverlay();
    } else if (event.key === 'Escape' && this.isSearchOpen()) {
      this.closeSearchOverlay();
    }
  }

  getCategoryLabel(cats: NavCategoryLevel[], key: string): string {
    return cats.find((c) => c.key === key)?.label ?? 'Garments';
  }

  getCategoryBrands(cats: NavCategoryLevel[], key: string): string[] {
    return cats.find((c) => c.key === key)?.brands ?? [];
  }
}
