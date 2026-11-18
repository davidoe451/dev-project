import { computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product, ProductImage, ProductVariant } from '@core/models/catalog.model';
import { CatalogService } from '@core/services/catalog.service';
import { Subscription } from 'rxjs';

export interface ProductReview {
  id: string;
  productId: number;
  authorName: string;
  avatarLetter: string;
  rating: number;
  sizePurchased: string;
  fitFeedback: string;
  headline: string;
  comment: string;
  createdAt: string;
  helpfulCount: number;
  isVerifiedBuyer: boolean;
  userVotedHelpful?: boolean;
}

export interface RatingBar {
  stars: number;
  count: number;
  percentage: number;
}

/** Product detail state, variant selection, review actions, and catalog requests. */
export class ProductDetailPageState {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);
  private routeRequest?: Subscription;
  private productRequest?: Subscription;
  readonly usingSampleData = this.catalogService.usingSampleData;

  readonly product = signal<Product | null>(null);
  readonly relatedProducts = signal<Product[]>([]);
  readonly isLoading = signal(true);
  readonly activeImage = signal<ProductImage | null>(null);
  readonly isLightboxOpen = signal(false);
  readonly isSizeGuideOpen = signal(false);
  readonly selectedColor = signal('');
  readonly selectedSize = signal('');
  readonly quantity = signal(1);
  readonly cartFeedback = signal<string | null>(null);

  readonly reviews = signal<ProductReview[]>([]);
  readonly userHasPurchased = signal(true);
  readonly isWritingReview = signal(false);
  readonly activeStarFilter = signal(0);
  readonly reviewRating = signal(5);
  readonly reviewHeadline = signal('');
  readonly reviewComment = signal('');
  readonly reviewSize = signal('M');
  readonly reviewFit = signal('TRUE TO ARCHIVE CUT');
  readonly reviewAuthorName = signal('');
  readonly reviewError = signal('');
  readonly reviewSuccess = signal('');

  readonly orderedImages = computed(() => {
    const product = this.product();
    if (!product) return [];
    return [...product.images].sort((a, b) => a.isPrimary !== b.isPrimary ? (a.isPrimary ? -1 : 1) : a.sortOrder - b.sortOrder);
  });

  readonly availableColors = computed(() => {
    const product = this.product();
    if (!product) return [];
    const colors = new Map<string, string>();
    for (const variant of product.variants) if (!colors.has(variant.color)) colors.set(variant.color, variant.colorHex);
    return Array.from(colors.entries()).map(([name, hex]) => ({ name, hex }));
  });

  readonly sizesForSelectedColor = computed(() => {
    const product = this.product();
    if (!product) return [];
    return product.variants.filter((variant) => !this.selectedColor() || variant.color === this.selectedColor())
      .map((variant) => ({ size: variant.size, stock: variant.stock, variant }));
  });

  readonly selectedVariant = computed<ProductVariant | null>(() => {
    const product = this.product();
    if (!product?.variants.length) return null;
    return product.variants.find((variant) => variant.color === this.selectedColor() && variant.size === this.selectedSize()) ?? null;
  });

  readonly displayPrice = computed(() => this.selectedVariant()?.price ?? this.product()?.basePrice ?? 0);

  readonly stockStatus = computed(() => {
    const stock = this.selectedVariant()?.stock ?? 0;
    if (stock <= 0) return { label: 'Out of Stock', variant: 'destructive' as const, stock: 0 };
    if (stock <= 4) return { label: `Low Stock · Only ${stock} left`, variant: 'warning' as const, stock };
    return { label: `In Stock · ${stock} available`, variant: 'success' as const, stock };
  });

  readonly averageRating = computed(() => {
    const reviews = this.reviews();
    return reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0.0';
  });

  readonly averageRatingNum = computed(() => {
    const reviews = this.reviews();
    return reviews.length ? Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) : 0;
  });

  readonly ratingDistribution = computed<RatingBar[]>(() => {
    const reviews = this.reviews();
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((review) => review.rating === stars).length;
      return { stars, count, percentage: reviews.length ? Math.round((count / reviews.length) * 100) : 0 };
    });
  });

  readonly filteredReviews = computed(() => {
    const filter = this.activeStarFilter();
    return filter ? this.reviews().filter((review) => review.rating === filter) : this.reviews();
  });

  initialize(): void {
    this.routeRequest = this.route.paramMap.subscribe((params) => this.loadProduct(params.get('id') ?? ''));
  }

  destroy(): void {
    this.routeRequest?.unsubscribe();
    this.productRequest?.unsubscribe();
  }

  selectImage(image: ProductImage): void { this.activeImage.set(image); }

  selectColor(color: string): void {
    this.selectedColor.set(color);
    this.cartFeedback.set(null);
    const product = this.product();
    if (!product) return;
    const matching = product.variants.filter((variant) => variant.color === color);
    const currentSize = matching.find((variant) => variant.size === this.selectedSize());
    if (currentSize) { this.clampQuantity(currentSize.stock); return; }
    const next = matching.find((variant) => variant.stock > 0) ?? matching[0];
    if (next) { this.selectedSize.set(next.size); this.clampQuantity(next.stock); }
  }

  selectSize(size: string): void {
    this.selectedSize.set(size);
    this.cartFeedback.set(null);
    this.clampQuantity(this.selectedVariant()?.stock ?? 0);
  }

  decrementQty(): void { this.quantity.update((quantity) => Math.max(1, quantity - 1)); }
  incrementQty(): void { this.quantity.update((quantity) => Math.min(Math.max(1, this.selectedVariant()?.stock ?? 1), quantity + 1)); }

  addToBagMock(): void {
    const product = this.product();
    const variant = this.selectedVariant();
    if (!product || !variant || variant.stock <= 0) return;
    this.cartFeedback.set(`Added ${this.quantity()} × "${product.name}" (${variant.color} / Size ${variant.size} · SKU ${variant.sku}) to bag preview.`);
  }

  scrollToReviews(): void { document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' }); }

  toggleWriteReview(): void {
    this.isWritingReview.update((writing) => !writing);
    this.reviewError.set('');
    this.reviewSuccess.set('');
  }

  countByRating(stars: number): number { return this.reviews().filter((review) => review.rating === stars).length; }

  voteHelpful(review: ProductReview): void {
    const updated = this.reviews().map((item) => item.id !== review.id ? item : {
      ...item,
      helpfulCount: item.userVotedHelpful ? Math.max(0, item.helpfulCount - 1) : item.helpfulCount + 1,
      userVotedHelpful: !item.userVotedHelpful,
    });
    this.reviews.set(updated);
    this.persistReviews(updated);
  }

  submitReview(): void {
    const product = this.product();
    if (!product) return;
    const headline = this.reviewHeadline().trim();
    const comment = this.reviewComment().trim();
    if (!headline) { this.reviewError.set('Please provide a concise headline for your review.'); return; }
    if (comment.length < 15) { this.reviewError.set('Please provide at least 15 characters describing your impressions of the garment.'); return; }
    this.reviewError.set('');
    const name = this.reviewAuthorName().trim() || 'Verified Patron';
    const review: ProductReview = {
      id: `rev-client-${Date.now()}`, productId: product.id, authorName: name,
      avatarLetter: name.charAt(0).toUpperCase() || 'P', rating: this.reviewRating(),
      sizePurchased: this.reviewSize(), fitFeedback: this.reviewFit(), headline, comment,
      createdAt: 'JUST NOW', helpfulCount: 0, isVerifiedBuyer: true, userVotedHelpful: false,
    };
    const updated = [review, ...this.reviews()];
    this.reviews.set(updated);
    this.persistReviews(updated);
    this.reviewHeadline.set('');
    this.reviewComment.set('');
    this.reviewAuthorName.set('');
    this.isWritingReview.set(false);
    this.reviewSuccess.set('Your atelier critique has been successfully published.');
    setTimeout(() => this.reviewSuccess.set(''), 6000);
  }

  retryLiveProduct(): void {
    this.catalogService.retryLiveCatalog();
    this.loadProduct(this.route.snapshot.paramMap.get('id') ?? '');
  }

  private loadProduct(idOrSlug: string): void {
    this.selectedColor.set('');
    this.selectedSize.set('');
    this.activeImage.set(null);
    this.relatedProducts.set([]);
    this.isLoading.set(true);
    this.cartFeedback.set(null);
    this.productRequest?.unsubscribe();
    this.productRequest = this.catalogService.getProductByIdOrSlug(idOrSlug).subscribe((product) => {
      this.product.set(product);
      if (product) {
        this.activeImage.set(product.images.find((image) => image.isPrimary) ?? product.images[0] ?? null);
        const variant = product.variants.find((item) => item.stock > 0) ?? product.variants[0];
        if (variant) {
          this.selectedColor.set(variant.color);
          this.selectedSize.set(variant.size);
          this.quantity.set(1);
          this.reviewSize.set(variant.size);
        }
        this.catalogService.getRelatedProducts(product, 3).subscribe((related) => this.relatedProducts.set(related));
        this.loadReviews(product);
      }
      this.isLoading.set(false);
    });
  }

  private loadReviews(product: Product): void {
    try {
      const raw = localStorage.getItem(`wearez_reviews_${product.id}`);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) { this.reviews.set(parsed as ProductReview[]); return; }
      }
    } catch { /* ignore invalid local review data */ }
    const defaults = this.generateDefaultReviews(product);
    this.reviews.set(defaults);
    this.persistReviews(defaults);
  }

  private persistReviews(reviews: ProductReview[]): void {
    const product = this.product();
    if (!product) return;
    try { localStorage.setItem(`wearez_reviews_${product.id}`, JSON.stringify(reviews)); } catch { /* storage may be unavailable */ }
  }

  private generateDefaultReviews(product: Product): ProductReview[] {
    return [
      {
        id: `rev-default-1-${product.id}`, productId: product.id, authorName: 'Marcus V.', avatarLetter: 'M', rating: 5,
        sizePurchased: product.variants[0]?.size || 'L', fitFeedback: 'TRUE TO ARCHIVE CUT',
        headline: 'Architectural silhouette with peerless structural drape',
        comment: `The material composition of this ${product.name.toLowerCase()} exceeds expectations. Substantial fabric weight, sharp brutalist finishing, and deep tactile character. Easily one of the finest additions to my archive collection.`,
        createdAt: '3 DAYS AGO', helpfulCount: 14, isVerifiedBuyer: true, userVotedHelpful: false,
      },
      {
        id: `rev-default-2-${product.id}`, productId: product.id, authorName: 'Helena K.', avatarLetter: 'H', rating: 5,
        sizePurchased: product.variants[1]?.size || 'M', fitFeedback: 'OVERSIZED DRAPE',
        headline: 'Exquisite attention to finishing and hardware',
        comment: 'The cut falls cleanly across the shoulders with a relaxed yet intentional drape. Highly versatile piece for layering in transient weather conditions.',
        createdAt: '1 WEEK AGO', helpfulCount: 8, isVerifiedBuyer: true, userVotedHelpful: false,
      },
      {
        id: `rev-default-3-${product.id}`, productId: product.id, authorName: 'Julian B.', avatarLetter: 'J', rating: 4,
        sizePurchased: product.variants[0]?.size || 'M', fitFeedback: 'STRUCTURED / FITTED',
        headline: 'Flawless construction, slightly fitted in the sleeves',
        comment: 'Incredible density and feel. If you prefer a more exaggerated streetwear drape, recommend sizing up one tier. Overall superior garment engineering.',
        createdAt: '2 WEEKS AGO', helpfulCount: 5, isVerifiedBuyer: true, userVotedHelpful: false,
      },
    ];
  }

  private clampQuantity(stock: number): void {
    if (stock <= 0) this.quantity.set(1);
    else if (this.quantity() > stock) this.quantity.set(stock);
  }
}
