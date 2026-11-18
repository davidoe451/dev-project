import { Injectable, computed, signal } from '@angular/core';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
  category?: string;
  sizes?: string[];
  color?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly idsKey = 'wearez_wishlist';
  private readonly itemsKey = 'wearez_wishlist_items';

  readonly items = signal<WishlistItem[]>(this.loadItems());
  readonly favorites = signal<Set<string>>(this.loadFavoriteIds());

  readonly count = computed<number>(() => this.favorites().size);

  private loadFavoriteIds(): Set<string> {
    try {
      const stored = localStorage.getItem(this.idsKey);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          return new Set(arr.map(String));
        }
      }
    } catch {
      // Ignore
    }
    return new Set<string>();
  }

  private loadItems(): WishlistItem[] {
    try {
      const stored = localStorage.getItem(this.itemsKey);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          return arr;
        }
      }
    } catch {
      // Ignore
    }
    return [];
  }

  isFavorite(id: string | number): boolean {
    if (!id) return false;
    return this.favorites().has(String(id));
  }

  toggle(itemOrId: string | number | Partial<WishlistItem>, itemInfo?: Partial<WishlistItem>): void {
    if (!itemOrId) return;

    let targetId: string;
    let targetItem: WishlistItem | null = null;

    if (typeof itemOrId === 'string' || typeof itemOrId === 'number') {
      targetId = String(itemOrId);
      if (itemInfo) {
        targetItem = {
          id: targetId,
          name: itemInfo.name || 'Archive Piece',
          price: itemInfo.price || 250,
          image: itemInfo.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
          brand: itemInfo.brand || 'WEAREZ',
          category: itemInfo.category || 'COLLECTION',
          sizes: itemInfo.sizes || ['S', 'M', 'L', 'XL'],
          color: itemInfo.color || 'DEEP SAPPHIRE BLUE',
        };
      }
    } else {
      targetId = String(itemOrId.id);
      targetItem = {
        id: targetId,
        name: itemOrId.name || 'Archive Piece',
        price: itemOrId.price || 250,
        image: itemOrId.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
        brand: itemOrId.brand || 'WEAREZ',
        category: itemOrId.category || 'COLLECTION',
        sizes: itemOrId.sizes || ['S', 'M', 'L', 'XL'],
        color: itemOrId.color || 'DEEP SAPPHIRE BLUE',
      };
    }

    const nextIds = new Set(this.favorites());
    let nextItems = [...this.items()];

    if (nextIds.has(targetId)) {
      nextIds.delete(targetId);
      nextItems = nextItems.filter((i) => String(i.id) !== targetId);
    } else {
      nextIds.add(targetId);
      if (targetItem && !nextItems.some((i) => String(i.id) === targetId)) {
        nextItems.unshift(targetItem);
      }
    }

    this.favorites.set(nextIds);
    this.items.set(nextItems);
    this.persist(nextIds, nextItems);
  }

  saveItem(item: WishlistItem): void {
    const id = String(item.id);
    const nextIds = new Set(this.favorites());
    nextIds.add(id);

    const nextItems = [item, ...this.items().filter((i) => String(i.id) !== id)];
    this.favorites.set(nextIds);
    this.items.set(nextItems);
    this.persist(nextIds, nextItems);
  }

  syncMissingItems(missingProducts: WishlistItem[]): void {
    if (!missingProducts || missingProducts.length === 0) return;
    const current = [...this.items()];
    let changed = false;
    for (const prod of missingProducts) {
      if (!current.some((c) => String(c.id) === String(prod.id))) {
        current.push(prod);
        changed = true;
      }
    }
    if (changed) {
      this.items.set(current);
      this.persist(this.favorites(), current);
    }
  }

  removeItem(id: string | number): void {
    const targetId = String(id);
    const nextIds = new Set(this.favorites());
    nextIds.delete(targetId);

    const nextItems = this.items().filter((i) => String(i.id) !== targetId);
    this.favorites.set(nextIds);
    this.items.set(nextItems);
    this.persist(nextIds, nextItems);
  }

  clear(): void {
    this.favorites.set(new Set());
    this.items.set([]);
    this.persist(new Set(), []);
  }

  private persist(ids: Set<string>, items: WishlistItem[]): void {
    try {
      localStorage.setItem(this.idsKey, JSON.stringify(Array.from(ids)));
      localStorage.setItem(this.itemsKey, JSON.stringify(items));
    } catch {
      // Ignore
    }
  }
}
