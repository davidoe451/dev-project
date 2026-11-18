import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AdminService } from '../../services/admin.service';
import { ProductService } from '@core/services/product.service';
import { Order } from '@core/models/order.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 max-w-7xl mx-auto pb-12">
      <!-- 1. Executive Welcome Header -->
      <div class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
              PARIS ATELIER DISPATCH
            </span>
          </div>
          <h2 class="font-display text-xl sm:text-3xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">
            MAISON ATELIER OVERVIEW
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Welcome back, <strong class="text-slate-800 dark:text-slate-200">{{ auth.currentUser()?.fullName || 'Administrator' }}</strong>.
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="flex flex-wrap items-center gap-3">
          <a
            routerLink="/admin/products"
            class="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs uppercase tracking-wider font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <span class="material-symbols-outlined text-base">add_circle</span>
            <span>ADD PRODUCT DROP</span>
          </a>
          <a
            routerLink="/admin/orders"
            class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider font-bold transition-colors inline-flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-base">receipt_long</span>
            <span>REVIEW ORDERS</span>
          </a>
        </div>
      </div>

      @for (message of loadErrors(); track message) {
        <p role="alert" class="p-4 border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-sm">{{ message }}</p>
      }

      <!-- 2. KPI Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <!-- Card 1: Gross Revenue -->
        <div class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 p-5 space-y-2">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>GROSS ARCHIVE SALES</span>
            <span class="material-symbols-outlined text-lg text-emerald-600 dark:text-emerald-400">payments</span>
          </div>
          <div class="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {{ grossRevenue() === null ? '—' : '$' + grossRevenue() }}
          </div>
          <div class="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <span class="material-symbols-outlined text-xs">trending_up</span>
            <span>Calculated from active orders</span>
          </div>
        </div>

        <!-- Card 2: Runway Orders -->
        <div class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 p-5 space-y-2">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>RUNWAY DISPATCHES</span>
            <span class="material-symbols-outlined text-lg text-sky-600 dark:text-sky-400">local_shipping</span>
          </div>
          <div class="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {{ totalOrdersCount() ?? '—' }} ORDERS
          </div>
          <div class="text-[11px] text-slate-400 font-semibold">
            <span>{{ pendingOrdersCount() ?? '—' }} pending dispatch</span>
          </div>
        </div>

        <!-- Card 3: Active Catalog -->
        <div class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 p-5 space-y-2">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>CATALOG ARCHIVE</span>
            <span class="material-symbols-outlined text-lg text-primary dark:text-sky-300">app_registration</span>
          </div>
          <div class="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {{ totalProductsCount() ?? '—' }} PIECES
          </div>
          <div class="text-[11px] text-slate-400 font-semibold">
            <span>Across {{ categoriesCount() ?? '—' }} categories</span>
          </div>
        </div>

        <!-- Card 4: Client Dossier Members -->
        <div class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 p-5 space-y-2">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>CLIENT VAULT MEMBERS</span>
            <span class="material-symbols-outlined text-lg text-indigo-600 dark:text-indigo-400">group</span>
          </div>
          <div class="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {{ totalUsersCount() ?? '—' }} CLIENTS
          </div>
          <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">verified</span>
            <span>Registered customer accounts</span>
          </div>
        </div>
      </div>

      <!-- 3. Recent Dispatches Table Preview -->
      <div class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 shadow-xs">
        <div class="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h3 class="font-display text-base uppercase font-bold tracking-tight text-slate-900 dark:text-white">
              RECENT RUNWAY DISPATCHES
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
              Live customer transaction queue from Railway backend.
            </p>
          </div>
          <a
            routerLink="/admin/orders"
            class="text-xs uppercase font-bold text-primary dark:text-sky-300 hover:underline inline-flex items-center gap-1"
          >
            <span>VIEW ALL DISPATCHES</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="px-6 py-3.5">ORDER RECORD</th>
                <th class="px-6 py-3.5">RECIPIENT CLIENT</th>
                <th class="px-6 py-3.5">DESTINATION</th>
                <th class="px-6 py-3.5">ACQUISITION TOTAL</th>
                <th class="px-6 py-3.5">STATUS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              @for (ord of recentOrders(); track ord.id) {
                <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="px-6 py-4 font-mono font-bold text-primary dark:text-sky-300">
                    #{{ ord.orderNumber }}
                  </td>
                  <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {{ ord.customerName }}
                  </td>
                  <td class="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {{ ord.address }}
                  </td>
                  <td class="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                    \${{ ord.totalAmount }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      [class.bg-emerald-100]="ord.status === 'DELIVERED'"
                      [class.text-emerald-800]="ord.status === 'DELIVERED'"
                      [class.dark:bg-emerald-950/80]="ord.status === 'DELIVERED'"
                      [class.dark:text-emerald-300]="ord.status === 'DELIVERED'"
                      [class.bg-sky-100]="ord.status === 'SHIPPED' || ord.status === 'PROCESSING'"
                      [class.text-sky-800]="ord.status === 'SHIPPED' || ord.status === 'PROCESSING'"
                      [class.dark:bg-sky-950/80]="ord.status === 'SHIPPED' || ord.status === 'PROCESSING'"
                      [class.dark:text-sky-300]="ord.status === 'SHIPPED' || ord.status === 'PROCESSING'"
                      [class.bg-amber-100]="ord.status === 'PENDING'"
                      [class.text-amber-800]="ord.status === 'PENDING'"
                      [class.dark:bg-amber-950/80]="ord.status === 'PENDING'"
                      [class.dark:text-amber-300]="ord.status === 'PENDING'"
                      [class.bg-rose-100]="ord.status === 'CANCELLED'"
                      [class.text-rose-800]="ord.status === 'CANCELLED'"
                    >
                      {{ ord.status }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-8 text-center text-slate-400 text-xs uppercase tracking-wider">
                    {{ ordersUnavailable() ? 'ORDER DATA IS NOT AVAILABLE' : 'NO DISPATCH RECORDS FOUND' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardPageComponent implements OnInit {
  public readonly auth = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly productService = inject(ProductService);

  readonly totalOrdersCount = signal<number | null>(null);
  readonly pendingOrdersCount = signal<number | null>(null);
  readonly totalProductsCount = signal<number | null>(null);
  readonly categoriesCount = signal<number | null>(null);
  readonly totalUsersCount = signal<number | null>(null);
  readonly grossRevenue = signal<string | null>(null);
  readonly loadErrors = signal<string[]>([]);
  readonly ordersUnavailable = signal(false);
  readonly recentOrders = signal<Order[]>([]);

  ngOnInit(): void {
    // 1. Load real products from API
    this.productService.getProducts(1, 50).subscribe({
      next: (res) => {
        if (res.items) {
          this.totalProductsCount.set(res.meta?.total || res.items.length);
        }
      },
      error: () => this.addLoadError('Could not load product counts. Please check the backend connection.'),
    });

    // 2. Load categories count
    this.productService.getCategories().subscribe({
      next: (cats) => {
        if (Array.isArray(cats)) {
          this.categoriesCount.set(cats.length);
        }
      },
      error: () => this.addLoadError('Could not load categories. Please try again later.'),
    });

    // 3. Load real orders from backend
    this.adminService.getAllOrders(1, 50).subscribe({
      next: (res) => {
        const list = res.items || [];
        this.recentOrders.set(list.slice(0, 5));
        this.totalOrdersCount.set(res.meta?.total || list.length);

        const pending = list.filter((o) => o.status === 'PENDING').length;
        this.pendingOrdersCount.set(pending);

        // Sum revenue
        const total = list.reduce((sum, o) => {
          const val = typeof o.totalAmount === 'string' ? parseFloat(o.totalAmount) : Number(o.totalAmount || 0);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);
        this.grossRevenue.set(total.toFixed(2));
      },
      error: (error) => {
        this.ordersUnavailable.set(true);
        this.addLoadError(error.status === 404
          ? 'Order management is not available on the current backend. Order and revenue statistics cannot be loaded yet.'
          : 'Could not load order and revenue statistics.');
      },
    });

    // 4. Load users count
    this.adminService.getUsers(1, 50).subscribe({
      next: (res) => {
        this.totalUsersCount.set(res.meta?.total ?? res.items.length);
      },
      error: () => this.addLoadError('Could not load customer counts. Check that your admin session is valid.'),
    });
  }

  private addLoadError(message: string): void {
    this.loadErrors.update((errors) => [...errors, message]);
  }
}
