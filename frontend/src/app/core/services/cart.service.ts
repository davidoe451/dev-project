import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

function isUuid(val: unknown): boolean {
  if (typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

function cleanSize(raw?: string): string {
  if (!raw) return 'M';
  const first = raw.split(' ')[0].trim().toUpperCase();
  return first.substring(0, 10);
}

interface BackendCartItem {
  id?: string | number;
  productId?: string | number;
  productName?: string;
  productSlug?: string;
  productImage?: string;
  price?: string | number;
  size?: string;
  quantity?: number;
  totalPrice?: number;
  inStock?: boolean;
  name?: string;
  image?: string;
  color?: string;
  edition?: string;
  product?: {
    name?: string;
    images?: string;
  };
}

export interface CartItem {
  id: string | number;
  cartItemId?: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color?: string;
  edition?: string;
  quantity: number;
  selected?: boolean;
  stock?: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  readonly items = signal<CartItem[]>([]);
  private currentAccountKey = 'cart_guest';

  readonly recentAddedItem = signal<CartItem | null>(null);
  readonly isDismissing = signal<boolean>(false);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  readonly itemCount = computed(() => this.items().reduce((acc, item) => acc + item.quantity, 0));
  readonly selectedItems = computed(() =>
    this.items().filter((item) => item.selected !== false && (item.stock === undefined || item.stock > 0))
  );
  readonly selectedCount = computed(() => this.selectedItems().reduce((acc, item) => acc + item.quantity, 0));
  readonly isAllSelected = computed(() => {
    const list = this.items();
    return list.length > 0 && list.every((item) => item.selected !== false);
  });

  readonly subtotal = computed(() => this.selectedItems().reduce((acc, item) => acc + item.price * item.quantity, 0));
  readonly shipping = computed(() => (this.subtotal() > 250 || this.subtotal() === 0 ? 0 : 25));
  readonly total = computed(() => this.subtotal() + this.shipping());

  constructor() {
    const user = this.auth.currentUser();
    this.currentAccountKey = this.resolveAccountKey(user);
    this.items.set(this.loadFromStorage(this.currentAccountKey));

    if (this.auth.isAuthenticated()) {
      this.syncWithBackend();
    }

    // Reactively switch carts whenever authenticated user changes
    effect(() => {
      const activeUser = this.auth.currentUser();
      const targetKey = this.resolveAccountKey(activeUser);
      if (targetKey !== this.currentAccountKey) {
        this.switchAccount(targetKey);
      }
    });
  }

  private resolveAccountKey(user: unknown): string {
    const u = user as { email?: string; id?: string } | null;
    if (u?.email) return `cart_${u.email.toLowerCase().trim()}`;
    if (u?.id) return `cart_${u.id}`;
    return 'cart_guest';
  }

  private switchAccount(newKey: string): void {
    // Persist previous account cart
    this.persistToStorage(this.currentAccountKey, this.items());

    const prevKey = this.currentAccountKey;
    this.currentAccountKey = newKey;

    let loaded = this.loadFromStorage(newKey);

    // If logging in from guest to empty account cart, migrate guest items
    if (prevKey === 'cart_guest' && newKey !== 'cart_guest' && loaded.length === 0) {
      const guestItems = this.loadFromStorage('cart_guest');
      if (guestItems.length > 0) {
        loaded = guestItems;
        this.persistToStorage(newKey, loaded);
        this.persistToStorage('cart_guest', []);
      }
    }

    this.items.set(loaded);

    if (this.auth.isAuthenticated()) {
      this.syncWithBackend();
    }
  }

  private loadFromStorage(key: string): CartItem[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persistToStorage(key: string, items: CartItem[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // ignore
    }
  }

  private saveCurrentState(list: CartItem[]): void {
    this.items.set(list);
    this.persistToStorage(this.currentAccountKey, list);
  }

  syncWithBackend(): void {
    this.http.get<{ success?: boolean; data?: unknown }>(`${environment.apiUrl}/cart`).subscribe({
      next: (res) => {
        const beData = res?.data as { items?: unknown[] } | unknown[] | undefined;
        const beItems = Array.isArray(beData) ? beData : beData?.items;
        if (Array.isArray(beItems)) {
          const mapped: CartItem[] = beItems.map((rawItem: unknown) => {
            const b = rawItem as BackendCartItem;
            return {
              id: b.productId || b.id || 'item',
              cartItemId: b.id ? String(b.id) : undefined,
              name: b.productName || b.product?.name || b.name || 'Runway Archive Item',
              price: typeof b.price === 'string' ? parseFloat(b.price) : b.price || 0,
              image: b.productImage || (b.product?.images ? b.product.images.split(',')[0].trim() : b.image || ''),
              size: b.size || 'M',
              color: b.color || 'DEEP SAPPHIRE BLUE',
              edition: b.edition || 'RUNWAY DROP',
              quantity: b.quantity || 1,
              selected: true,
            };
          });

          if (mapped.length > 0) {
            this.items.set(mapped);
            this.persistToStorage(this.currentAccountKey, mapped);
          } else {
            // If server cart is empty but local cart has valid items, push them to server!
            const localItems = this.items();
            localItems.forEach((item) => {
              if (isUuid(item.id)) {
                this.pushItemToBackend(item);
              }
            });
          }
        }
      },
      error: () => {},
    });
  }

  private pushItemToBackend(item: CartItem): void {
    if (!this.auth.isAuthenticated() || !isUuid(item.id)) return;
    this.http
      .post<{ success?: boolean; data?: { id?: string } }>(`${environment.apiUrl}/cart/items`, {
        productId: String(item.id),
        size: cleanSize(item.size),
        quantity: item.quantity || 1,
      })
      .subscribe({
        next: (res) => {
          if (res?.data?.id) {
            const list = this.items().map((it) =>
              it.id === item.id && it.size === item.size ? { ...it, cartItemId: String(res.data?.id) } : it,
            );
            this.saveCurrentState(list);
          }
        },
        error: (err) => console.warn('Failed to add cart item to server', err),
      });
  }

  addItem(newItem: Omit<CartItem, 'quantity'> & { quantity?: number; stock?: number }): void {
    if (newItem.stock !== undefined && newItem.stock <= 0) {
      console.warn('Cannot add out-of-stock item to bag:', newItem.name);
      return;
    }
    const list = [...this.items()];
    const index = list.findIndex(
      (i) => i.id === newItem.id && i.size === newItem.size && i.color === newItem.color,
    );
    let addedItem: CartItem;

    if (index > -1) {
      list[index] = {
        ...list[index],
        quantity: list[index].quantity + (newItem.quantity || 1),
        selected: true,
      };
      addedItem = list[index];
    } else {
      addedItem = {
        ...newItem,
        quantity: newItem.quantity || 1,
        selected: true,
      };
      list.push(addedItem);
    }

    this.saveCurrentState(list);
    this.notifyItemAdded(addedItem);

    if (this.auth.isAuthenticated() && isUuid(addedItem.id)) {
      if (addedItem.cartItemId) {
        this.http
          .patch(`${environment.apiUrl}/cart/items/${addedItem.cartItemId}`, { quantity: addedItem.quantity })
          .subscribe({ error: () => {} });
      } else {
        this.pushItemToBackend(addedItem);
      }
    }
  }

  private notifyItemAdded(item: CartItem): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
    }
    this.isDismissing.set(false);
    this.recentAddedItem.set(item);
    this.toastTimer = setTimeout(() => {
      this.dismissToast();
    }, 4000);
  }

  dismissToast(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    this.isDismissing.set(true);
    this.dismissTimer = setTimeout(() => {
      this.recentAddedItem.set(null);
      this.isDismissing.set(false);
      this.dismissTimer = null;
    }, 300);
  }

  updateItemAttributes(index: number, newSize?: string, newColor?: string): void {
    const list = [...this.items()];
    if (index < 0 || index >= list.length) return;
    const current = list[index];
    const targetSize = newSize ?? current.size;
    const targetColor = newColor ?? current.color;

    const existingIdx = list.findIndex(
      (i, idx) => idx !== index && i.id === current.id && i.size === targetSize && i.color === targetColor,
    );

    if (existingIdx > -1) {
      list[existingIdx] = {
        ...list[existingIdx],
        quantity: list[existingIdx].quantity + current.quantity,
      };
      list.splice(index, 1);
    } else {
      list[index] = {
        ...current,
        size: targetSize,
        color: targetColor,
      };
    }
    this.saveCurrentState(list);
  }

  updateQuantityByIndex(index: number, delta: number): void {
    const list = [...this.items()];
    if (index < 0 || index >= list.length) return;
    const current = list[index];
    const newQty = current.quantity + delta;

    if (newQty > 0) {
      list[index] = { ...current, quantity: newQty };
      this.saveCurrentState(list);

      if (this.auth.isAuthenticated() && current.cartItemId) {
        this.http.patch(`${environment.apiUrl}/cart/items/${current.cartItemId}`, { quantity: newQty }).subscribe({
          error: (err) => console.warn('Failed to update cart item quantity on server', err),
        });
      }
    } else {
      this.removeItemByIndex(index);
    }
  }

  removeItemByIndex(index: number): void {
    const list = [...this.items()];
    if (index >= 0 && index < list.length) {
      const item = list[index];
      list.splice(index, 1);
      this.saveCurrentState(list);

      if (this.auth.isAuthenticated() && item.cartItemId) {
        this.http.delete(`${environment.apiUrl}/cart/items/${item.cartItemId}`).subscribe({
          error: (err) => console.warn('Failed to remove cart item on server', err),
        });
      }
    }
  }

  updateQuantity(id: string | number, size: string, delta: number): void {
    const list = [...this.items()];
    const index = list.findIndex((i) => i.id === id && i.size === size);
    if (index > -1) {
      this.updateQuantityByIndex(index, delta);
    }
  }

  removeItem(id: string | number, size: string): void {
    const index = this.items().findIndex((i) => i.id === id && i.size === size);
    if (index > -1) {
      this.removeItemByIndex(index);
    }
  }

  toggleItemSelection(index: number): void {
    const list = [...this.items()];
    if (index < 0 || index >= list.length) return;
    list[index] = {
      ...list[index],
      selected: list[index].selected === false,
    };
    this.saveCurrentState(list);
  }

  selectAll(select: boolean): void {
    const list = this.items().map((item) => ({
      ...item,
      selected: select,
    }));
    this.saveCurrentState(list);
  }

  expressBuy(newItem: Omit<CartItem, 'quantity' | 'selected'> & { quantity?: number; stock?: number }): void {
    if (newItem.stock !== undefined && newItem.stock <= 0) {
      console.warn('Cannot express buy out-of-stock item:', newItem.name);
      return;
    }
    // Uncheck all existing items so only this express buy product is selected for checkout
    const list = this.items().map((item) => ({
      ...item,
      selected: false,
    }));

    const index = list.findIndex(
      (i) => i.id === newItem.id && i.size === newItem.size && i.color === newItem.color,
    );

    if (index > -1) {
      list[index] = {
        ...list[index],
        selected: true,
      };
    } else {
      list.push({
        ...newItem,
        quantity: newItem.quantity || 1,
        selected: true,
      });
    }

    this.saveCurrentState(list);
    if (this.auth.isAuthenticated() && isUuid(newItem.id)) {
      this.pushItemToBackend({
        ...newItem,
        quantity: newItem.quantity || 1,
      });
    }
  }

  clearSelected(): void {
    const selected = this.items().filter((item) => item.selected !== false);
    const remaining = this.items().filter((item) => item.selected === false);
    this.saveCurrentState(remaining);

    if (this.auth.isAuthenticated()) {
      if (remaining.length === 0) {
        this.http.delete(`${environment.apiUrl}/cart/clear`).subscribe({
          error: () => {},
        });
      } else {
        selected.forEach((item) => {
          if (item.cartItemId) {
            this.http.delete(`${environment.apiUrl}/cart/items/${item.cartItemId}`).subscribe({
              error: () => {},
            });
          }
        });
      }
    }
  }

  clear(): void {
    this.saveCurrentState([]);
    if (this.auth.isAuthenticated()) {
      this.http.delete(`${environment.apiUrl}/cart/clear`).subscribe({
        error: () => {},
      });
    }
  }
}
