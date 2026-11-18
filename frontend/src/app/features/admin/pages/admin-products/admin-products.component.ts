import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { ProductService } from '@core/services/product.service';
import { CreateProductDto, Product, ProductCategory, UpdateProductDto } from '@core/models/product.model';
import { AppBadgeComponent, AppButtonComponent, AppDialogComponent } from '@shared/ui';
import { ProductImagePickerComponent } from '../../components/product-image-picker/product-image-picker.component';

const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  hoodies: [
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1200&q=80',
    'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?w=1200&q=80',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=1200&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=1200&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&q=80',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=80',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=80',
    'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=1200&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80',
  ],
  jackets: [
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80',
    'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=80',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=80',
    'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1200&q=80',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=1200&q=80',
    'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=1200&q=80',
    'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=1200&q=80',
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=1200&q=80',
    'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=1200&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1200&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80',
  ],
  denim: [
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=1200&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200&q=80',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=1200&q=80',
    'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=1200&q=80',
    'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1200&q=80',
    'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=1200&q=80',
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=1200&q=80',
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=1200&q=80',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1200&q=80',
    'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=1200&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=1200&q=80',
    'https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=1200&q=80',
  ],
  tshirts: [
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=1200&q=80',
    'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=1200&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1200&q=80',
    'https://images.unsplash.com/photo-1618354691551-44de113f0164?w=1200&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80',
    'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=1200&q=80',
    'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=1200&q=80',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=1200&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80',
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=1200&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
    'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1200&q=80',
  ],
};

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, AppButtonComponent, AppDialogComponent, AppBadgeComponent, ProductImagePickerComponent],
  template: `
    <div class="space-y-6 max-w-7xl mx-auto pb-12">
      <!-- 1. Header & Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div class="flex items-center gap-2 text-xs uppercase text-slate-400 font-mono">
            <span>ADMIN</span>
            <span>/</span>
            <span class="text-primary dark:text-sky-300 font-bold">PRODUCTS & DROPS</span>
          </div>
          <h2 class="font-display text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
            PRODUCT CATALOG & ARCHIVE INVENTORY
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-light">
            Manage contemporary garments, editions, stock levels, and category allocations.
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap shrink-0 self-start sm:self-auto">
          <button
            type="button"
            (click)="openEnrichModal()"
            class="px-3.5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs uppercase tracking-wider font-bold transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
            title="Automatically equip all 100 catalog garments with distinct category-matched photoshoot images"
          >
            <span class="material-symbols-outlined text-base">auto_awesome</span>
            <span>DIVERSIFY ALL 100 IMAGES (1-CLICK)</span>
          </button>

          <app-button
            type="button"
            variant="primary"
            size="md"
            (click)="openCreateModal()"
          >
            <span class="material-symbols-outlined text-base">add_circle</span>
            <span>ADD NEW PRODUCT</span>
          </app-button>
        </div>
      </div>

      <!-- Feedback Toast -->
      @if (feedback()) {
        <div
          class="p-3.5 border text-xs flex items-center justify-between"
          [class.bg-emerald-50]="feedback()?.type === 'success'"
          [class.text-emerald-800]="feedback()?.type === 'success'"
          [class.border-emerald-300]="feedback()?.type === 'success'"
          [class.dark:bg-emerald-950/60]="feedback()?.type === 'success'"
          [class.dark:text-emerald-300]="feedback()?.type === 'success'"
          [class.bg-rose-50]="feedback()?.type === 'error'"
          [class.text-rose-800]="feedback()?.type === 'error'"
          [class.border-rose-300]="feedback()?.type === 'error'"
          [class.dark:bg-rose-950/60]="feedback()?.type === 'error'"
          [class.dark:text-rose-300]="feedback()?.type === 'error'"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base">
              {{ feedback()?.type === 'success' ? 'check_circle' : 'error' }}
            </span>
            <span>{{ feedback()?.message }}</span>
          </div>
          <button type="button" (click)="feedback.set(null)" class="text-xs font-bold uppercase cursor-pointer">
            DISMISS
          </button>
        </div>
      }

      <!-- 2. Search & Category Filters -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-dark-surface p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div #searchBoxContainer class="flex-1 relative">
          <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            [value]="searchQuery()"
            (input)="onSearchInput($any($event.target).value)"
            (focus)="isSuggestionsOpen.set(true)"
            (keydown.escape)="isSuggestionsOpen.set(false)"
            placeholder="SEARCH BY PRODUCT NAME, BRAND, CATEGORY, OR SKU (E.G. CARDIGAN, WEAREZ, HOODIE)..."
            class="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white pl-10 pr-10 py-2.5 text-xs uppercase tracking-wider font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary dark:focus:border-sky-400 placeholder:text-slate-400 placeholder:normal-case placeholder:tracking-normal transition-colors"
          />
          @if (searchQuery().trim()) {
            <button
              type="button"
              (click)="clearSearch()"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer flex items-center justify-center p-1"
              title="Clear search"
            >
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          }

          <!-- Smart Keyword Suggestions Dropdown -->
          @if (isSuggestionsOpen() && searchSuggestions().length > 0) {
            <div
              class="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-3"
            >
              <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2 font-mono">
                SUGGESTED KEYWORDS:
              </span>
              <div class="flex flex-wrap gap-1.5">
                @for (term of searchSuggestions(); track term) {
                  <button
                    type="button"
                    (click)="applySuggestion(term)"
                    class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-sky-400 text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-sky-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span class="material-symbols-outlined text-xs text-slate-400">search</span>
                    <span>{{ term }}</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- Category Filter -->
          <select
            [ngModel]="selectedCategory()"
            (ngModelChange)="onCategoryFilterChange($event)"
            class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 uppercase font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">ALL CATEGORIES</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>

          <!-- Brand Filter -->
          <select
            [ngModel]="selectedBrand()"
            (ngModelChange)="onBrandFilterChange($event)"
            class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 uppercase font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">ALL BRANDS</option>
            @for (brand of availableBrands(); track brand) {
              <option [value]="brand">{{ brand }}</option>
            }
          </select>

          <!-- Inventory Stock Filter -->
          <select
            [ngModel]="selectedStockFilter()"
            (ngModelChange)="onStockFilterChange($event)"
            class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 uppercase font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">ALL INVENTORY</option>
            <option value="IN_STOCK">IN STOCK</option>
            <option value="OUT_OF_STOCK">OUT OF STOCK</option>
          </select>

          <button
            type="button"
            (click)="loadProducts(true)"
            class="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs uppercase font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-sm" [class.animate-spin]="isLoading()">refresh</span>
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      <!-- Active Search & Filter Indicator -->
      @if (searchQuery().trim() || selectedCategory() !== 'ALL' || selectedBrand() !== 'ALL' || selectedStockFilter() !== 'ALL') {
        <div class="flex items-center gap-2 flex-wrap px-1 text-xs">
          @if (searchQuery().trim()) {
            <app-badge variant="default" size="md" class="flex items-center gap-1.5 shadow-2xs">
              <span>QUERY: "{{ searchQuery() }}"</span>
              <button
                type="button"
                (click)="clearSearch()"
                class="hover:opacity-75 cursor-pointer flex items-center"
                title="Clear search query"
              >
                <span class="material-symbols-outlined text-xs">close</span>
              </button>
            </app-badge>
          }
          @if (selectedCategory() !== 'ALL') {
            <app-badge variant="secondary" size="md" class="flex items-center gap-1 border border-slate-200 dark:border-slate-700">
              <span>CATEGORY: {{ getCategoryName(selectedCategory()) }}</span>
              <button type="button" (click)="onCategoryFilterChange('ALL')" class="hover:text-rose-500 cursor-pointer">
                <span class="material-symbols-outlined text-xs">close</span>
              </button>
            </app-badge>
          }
          @if (selectedBrand() !== 'ALL') {
            <app-badge variant="secondary" size="md" class="flex items-center gap-1 border border-slate-200 dark:border-slate-700">
              <span>BRAND: {{ selectedBrand() }}</span>
              <button type="button" (click)="onBrandFilterChange('ALL')" class="hover:text-rose-500 cursor-pointer">
                <span class="material-symbols-outlined text-xs">close</span>
              </button>
            </app-badge>
          }
          @if (selectedStockFilter() !== 'ALL') {
            <app-badge variant="secondary" size="md" class="flex items-center gap-1 border border-slate-200 dark:border-slate-700">
              <span>{{ selectedStockFilter() === 'IN_STOCK' ? 'IN STOCK ONLY' : 'OUT OF STOCK ONLY' }}</span>
              <button type="button" (click)="onStockFilterChange('ALL')" class="hover:text-rose-500 cursor-pointer">
                <span class="material-symbols-outlined text-xs">close</span>
              </button>
            </app-badge>
          }
          <button
            type="button"
            (click)="resetAllFilters()"
            class="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-semibold uppercase cursor-pointer ml-1"
          >
            RESET ALL
          </button>
          <span class="text-[11px] text-slate-500 font-mono ml-auto">
            @if (selectedStockFilter() === 'OUT_OF_STOCK') {
              {{ filteredProducts().length }} OUT OF STOCK ON THIS PAGE · {{ totalItems() }} TOTAL MATCHES
            } @else {
              SHOWING {{ totalItems() }} MATCHING PRODUCTS
            }
          </span>
        </div>
      }

      <!-- 3. Products Table -->
      <div class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        @if (isLoading()) {
          <div class="py-16 text-center space-y-3">
            <span class="w-7 h-7 border-2 border-primary dark:border-sky-400 border-t-transparent rounded-full animate-spin inline-block"></span>
            <p class="text-xs uppercase tracking-wider text-slate-500">SYNCHRONIZING INVENTORY WITH RAILWAY DB...</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th class="px-5 py-3.5">PRODUCT / PIECE</th>
                  <th class="px-5 py-3.5">CATEGORY</th>
                  <th class="px-5 py-3.5">PRICE</th>
                  <th class="px-5 py-3.5">STOCK</th>
                  <th class="px-5 py-3.5">SIZES</th>
                  <th class="px-5 py-3.5">STATUS</th>
                  <th class="px-5 py-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                @for (product of paginatedProducts(); track product.id) {
                  <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-3">
                        <div class="relative shrink-0">
                          <img
                            [src]="getProductImage(product)"
                            [alt]="product.name"
                            class="w-10 h-12 object-cover border border-slate-200 dark:border-slate-700 bg-slate-100"
                          />
                          @if (getProductImageCount(product) > 1) {
                            <span
                              class="absolute bottom-0 right-0 bg-primary text-white font-mono text-[9px] px-1 font-bold"
                              title="Multiple images configured"
                            >
                              +{{ getProductImageCount(product) - 1 }}
                            </span>
                          }
                        </div>
                        <div class="min-w-0">
                          <h4 class="font-bold uppercase text-slate-900 dark:text-white truncate">
                            {{ product.name }}
                          </h4>
                          <span class="text-[10px] text-slate-400 font-mono">
                            {{ product.brand || 'WEAREZ' }} • {{ product.id.slice(0, 8) }}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-3.5 uppercase font-medium text-slate-600 dark:text-slate-300">
                      {{ product.category?.name || 'Archive' }}
                    </td>
                    <td class="px-5 py-3.5 font-bold font-mono text-slate-900 dark:text-white">
                      \${{ product.price }}
                    </td>
                    <td class="px-5 py-3.5 font-mono">
                      <span
                        [class.text-emerald-600]="product.stock > 10"
                        [class.text-amber-600]="product.stock <= 10 && product.stock > 0"
                        [class.text-rose-600]="product.stock === 0"
                        class="font-bold"
                      >
                        {{ product.stock }} units
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {{ product.sizes || 'S,M,L,XL' }}
                    </td>
                    <td class="px-5 py-3.5">
                      @if (product.stock <= 0) {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                          <span class="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400"></span>
                          OUT OF STOCK
                        </span>
                      } @else if (product.isActive) {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                          IN STOCK
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          DRAFT
                        </span>
                      }
                    </td>
                    <td class="px-5 py-3.5 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          (click)="openEditModal(product)"
                          class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <span class="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          type="button"
                          (click)="confirmDelete(product)"
                          class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-slate-400 uppercase tracking-wider text-xs">
                      No products matched your criteria.
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            <!-- Pagination Controls -->
            <div class="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/40">
              <!-- Left: Items info & Rows Per Page -->
              <div class="flex items-center gap-4 text-xs">
                <span class="text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider font-semibold">
                  SHOWING <strong class="text-slate-900 dark:text-white">{{ displayedRange().start }}–{{ displayedRange().end }}</strong> OF <strong class="text-slate-900 dark:text-white">{{ displayedRange().total }}</strong> PRODUCTS
                </span>

                <div class="flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">PER PAGE:</span>
                  @for (opt of [10, 15, 25, 50]; track opt) {
                    <button
                      type="button"
                      (click)="setItemsPerPage(opt)"
                      [class.bg-primary]="itemsPerPage() === opt"
                      [class.text-white]="itemsPerPage() === opt"
                      [class.dark:bg-white]="itemsPerPage() === opt"
                      [class.dark:text-primary]="itemsPerPage() === opt"
                      [class.bg-slate-100]="itemsPerPage() !== opt"
                      [class.dark:bg-slate-800]="itemsPerPage() !== opt"
                      [class.text-slate-600]="itemsPerPage() !== opt"
                      [class.dark:text-slate-300]="itemsPerPage() !== opt"
                      class="px-2 py-0.5 text-[11px] font-mono font-bold uppercase cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {{ opt }}
                    </button>
                  }
                </div>
              </div>

              <!-- Right: Page Switcher Navigation -->
              @if (totalPages() > 1) {
                <div class="flex items-center gap-1.5 select-none">
                  <!-- First Page -->
                  <button
                    type="button"
                    (click)="goToPage(1)"
                    [disabled]="currentPage() === 1"
                    class="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="First Page"
                  >
                    <span class="material-symbols-outlined text-sm">first_page</span>
                  </button>

                  <!-- Prev Button -->
                  <button
                    type="button"
                    (click)="prevPage()"
                    [disabled]="currentPage() === 1"
                    class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-primary disabled:opacity-30 disabled:pointer-events-none text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    aria-label="Previous Page"
                  >
                    <span class="material-symbols-outlined text-sm">chevron_left</span>
                    <span class="hidden sm:inline">PREV</span>
                  </button>

                  <!-- Page Number Buttons -->
                  <div class="flex items-center gap-1">
                    @for (p of pageNumbers(); track $index) {
                      @if (p === '...') {
                        <span class="w-7 h-7 flex items-center justify-center text-xs text-slate-400 select-none font-mono">
                          ...
                        </span>
                      } @else {
                        <button
                          type="button"
                          (click)="goToPage(p)"
                          [class.bg-primary]="currentPage() === p"
                          [class.text-white]="currentPage() === p"
                          [class.border-primary]="currentPage() === p"
                          [class.dark:bg-white]="currentPage() === p"
                          [class.dark:text-primary]="currentPage() === p"
                          [class.dark:border-white]="currentPage() === p"
                          [class.bg-white]="currentPage() !== p"
                          [class.dark:bg-slate-900]="currentPage() !== p"
                          [class.text-slate-700]="currentPage() !== p"
                          [class.dark:text-slate-300]="currentPage() !== p"
                          [class.border-slate-200]="currentPage() !== p"
                          [class.dark:border-slate-800]="currentPage() !== p"
                          class="w-7 h-7 flex items-center justify-center text-xs font-mono font-bold border transition-colors cursor-pointer hover:border-primary dark:hover:border-slate-400"
                        >
                          {{ p }}
                        </button>
                      }
                    }
                  </div>

                  <!-- Next Button -->
                  <button
                    type="button"
                    (click)="nextPage()"
                    [disabled]="currentPage() === totalPages()"
                    class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-primary disabled:opacity-30 disabled:pointer-events-none text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    aria-label="Next Page"
                  >
                    <span class="hidden sm:inline">NEXT</span>
                    <span class="material-symbols-outlined text-sm">chevron_right</span>
                  </button>

                  <!-- Last Page -->
                  <button
                    type="button"
                    (click)="goToPage(totalPages())"
                    [disabled]="currentPage() === totalPages()"
                    class="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Last Page"
                  >
                    <span class="material-symbols-outlined text-sm">last_page</span>
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- 4. Modal: Add / Edit Product -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div role="dialog" aria-modal="true" aria-label="Product editor" class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90dvh] overflow-y-auto shadow-2xl my-auto">
            <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 class="font-display text-base uppercase font-bold text-slate-900 dark:text-white">
                  {{ editingProduct() ? 'EDIT PRODUCT ARCHIVE' : 'ADD NEW PRODUCT DROP' }}
                </h3>
                <span class="text-[11px] text-slate-400">Product information and gallery</span>
              </div>
              <button
                type="button"
                (click)="closeModal()"
                class="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <span class="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form (ngSubmit)="saveProduct()" class="p-5 space-y-4 text-xs">
              <!-- Name & Slug -->
              <div class="space-y-1">
                <label for="product-name" class="block font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                  Product Name *
                </label>
                <input
                  id="product-name"
                  type="text"
                  [(ngModel)]="formName"
                  name="formName"
                  required
                  placeholder="e.g. Signature Heavyweight Fleece Hoodie"
                  class="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <!-- Category & Price -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label for="product-category" class="block font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                    Category *
                  </label>
                  <select
                    id="product-category"
                    [(ngModel)]="formCategoryId"
                    name="formCategoryId"
                    required
                    class="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary uppercase cursor-pointer"
                  >
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>
                <div class="space-y-1">
                  <label for="product-price" class="block font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                    Price (USD) *
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    [(ngModel)]="formPrice"
                    name="formPrice"
                    required
                    placeholder="250.00"
                    class="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <!-- Stock & Brand -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label for="product-stock" class="block font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                    Initial Stock Count
                  </label>
                  <input
                    id="product-stock"
                    type="number"
                    [(ngModel)]="formStock"
                    name="formStock"
                    placeholder="100"
                    class="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <label for="product-brand" class="block font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                      Brand / Atelier
                    </label>
                    <button
                      type="button"
                      (click)="toggleCustomBrand()"
                      class="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      {{ isCustomBrand() ? '← Choose from list' : '+ Enter new brand' }}
                    </button>
                  </div>

                  @if (!isCustomBrand()) {
                    <div class="relative">
                      <select
                        id="product-brand"
                        [ngModel]="formBrand"
                        (ngModelChange)="onBrandSelectChange($event)"
                        name="formBrand"
                        class="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer appearance-none pr-8"
                      >
                        @for (b of availableBrands(); track b) {
                          <option [value]="b">{{ b }}</option>
                        }
                        <option value="__CUSTOM__">+ CREATE NEW BRAND...</option>
                      </select>
                      <span
                        class="material-symbols-outlined text-sm absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                      >
                        expand_more
                      </span>
                    </div>
                  } @else {
                    <div class="space-y-1">
                      <input
                        id="product-brand"
                        type="text"
                        [(ngModel)]="formCustomBrand"
                        (ngModelChange)="formBrand = $event"
                        name="formBrand"
                        placeholder="Enter new brand name (e.g. ACNE STUDIOS)"
                        class="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-sky-500 text-slate-900 dark:text-white uppercase text-xs font-semibold focus:outline-none"
                      />
                      <p class="text-[10px] text-slate-500 dark:text-slate-400">
                        New brand will be created and saved with this piece.
                      </p>
                    </div>
                  }
                </div>
              </div>

              <!-- Sizes & Image URL -->
              <div class="space-y-1">
                <label for="product-sizes" class="block font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                  Available Sizes (Comma separated)
                </label>
                <input
                  id="product-sizes"
                  type="text"
                  [(ngModel)]="formSizes"
                  name="formSizes"
                  placeholder="S,M,L,XL,XXL"
                  class="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <!-- Multi-Image Editorial Gallery Section -->
              <app-product-image-picker
                [initialUrls]="formImageList"
                (urlsChange)="formImageList = $event"
                (pendingChange)="hasPendingImages.set($event)"
              />
              <!-- Description -->
              <div class="space-y-1">
                <label for="product-desc" class="block font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                  Product Description
                </label>
                <textarea
                  id="product-desc"
                  rows="3"
                  [(ngModel)]="formDescription"
                  name="formDescription"
                  placeholder="High-density luxury cotton tailoring with raw-edge detailing..."
                  class="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <!-- Buttons -->
              <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="isSaving() || hasPendingImages()"
                  class="px-5 py-2 bg-primary hover:bg-primary-hover text-white uppercase font-bold text-xs tracking-wider transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  @if (isSaving()) {
                    <span class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  }
                  <span>{{ editingProduct() ? 'UPDATE PRODUCT' : 'CREATE PRODUCT' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- 5. Modal: Confirm Delete -->
      <app-dialog
        [open]="!!deletingProduct()"
        (openChange)="!$event && deletingProduct.set(null)"
        title="CONFIRM PRODUCT REMOVAL"
        size="sm"
      >
        <div class="flex items-start gap-3 text-rose-600">
          <span class="material-symbols-outlined text-2xl shrink-0">warning</span>
          <p class="text-xs text-slate-600 dark:text-slate-400">
            Are you sure you want to delete <strong class="text-slate-900 dark:text-white">"{{ deletingProduct()?.name }}"</strong>? This action will permanently remove it from the database.
          </p>
        </div>
        <div dialog-footer class="flex items-center justify-end gap-3 pt-2">
          <app-button
            type="button"
            variant="ghost"
            size="sm"
            (click)="deletingProduct.set(null)"
          >
            Cancel
          </app-button>
          <app-button
            type="button"
            variant="danger"
            size="sm"
            (click)="executeDelete()"
            [disabled]="isSaving()"
          >
            Delete Permanently
          </app-button>
        </div>
      </app-dialog>

      <!-- 6. Modal: Auto-Enrich All Catalog Images -->
      @if (isEnrichModalOpen()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white dark:bg-dark-surface border border-amber-500/40 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <span class="material-symbols-outlined text-2xl">auto_awesome</span>
                <h3 class="font-display text-sm uppercase font-bold tracking-wider text-slate-900 dark:text-white">
                  DIVERSIFY & UPDATE ALL 100 IMAGES
                </h3>
              </div>
              @if (!isEnriching()) {
                <button
                  type="button"
                  (click)="closeEnrichModal()"
                  class="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <span class="material-symbols-outlined text-lg">close</span>
                </button>
              }
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Equip every product in the database with high-resolution photoshoot angles specifically matched to its garment category (Hoodies, Jackets, Denim & Pants, T-Shirts) drawn from an extensive library of 60+ unique editorial looks.
            </p>

            @if (!isEnriching() && !enrichComplete()) {
              <div class="bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 font-mono text-[11px]">CATALOG SIZE:</span>
                  <span class="font-bold text-slate-900 dark:text-white font-mono">{{ products().length }} products loaded</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 font-mono text-[11px]">EDITORIAL ANGLES:</span>
                  <span class="font-bold text-amber-600 dark:text-amber-400 font-mono">3 distinct angles per product</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 font-mono text-[11px]">CATEGORY MATCHING:</span>
                  <span class="font-bold text-slate-900 dark:text-white font-mono">Hoodies, Jackets, Denim, T-Shirts</span>
                </div>
                <label class="flex items-center gap-2 pt-1 text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    [(ngModel)]="enrichOnlySingleImage"
                    class="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>Only update products with single image (Uncheck to update all 100 products)</span>
                </label>
              </div>

              <div class="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  (click)="closeEnrichModal()"
                  class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="startAutoEnrich()"
                  class="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white uppercase font-bold text-xs tracking-wider transition-all cursor-pointer inline-flex items-center gap-2 shadow-md"
                >
                  <span class="material-symbols-outlined text-sm">bolt</span>
                  <span>UPDATE & DIVERSIFY ALL IMAGES</span>
                </button>
              </div>
            } @else if (isEnriching()) {
              <div class="space-y-4 py-3">
                <div class="space-y-1.5">
                  <div class="flex justify-between text-xs font-mono">
                    <span class="text-amber-600 dark:text-amber-400 font-bold uppercase">SYNCHRONIZING WITH DATABASE...</span>
                    <span class="text-slate-500">{{ enrichCurrentIndex() }} / {{ enrichTotalCount() }} ({{ enrichProgressPercent() }}%)</span>
                  </div>
                  <div class="w-full bg-slate-200 dark:bg-slate-800 h-2.5 overflow-hidden">
                    <div
                      class="bg-amber-600 h-full transition-all duration-300"
                      [style.width.%]="enrichProgressPercent()"
                    ></div>
                  </div>
                </div>

                <div class="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
                  Currently updating: <span class="font-bold text-slate-900 dark:text-white">{{ enrichCurrentProduct() }}</span>
                </div>
              </div>
            } @else if (enrichComplete()) {
              <div class="py-4 text-center space-y-3">
                <span class="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
                <h4 class="font-display font-bold uppercase text-slate-900 dark:text-white text-sm">CATALOG ENRICHMENT COMPLETE!</h4>
                <p class="text-xs text-slate-500">
                  Successfully updated {{ enrichUpdatedCount() }} product(s) with multi-angle editorial imagery.
                </p>
                <button
                  type="button"
                  (click)="closeEnrichModal()"
                  class="px-5 py-2 bg-primary hover:bg-primary-hover text-white uppercase font-bold text-xs tracking-wider cursor-pointer"
                >
                  DONE & RELOAD
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsPageComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private productsRequest?: Subscription;
  private searchTimer?: ReturnType<typeof setTimeout>;

  readonly products = signal<Product[]>([]);
  readonly totalItems = signal<number>(0);
  readonly totalPages = signal<number>(1);
  readonly categories = signal<ProductCategory[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly hasPendingImages = signal(false);
  readonly feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  @ViewChild('searchBoxContainer') searchBoxContainerRef?: ElementRef<HTMLElement>;
  readonly isSuggestionsOpen = signal<boolean>(false);

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('ALL');
  readonly selectedBrand = signal<string>('ALL');
  readonly selectedStockFilter = signal<string>('ALL');

  readonly searchSuggestions = computed<string[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      return [];
    }

    const items = this.products();
    const candidateTerms = new Set<string>();

    const knownKeywords = [
      'jacket',
      'hoodie',
      'hoodies',
      'trench',
      'pants',
      'cardigan',
      't-shirt',
      'shirt',
      'coat',
      'sweater',
      'denim',
      'oversized',
      'wool',
      'blazer',
      'raw cut',
      'cargo',
    ];

    for (const kw of knownKeywords) {
      if (kw.toLowerCase().includes(q) && kw.toLowerCase() !== q) {
        candidateTerms.add(kw.toUpperCase());
      }
    }

    for (const p of items) {
      const words = p.name.split(/\s+/).map((w) => w.replace(/[^a-zA-Z0-9-]/g, ''));
      for (const w of words) {
        if (w.length >= 3 && w.toLowerCase().includes(q) && w.toLowerCase() !== q) {
          candidateTerms.add(w.toUpperCase());
        }
      }
      const b = p.brand || 'WEAREZ';
      if (b.toLowerCase().includes(q) && b.toLowerCase() !== q) {
        candidateTerms.add(b.toUpperCase());
      }
      if (p.category?.name && p.category.name.toLowerCase().includes(q) && p.category.name.toLowerCase() !== q) {
        candidateTerms.add(p.category.name.toUpperCase());
      }
    }

    return Array.from(candidateTerms).slice(0, 8);
  });

  readonly allKnownBrands = [
    'WEAREZ',
    'WEAREZ HAUTE',
    'WEAREZ LAB',
    'WEAREZ ATELIER',
    'WEAREZ DENIM',
    'Balenciaga',
    'Saint Laurent',
    'Prada',
    'Rick Owens',
    'Acne Studios',
    'Fear of God',
    'Ami Paris',
    'Stüssy',
    'Carhartt WIP',
    'Nike',
    'Uniqlo',
    "Levi's",
    'Zara',
  ];

  readonly availableBrands = computed(() => {
    const list = this.products();
    const set = new Set<string>();
    for (const p of list) {
      if (p.brand && p.brand.trim()) set.add(p.brand.trim());
    }
    for (const b of this.allKnownBrands) {
      set.add(b);
    }
    return Array.from(set).sort();
  });

  // Modal State
  readonly isModalOpen = signal<boolean>(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly deletingProduct = signal<Product | null>(null);

  // Auto-Enrich Modal State
  readonly isEnrichModalOpen = signal<boolean>(false);
  readonly isEnriching = signal<boolean>(false);
  readonly enrichComplete = signal<boolean>(false);
  readonly enrichProgressPercent = signal<number>(0);
  readonly enrichCurrentIndex = signal<number>(0);
  readonly enrichTotalCount = signal<number>(0);
  readonly enrichUpdatedCount = signal<number>(0);
  readonly enrichCurrentProduct = signal<string>('');
  enrichOnlySingleImage = false;

  formName = '';
  formPrice: number | null = null;
  formStock = 100;
  formCategoryId = '';
  formBrand = 'WEAREZ';
  public readonly isCustomBrand = signal<boolean>(false);
  public formCustomBrand = '';
  formSizes = 'S,M,L,XL';
  formImageList: string[] = ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'];
  formDescription = '';

  openEnrichModal(): void {
    this.isEnrichModalOpen.set(true);
    this.isEnriching.set(false);
    this.enrichComplete.set(false);
    this.enrichProgressPercent.set(0);
    this.enrichCurrentIndex.set(0);
    this.enrichTotalCount.set(0);
    this.enrichUpdatedCount.set(0);
  }

  closeEnrichModal(): void {
    this.isEnrichModalOpen.set(false);
    if (this.enrichComplete()) {
      this.loadProducts(true);
    }
  }

  async startAutoEnrich(): Promise<void> {
    try {
      const firstPage = await firstValueFrom(this.productService.getProducts(1, 50, undefined, undefined, undefined, true));
      const allProducts = [...firstPage.items];
      for (let page = 2; page <= firstPage.meta.totalPages; page++) {
        const result = await firstValueFrom(this.productService.getProducts(page, 50, undefined, undefined, undefined, true));
        allProducts.push(...result.items);
      }

      const toUpdate = this.enrichOnlySingleImage
        ? allProducts.filter((p) => this.getProductImageCount(p) < 3)
        : [...allProducts];

      if (toUpdate.length === 0) {
        this.feedback.set({
          type: 'success',
          message: 'All products already have 3+ gallery images configured!',
        });
        this.closeEnrichModal();
        return;
      }

      this.isEnriching.set(true);
      this.enrichTotalCount.set(toUpdate.length);
      this.enrichCurrentIndex.set(0);
      this.enrichUpdatedCount.set(0);

      let updated = 0;
      for (let i = 0; i < toUpdate.length; i++) {
        const product = toUpdate[i];
        this.enrichCurrentIndex.set(i + 1);
        this.enrichCurrentProduct.set(product.name);
        this.enrichProgressPercent.set(Math.round(((i + 1) / toUpdate.length) * 100));

        // Determine category-specific pool
        const catName = (product.category?.name || product.categoryId || '').toLowerCase();
        const pName = (product.name || '').toLowerCase();
        let pool = CATEGORY_IMAGE_POOLS['tshirts'];
        if (
          catName.includes('hoodie') ||
          catName.includes('sweat') ||
          pName.includes('hoodie') ||
          pName.includes('crewneck') ||
          pName.includes('fleece')
        ) {
          pool = CATEGORY_IMAGE_POOLS['hoodies'];
        } else if (
          catName.includes('jacket') ||
          catName.includes('coat') ||
          catName.includes('outer') ||
          pName.includes('jacket') ||
          pName.includes('coat') ||
          pName.includes('bomber') ||
          pName.includes('trench') ||
          pName.includes('blazer')
        ) {
          pool = CATEGORY_IMAGE_POOLS['jackets'];
        } else if (
          catName.includes('denim') ||
          catName.includes('jean') ||
          catName.includes('pant') ||
          pName.includes('jean') ||
          pName.includes('denim') ||
          pName.includes('pant') ||
          pName.includes('cargo') ||
          pName.includes('trouser')
        ) {
          pool = CATEGORY_IMAGE_POOLS['denim'];
        }

        const h = Math.abs(this.simpleHash(product.id || product.name));
        const baseIdx = (i + h) % pool.length;
        const angle1 = pool[baseIdx];
        const angle2 = pool[(baseIdx + 4) % pool.length];
        const angle3 = pool[(baseIdx + 9) % pool.length];
        const mergedImages = [angle1, angle2, angle3].join(', ');

        try {
          await firstValueFrom(
            this.productService.updateProduct(product.id, {
              name: product.name,
              price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
              categoryId: product.categoryId,
              brand: product.brand || 'WEAREZ',
              sizes: product.sizes || 'S,M,L,XL',
              stock: product.stock,
              description: product.description,
              images: mergedImages,
            })
          );
          updated++;
        } catch (err) {
          console.error(`Failed to enrich product ${product.id}`, err);
        }
      }

      this.enrichUpdatedCount.set(updated);
      this.isEnriching.set(false);
      this.enrichComplete.set(true);
      this.feedback.set({
        type: 'success',
        message: `Successfully diversified ${updated} product(s) with high-fashion multi-angle imagery!`,
      });
      this.loadProducts(true);
    } catch (err) {
      this.isEnriching.set(false);
      this.feedback.set({ type: 'error', message: 'An error occurred during image diversification.' });
      console.error(err);
    }
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  getProductImageCount(p: Product): number {
    if (!p.images) return 1;
    const parts = p.images.split(',').filter((s) => s.trim().length > 0);
    return parts.length || 1;
  }

  getFormattedImagesString(): string {
    const valid = this.formImageList
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    return valid.join(', ');
  }

  public onBrandSelectChange(val: string): void {
    if (val === '__CUSTOM__') {
      this.isCustomBrand.set(true);
      this.formCustomBrand = '';
      this.formBrand = '';
    } else {
      this.formBrand = val;
    }
  }

  public toggleCustomBrand(): void {
    const next = !this.isCustomBrand();
    this.isCustomBrand.set(next);
    if (next) {
      this.formCustomBrand = this.formBrand === 'WEAREZ' ? '' : this.formBrand;
    } else {
      this.formBrand = this.availableBrands().length > 0 ? this.availableBrands()[0] : 'WEAREZ';
    }
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => {
        if (Array.isArray(cats)) {
          this.categories.set(cats);
          if (cats.length > 0 && !this.formCategoryId) {
            this.formCategoryId = cats[0].id;
          }
        }
      },
      error: () => {},
    });
  }

  loadProducts(forceRefresh = false): void {
    this.isLoading.set(true);
    this.productsRequest?.unsubscribe();
    const categorySlug = this.selectedCategory() === 'ALL'
      ? undefined
      : this.categories().find((category) => category.id === this.selectedCategory())?.slug;
    const selectedBrand = this.selectedBrand();
    const brandSlug = selectedBrand === 'ALL'
      ? undefined
      : this.products().find((product) => product.brand?.toLowerCase() === selectedBrand.toLowerCase())?.brandSlug || this.slugify(selectedBrand);
    this.productsRequest = this.productService
      .getProducts(
        this.currentPage(),
        this.itemsPerPage(),
        this.searchQuery().trim() || undefined,
        brandSlug,
        categorySlug,
        forceRefresh,
        this.selectedStockFilter() === 'IN_STOCK',
      )
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.products.set(res.items || []);
          this.totalItems.set(res.meta.total);
          this.totalPages.set(Math.max(1, res.meta.totalPages));
          this.currentPage.set(res.meta.page);
        },
        error: () => {
          this.isLoading.set(false);
          this.feedback.set({ type: 'error', message: 'Failed to load products from database.' });
        },
      });
  }

  ngOnDestroy(): void {
    this.productsRequest?.unsubscribe();
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  getCategoryName(catId: string): string {
    const cat = this.categories().find((c) => c.id === catId);
    return cat ? cat.name : catId;
  }

  onSearchInput(val: string): void {
    this.searchQuery.set(val);
    this.currentPage.set(1);
    this.isSuggestionsOpen.set(true);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadProducts(), 300);
  }

  applySuggestion(term: string): void {
    this.searchQuery.set(term);
    this.currentPage.set(1);
    this.isSuggestionsOpen.set(false);
    this.loadProducts();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.isSuggestionsOpen.set(false);
    this.loadProducts();
  }

  resetAllFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('ALL');
    this.selectedBrand.set('ALL');
    this.selectedStockFilter.set('ALL');
    this.currentPage.set(1);
    this.isSuggestionsOpen.set(false);
    this.loadProducts();
  }

  onCategoryFilterChange(val: string): void {
    this.selectedCategory.set(val);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onBrandFilterChange(val: string): void {
    this.selectedBrand.set(val);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onStockFilterChange(val: string): void {
    this.selectedStockFilter.set(val);
    this.currentPage.set(1);
    this.loadProducts();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.searchBoxContainerRef &&
      !this.searchBoxContainerRef.nativeElement.contains(event.target as Node)
    ) {
      this.isSuggestionsOpen.set(false);
    }
  }

  readonly filteredProducts = computed<Product[]>(() => {
    let list = this.products();
    const stock = this.selectedStockFilter();
    if (stock === 'OUT_OF_STOCK') {
      list = list.filter((p) => (p.stock || 0) <= 0);
    }
    return list;
  });

  // Pagination State
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = signal<number>(10);

  readonly paginatedProducts = computed<Product[]>(() => this.filteredProducts());

  readonly displayedRange = computed(() => {
    const total = this.totalItems();
    if (total === 0) return { start: 0, end: 0, total: 0 };
    const page = this.currentPage();
    const limit = this.itemsPerPage();
    const start = (page - 1) * limit + 1;
    const end = Math.min((page - 1) * limit + this.products().length, total);
    return { start, end, total };
  });

  readonly pageNumbers = computed<(number | string)[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, '...', total];
    } else if (current >= total - 2) {
      return [1, '...', total - 3, total - 2, total - 1, total];
    } else {
      return [1, '...', current - 1, current, current + 1, '...', total];
    }
  });

  goToPage(page: number | string): void {
    if (typeof page !== 'number') return;
    const target = Math.max(1, Math.min(page, this.totalPages()));
    this.currentPage.set(target);
    this.loadProducts();
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadProducts();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadProducts();
    }
  }

  setItemsPerPage(limit: number): void {
    this.itemsPerPage.set(limit);
    this.currentPage.set(1);
    this.loadProducts();
  }

  getProductImage(p: Product): string {
    if (p.images) {
      return p.images.split(',')[0].trim();
    }
    return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800';
  }

  openCreateModal(): void {
    this.hasPendingImages.set(false);
    this.editingProduct.set(null);
    this.formName = '';
    this.formPrice = 195;
    this.formStock = 50;
    this.formCategoryId = this.categories().length > 0 ? this.categories()[0].id : '';
    this.isCustomBrand.set(false);
    this.formBrand = 'WEAREZ';
    this.formCustomBrand = '';
    this.formSizes = 'S,M,L,XL';
    this.formImageList = [];
    this.formDescription = 'Contemporary streetwear piece crafted with premium heavyweight cotton.';
    this.isModalOpen.set(true);
  }

  openEditModal(p: Product): void {
    this.hasPendingImages.set(false);
    this.editingProduct.set(p);
    this.formName = p.name;
    this.formPrice = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
    this.formStock = p.stock;
    this.formCategoryId = p.categoryId;
    const currentBrand = p.brand || 'WEAREZ';
    if (this.availableBrands().includes(currentBrand)) {
      this.isCustomBrand.set(false);
      this.formBrand = currentBrand;
      this.formCustomBrand = '';
    } else {
      this.isCustomBrand.set(true);
      this.formBrand = currentBrand;
      this.formCustomBrand = currentBrand;
    }
    this.formSizes = p.sizes || 'S,M,L,XL';
    if (p.images) {
      const list = p.images.split(',').map((s) => s.trim()).filter(Boolean);
      this.formImageList = list;
    } else {
      this.formImageList = [];
    }
    this.formDescription = p.description || '';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingProduct.set(null);
  }

  saveProduct(): void {
    if (this.hasPendingImages() || this.isSaving()) return;
    if (!this.formName.trim() || !this.formPrice || !this.formCategoryId) {
      this.feedback.set({ type: 'error', message: 'Please provide product name, price, and category.' });
      return;
    }

    const finalBrand = (this.isCustomBrand() ? this.formCustomBrand.trim() : this.formBrand.trim()) || 'WEAREZ';
    this.formBrand = finalBrand;
    const finalImages = this.getFormattedImagesString();

    this.isSaving.set(true);
    const editing = this.editingProduct();

    if (editing) {
      const dto: UpdateProductDto = {
        name: this.formName.trim(),
        price: Number(this.formPrice),
        stock: Number(this.formStock || 0),
        categoryId: this.formCategoryId,
        brand: finalBrand,
        sizes: this.formSizes,
        images: finalImages,
        description: this.formDescription,
      };

      this.productService.updateProduct(editing.id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeModal();
          this.feedback.set({ type: 'success', message: `Product "${this.formName}" updated successfully.` });
          this.loadProducts(true);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.feedback.set({ type: 'error', message: err.error?.message || 'Failed to update product.' });
        },
      });
    } else {
      const dto: CreateProductDto = {
        name: this.formName.trim(),
        price: Number(this.formPrice),
        categoryId: this.formCategoryId,
        stock: Number(this.formStock || 50),
        brand: finalBrand,
        sizes: this.formSizes,
        images: finalImages,
        description: this.formDescription,
      };

      this.productService.createProduct(dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeModal();
          this.feedback.set({ type: 'success', message: `Product "${this.formName}" created successfully.` });
          this.loadProducts(true);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.feedback.set({ type: 'error', message: err.error?.message || 'Failed to create product.' });
        },
      });
    }
  }

  confirmDelete(p: Product): void {
    this.deletingProduct.set(p);
  }

  executeDelete(): void {
    const target = this.deletingProduct();
    if (!target) return;

    this.isSaving.set(true);
    this.productService.deleteProduct(target.id).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.deletingProduct.set(null);
        this.feedback.set({ type: 'success', message: `Product "${target.name}" deleted from database.` });
        this.loadProducts(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.deletingProduct.set(null);
        this.feedback.set({ type: 'error', message: err.error?.message || 'Failed to delete product.' });
      },
    });
  }
}
