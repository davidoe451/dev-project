import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product, ProductVariant } from '@core/models/catalog.model';
import { AppAlertComponent, AppBadgeComponent, AppButtonComponent, AppCardComponent, AppDialogComponent } from '@shared/ui';

interface ProductColorOption { name: string; hex: string; }
interface ProductSizeOption { size: string; stock: number; variant: ProductVariant; }
interface ProductStockStatus { label: string; variant: 'destructive' | 'warning' | 'success'; stock: number; }

@Component({
  selector: 'app-product-purchase-panel',
  standalone: true,
  imports: [CurrencyPipe, AppAlertComponent, AppBadgeComponent, AppButtonComponent, AppCardComponent, AppDialogComponent],
  templateUrl: './product-purchase-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPurchasePanelComponent {
  readonly product = input.required<Product>();
  readonly selectedColor = input('');
  readonly selectedSize = input('');
  readonly colors = input<ProductColorOption[]>([]);
  readonly sizes = input<ProductSizeOption[]>([]);
  readonly selectedVariant = input<ProductVariant | null>(null);
  readonly displayPrice = input(0);
  readonly stockStatus = input<ProductStockStatus>({ label: 'Out of Stock', variant: 'destructive', stock: 0 });
  readonly averageRating = input('0.0');
  readonly averageRatingNum = input(0);
  readonly reviewCount = input(0);
  readonly quantity = input(1);
  readonly cartFeedback = input<string | null>(null);
  readonly sizeGuideOpen = input(false);

  readonly scrollToReviews = output<void>();
  readonly colorSelect = output<string>();
  readonly sizeSelect = output<string>();
  readonly decrement = output<void>();
  readonly increment = output<void>();
  readonly addToBag = output<void>();
  readonly sizeGuideOpenChange = output<boolean>();
}
