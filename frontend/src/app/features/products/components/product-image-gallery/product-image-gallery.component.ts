import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ProductImage } from '@core/models/catalog.model';
import { AppBadgeComponent, AppButtonComponent, AppCardComponent, AppDialogComponent } from '@shared/ui';

@Component({
  selector: 'app-product-image-gallery',
  standalone: true,
  imports: [AppBadgeComponent, AppButtonComponent, AppCardComponent, AppDialogComponent],
  templateUrl: './product-image-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductImageGalleryComponent {
  readonly images = input<ProductImage[]>([]);
  readonly activeImage = input<ProductImage | null>(null);
  readonly lightboxOpen = input(false);
  readonly imageSelect = output<ProductImage>();
  readonly lightboxOpenChange = output<boolean>();
}
