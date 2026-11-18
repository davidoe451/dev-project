import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppButtonComponent, AppCardComponent, AppInputComponent } from '@shared/ui';
import { CategoryOptionWithCount } from '@core/services/catalog.service';

@Component({
  selector: 'app-catalog-filter-sidebar',
  standalone: true,
  imports: [AppButtonComponent, AppCardComponent, AppInputComponent],
  templateUrl: './catalog-filter-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogFilterSidebarComponent {
  readonly categoryOptions = input.required<CategoryOptionWithCount[]>();
  readonly totalItems = input(0);
  readonly selectedCategory = input('all');
  readonly availableSizes = input<string[]>([]);
  readonly selectedSize = input('ALL');
  readonly inStockOnly = input(false);
  readonly minPrice = input('');
  readonly maxPrice = input('');
  readonly priceError = input('');
  readonly activeFilterCount = input(0);
  readonly showMobileFilters = input(false);

  readonly categoryChange = output<string>();
  readonly sizeChange = output<string>();
  readonly inStockChange = output<boolean>();
  readonly minPriceChange = output<string>();
  readonly maxPriceChange = output<string>();
  readonly applyPrice = output<void>();
  readonly resetFilters = output<void>();
}
