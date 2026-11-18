import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '@core/models/catalog.model';
import { AppButtonComponent, AppCardComponent, AppPaginationComponent, AppSkeletonComponent } from '@shared/ui';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-catalog-product-results',
  standalone: true,
  imports: [AppButtonComponent, AppCardComponent, AppPaginationComponent, AppSkeletonComponent, ProductCardComponent],
  templateUrl: './catalog-product-results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogProductResultsComponent {
  readonly products = input<Product[]>([]);
  readonly isLoading = input(false);
  readonly gridCols = input<3 | 4>(3);
  readonly skeletonPlaceholders = input<number[]>([]);
  readonly page = input(1);
  readonly totalPages = input(1);
  readonly totalItems = input(0);
  readonly limit = input(12);

  readonly quickAdd = output<{ product: Product; size: string }>();
  readonly pageChange = output<number>();
  readonly resetFilters = output<void>();
}
