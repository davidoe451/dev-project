import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '@core/models/catalog.model';
import { AppBadgeComponent, AppButtonComponent, AppCardComponent } from '@shared/ui';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, AppCardComponent, AppBadgeComponent, AppButtonComponent],
  templateUrl: './product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly quickAdd = output<{ product: Product; size: string }>();

  protected readonly primaryImage = computed(() => {
    const images = this.product().images;
    return images.find((img) => img.isPrimary) ?? images[0] ?? null;
  });

  protected readonly secondaryImage = computed(() => {
    const primary = this.primaryImage();
    return this.product().images.find((img) => img.id !== primary?.id) ?? null;
  });

  protected readonly priceRange = computed(() => {
    const variants = this.product().variants;
    if (!variants.length) {
      return { min: this.product().basePrice, max: this.product().basePrice };
    }
    const prices = variants.map((v) => v.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  });

  protected readonly totalStock = computed(() =>
    this.product().variants.reduce((sum, v) => sum + v.stock, 0),
  );

  protected readonly uniqueColors = computed(() => {
    const seen = new Map<string, string>();
    for (const variant of this.product().variants) {
      if (!seen.has(variant.color)) {
        seen.set(variant.color, variant.colorHex);
      }
    }
    return Array.from(seen.entries()).map(([name, hex]) => ({ name, hex }));
  });

  protected readonly uniqueSizes = computed(() =>
    Array.from(new Set(this.product().variants.map((v) => v.size))),
  );

  protected onQuickSizeSelect(event: Event, size: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.quickAdd.emit({ product: this.product(), size });
  }
}
