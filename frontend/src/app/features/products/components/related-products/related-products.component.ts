import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '@core/models/catalog.model';
import { AppButtonComponent } from '@shared/ui';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-related-products',
  standalone: true,
  imports: [RouterLink, AppButtonComponent, ProductCardComponent],
  templateUrl: './related-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedProductsComponent {
  readonly products = input<Product[]>([]);
}
