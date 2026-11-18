import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppAlertComponent, AppButtonComponent, AppCardComponent, AppSkeletonComponent } from '@shared/ui';
import { ProductImageGalleryComponent } from '../../components/product-image-gallery/product-image-gallery.component';
import { ProductPurchasePanelComponent } from '../../components/product-purchase-panel/product-purchase-panel.component';
import { ProductReviewSectionComponent } from '../../components/product-review-section/product-review-section.component';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { ProductDetailPageState } from './product-detail-page.state';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    AppAlertComponent,
    AppButtonComponent,
    AppCardComponent,
    AppSkeletonComponent,
    ProductImageGalleryComponent,
    ProductPurchasePanelComponent,
    ProductReviewSectionComponent,
    RelatedProductsComponent,
  ],
  templateUrl: './product-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPageComponent extends ProductDetailPageState implements OnInit, OnDestroy {
  readonly reviewState = this;

  ngOnInit(): void { this.initialize(); }
  ngOnDestroy(): void { this.destroy(); }
}
