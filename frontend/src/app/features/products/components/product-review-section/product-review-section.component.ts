import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppAlertComponent, AppButtonComponent, AppCardComponent } from '@shared/ui';
import { ProductDetailPageState } from '../../pages/product-detail-page/product-detail-page.state';

@Component({
  selector: 'app-product-review-section',
  standalone: true,
  imports: [AppAlertComponent, AppButtonComponent, AppCardComponent],
  templateUrl: './product-review-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductReviewSectionComponent {
  readonly state = input.required<ProductDetailPageState>();

  countByRating(stars: number): number {
    return this.state().countByRating(stars);
  }
}
