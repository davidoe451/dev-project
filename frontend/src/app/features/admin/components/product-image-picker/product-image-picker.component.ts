import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, input, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppButtonComponent } from '@shared/ui';
import { environment } from '../../../../../environments/environment';
import { validateGalleryFile } from './gallery-image.utils';

interface GalleryImage {
  url: string;
  name: string;
  file?: File;
}

@Component({
  selector: 'app-product-image-picker',
  standalone: true,
  imports: [AppButtonComponent],
  template: `
    <section class="space-y-4" aria-label="Product images">
      <div class="flex items-center justify-between gap-3">
        <h4 class="font-bold uppercase tracking-wider">Product images ({{ images().length }}/8)</h4>
        <span class="text-slate-500 text-[11px]">First image is the cover</span>
      </div>
      <label class="block border border-dashed border-slate-400 dark:border-slate-600 p-4 space-y-2">
        <span class="block font-semibold">Choose photos from your device</span>
        <span class="block text-slate-500 dark:text-slate-400">JPEG, PNG or WebP · Up to 5 MB each · Maximum 8 images</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple [disabled]="isUploading()" (change)="selectFiles($event)"
          class="block w-full text-xs file:mr-3 file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:text-slate-900 dark:file:bg-slate-700 dark:file:text-white" />
      </label>
      @if (!uploadUrl) {
        <p class="text-amber-700 dark:text-amber-300">File uploads are not available yet. Device photos are previews only; use hosted image URLs to save.</p>
      }
      <div class="flex flex-col sm:flex-row gap-2">
        <label class="flex-1 min-w-0">
          <span class="sr-only">Hosted image URL</span>
          <input #urlInput type="url" placeholder="https://example.com/product.jpg" [disabled]="isUploading()"
            (keydown.enter)="$event.preventDefault(); addUrl(urlInput)"
            class="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
        </label>
        <app-button variant="outline" size="sm" [disabled]="isUploading()" (click)="addUrl(urlInput)">Add URL</app-button>
      </div>
      @if (errorMessage()) {
        <p role="alert" class="text-rose-700 dark:text-rose-300">{{ errorMessage() }}</p>
      }
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        @for (image of images(); track image; let i = $index) {
          <article class="border border-slate-200 dark:border-slate-700 p-2 space-y-2 min-w-0">
            <div class="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
              <img [src]="image.url" [alt]="image.name" (error)="imageError($event)" class="w-full h-full object-cover" />
              @if (i === 0) { <span class="absolute top-1 left-1 bg-primary text-white px-2 py-1 text-[10px]">COVER</span> }
            </div>
            <p class="truncate text-[11px]">{{ image.name }}</p>
            @if (image.file) { <p class="text-amber-700 dark:text-amber-300 text-[11px]">Not uploaded</p> }
            <div class="flex flex-wrap gap-1">
              @if (i > 0) {
                <app-button size="sm" variant="ghost" [disabled]="isUploading()" (click)="makeCover(i)">Set cover</app-button>
                <app-button size="icon" variant="ghost" [disabled]="isUploading()" ariaLabel="Move image left" (click)="moveLeft(i)"><span aria-hidden="true">←</span></app-button>
              }
              <app-button size="sm" variant="ghost" [disabled]="isUploading()" (click)="remove(i)">Remove</app-button>
            </div>
          </article>
        }
      </div>
      @if (pendingCount() > 0) {
        <div class="space-y-2">
          <p role="status">{{ pendingCount() }} photo(s) must be uploaded or removed before saving this product.</p>
          @if (uploadUrl) {
            <app-button size="sm" [disabled]="isUploading()" (click)="upload()">{{ isUploading() ? 'Uploading...' : 'Upload selected photos' }}</app-button>
          }
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductImagePickerComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  readonly initialUrls = input<string[]>([]);
  readonly urlsChange = output<string[]>();
  readonly pendingChange = output<boolean>();
  readonly images = signal<GalleryImage[]>([]);
  readonly isUploading = signal(false);
  readonly errorMessage = signal('');
  readonly uploadUrl = environment.productImageUploadUrl;
  private readonly objectUrls = new Set<string>();

  ngOnInit(): void {
    this.images.set([...new Set(this.initialUrls().filter(Boolean))].map((url) => ({ url, name: 'Product photo' })));
  }

  pendingCount(): number {
    return this.images().filter((image) => image.file).length;
  }

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const errors: string[] = [];
    for (const file of Array.from(input.files ?? [])) {
      const error = validateGalleryFile(file, this.images().length);
      if (error) {
        errors.push(error);
      } else {
        const url = URL.createObjectURL(file);
        this.objectUrls.add(url);
        this.images.update((images) => [...images, { url, name: file.name, file }]);
      }
    }
    input.value = '';
    this.errorMessage.set(errors.join(' '));
    this.emitChanges();
  }

  addUrl(input: HTMLInputElement): void {
    const url = input.value.trim();
    if (!/^https?:\/\//i.test(url) || !input.checkValidity()) {
      this.errorMessage.set('Enter a valid HTTP or HTTPS image URL.');
      return;
    }
    if (this.images().length >= 8 || this.images().some((image) => image.url === url)) {
      this.errorMessage.set('Use a different image URL and a maximum of 8 images.');
      return;
    }
    this.images.update((images) => [...images, { url, name: 'Hosted product photo' }]);
    input.value = '';
    this.errorMessage.set('');
    this.emitChanges();
  }

  makeCover(index: number): void {
    const images = [...this.images()];
    const [image] = images.splice(index, 1);
    images.unshift(image);
    this.images.set(images);
    this.emitChanges();
  }

  moveLeft(index: number): void {
    const images = [...this.images()];
    [images[index - 1], images[index]] = [images[index], images[index - 1]];
    this.images.set(images);
    this.emitChanges();
  }

  remove(index: number): void {
    const removed = this.images()[index];
    if (this.objectUrls.delete(removed.url)) URL.revokeObjectURL(removed.url);
    this.images.update((images) => images.filter((_, i) => i !== index));
    this.errorMessage.set('');
    this.emitChanges();
  }

  async upload(): Promise<void> {
    if (!this.uploadUrl || this.isUploading()) return;
    this.isUploading.set(true);
    this.errorMessage.set('');
    try {
      for (const image of this.images().filter((item) => item.file)) {
        const body = new FormData();
        body.append('file', image.file!);
        const response = await firstValueFrom(this.http.post<{ url?: string; data?: { url: string } }>(this.uploadUrl, body));
        const url = response.data?.url ?? response.url;
        if (!url || !/^https?:\/\//i.test(url)) throw new Error('Missing image URL');
        this.images.update((images) => images.map((item) => item === image ? { url, name: image.name } : item));
        if (this.objectUrls.delete(image.url)) URL.revokeObjectURL(image.url);
      }
    } catch {
      this.errorMessage.set('Upload failed. Your remaining photos are still available to retry.');
    } finally {
      this.isUploading.set(false);
      this.emitChanges();
    }
  }

  imageError(event: Event): void {
    (event.target as HTMLImageElement).alt = 'Image unavailable';
  }

  ngOnDestroy(): void {
    for (const url of this.objectUrls) URL.revokeObjectURL(url);
  }

  private emitChanges(): void {
    this.urlsChange.emit(this.images().filter((image) => !image.file).map((image) => image.url));
    this.pendingChange.emit(this.pendingCount() > 0 || this.isUploading());
  }
}
