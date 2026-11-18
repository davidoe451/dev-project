import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { Product } from '@core/models/catalog.model';
import { validateGalleryFile } from '@features/admin/components/product-image-picker/gallery-image.utils';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-product-image-manager',
  standalone: true,
  template: `
    @if (auth.isAdmin()) {
      <section class="border border-slate-200 dark:border-slate-700 p-4 space-y-3" aria-label="Manage product images">
        <h2 class="font-bold uppercase tracking-wider">Product images (Admin)</h2>
        <label class="block text-sm">
          <span class="block mb-2">Add JPEG, PNG or WebP images (up to 5 MB each)</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple [disabled]="busy()" (change)="upload($event)" />
        </label>
        <div class="flex flex-wrap gap-3">
          @for (image of product().images; track image.id) {
            <div class="w-28 space-y-1">
              <img [src]="image.url" [alt]="image.alt" class="w-28 h-28 object-cover" />
              @if (image.isPrimary) {
                <span class="text-xs font-bold">Cover</span>
              } @else {
                <button type="button" class="text-xs underline" [disabled]="busy()" (click)="makeCover(image.id)">Set cover</button>
              }
            </div>
          }
        </div>
        @if (error()) { <p role="alert" class="text-sm text-rose-600">{{ error() }}</p> }
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductImageManagerComponent {
  private readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);
  readonly product = input.required<Product>();
  readonly changed = output<void>();
  readonly busy = signal(false);
  readonly error = signal('');

  async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;
    for (const [index, file] of files.entries()) {
      const error = validateGalleryFile(file, this.product().images.length + index);
      if (error) { this.error.set(error); return; }
    }
    this.busy.set(true);
    this.error.set('');
    let uploaded = 0;
    try {
      for (const [index, file] of files.entries()) {
        const body = new FormData();
        body.append('file', file);
        body.append('isPrimary', String(this.product().images.length === 0 && index === 0));
        body.append('sortOrder', String(this.product().images.length + index));
        await firstValueFrom(this.http.post(`${environment.apiUrl}/products/${this.product().id}/images`, body));
        uploaded++;
      }
    } catch {
      this.error.set('Image upload failed. Images uploaded before the error were saved.');
    } finally {
      this.busy.set(false);
      if (uploaded) this.changed.emit();
    }
  }

  async makeCover(imageId: number): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await firstValueFrom(this.http.patch(`${environment.apiUrl}/products/images/${imageId}/primary`, {}));
      this.changed.emit();
    } catch {
      this.error.set('Could not update the cover image.');
    } finally {
      this.busy.set(false);
    }
  }
}
