import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '@core/models/catalog.model';
import { AuthService } from '@core/services/auth.service';
import { CatalogService } from '@core/services/catalog.service';
import {
  AppAlertComponent,
  AppBadgeComponent,
  AppButtonComponent,
  AppSpinnerComponent,
} from '@shared/ui';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    AppAlertComponent,
    AppBadgeComponent,
    AppButtonComponent,
    AppSpinnerComponent,
  ],
  templateUrl: './home-page.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit {
  public readonly auth = inject(AuthService);
  private readonly catalogService = inject(CatalogService);
  readonly usingSampleData = this.catalogService.usingSampleData;

  readonly categoryTabs = signal([{ key: 'ALL', label: 'All Curations' }]);

  readonly selectedCategory = signal<string>('ALL');
  readonly curatedProducts = signal<Product[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly quickAddNotice = signal<string | null>(null);

  ngOnInit(): void {
    this.catalogService.getCategories().subscribe((categories) => this.categoryTabs.set([
      { key: 'ALL', label: 'All Curations' },
      ...categories.map((category) => ({ key: category.slug, label: category.name })),
    ]));
    this.loadCuratedDrops('ALL');
  }

  onCategoryTabChange(categoryKey: string): void {
    this.selectedCategory.set(categoryKey);
    this.loadCuratedDrops(categoryKey);
  }

  quickAdd(product: Product, size: string): void {
    const variant =
      product.variants.find((v) => v.size === size && v.stock > 0) ??
      product.variants.find((v) => v.size === size) ??
      product.variants[0];

    if (!variant || variant.stock <= 0) {
      this.quickAddNotice.set(
        `"${product.name}" in Size ${size} is currently out of stock in this capsule.`,
      );
      return;
    }

    this.quickAddNotice.set(
      `Added "${product.name}" (Size ${size} · SKU ${variant.sku} · $${variant.price}) to bag preview.`,
    );
  }

  getPrimaryImage(product: Product): string {
    const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];
    return primary?.url || '';
  }

  getSecondaryImage(product: Product): string | null {
    const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];
    const secondary = product.images.find((i) => i.id !== primary?.id);
    return secondary?.url || null;
  }

  getTotalStock(product: Product): number {
    return product.variants.reduce((sum, v) => sum + v.stock, 0);
  }

  getUniqueColors(product: Product): { name: string; hex: string }[] {
    const seen = new Map<string, string>();
    for (const v of product.variants) {
      if (!seen.has(v.color)) seen.set(v.color, v.colorHex);
    }
    return Array.from(seen.entries()).map(([name, hex]) => ({ name, hex }));
  }

  getAvailableSizes(product: Product): string[] {
    return Array.from(new Set(product.variants.map((v) => v.size)));
  }

  private loadCuratedDrops(catKey: string): void {
    this.isLoading.set(true);
    this.catalogService.getCuratedDrops(catKey, 8).subscribe((products) => {
      this.curatedProducts.set(products);
      this.isLoading.set(false);
    });
  }
}
