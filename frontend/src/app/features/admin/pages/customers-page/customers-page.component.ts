import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { User } from '@core/models/user.model';
import {
  AppBadgeComponent,
  AppButtonComponent,
  AppCardComponent,
  AppDialogComponent,
  AppInputComponent,
  AppSpinnerComponent,
  AppTableComponent,
} from '@shared/ui';

type StatusFilter = 'all' | 'pending' | 'active';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [
    AppCardComponent,
    AppButtonComponent,
    AppBadgeComponent,
    AppInputComponent,
    AppTableComponent,
    AppSpinnerComponent,
    AppDialogComponent,
  ],
  template: `
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-7">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p class="text-[11px] uppercase tracking-[0.25em] text-primary dark:text-sky-300 font-bold">ADMIN</p>
          <h1 class="font-display text-3xl uppercase text-slate-950 dark:text-white mt-2">Customer Accounts</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Review registered customers and manage account access.</p>
        </div>
        <app-button
          variant="outline"
          size="sm"
          (click)="loadCustomers()"
          [disabled]="isLoading()"
        >
          <span class="material-symbols-outlined text-base mr-1">refresh</span>
          Refresh
        </app-button>
      </div>

      @if (errorMessage()) {
        <div role="alert" class="p-4 border border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 text-sm">
          {{ errorMessage() }}
        </div>
      }
      @if (successMessage()) {
        <div role="status" class="p-4 border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-sm">
          {{ successMessage() }}
        </div>
      }

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <app-card padding="sm">
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Total customers</p>
          <p class="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{{ customers().length }}</p>
        </app-card>
        <app-card padding="sm">
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Pending</p>
          <p class="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{{ pendingCount() }}</p>
        </app-card>
        <app-card padding="sm" class="col-span-2 sm:col-span-1">
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Active</p>
          <p class="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{{ activeCount() }}</p>
        </app-card>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <app-input
          type="search"
          placeholder="Search by email..."
          [value]="search()"
          (valueChange)="search.set($event)"
          wrapperClass="sm:w-80"
        />

        <div class="flex gap-2" role="group" aria-label="Filter by account status">
          @for (option of filters; track option.value) {
            <app-button
              [variant]="statusFilter() === option.value ? 'primary' : 'secondary'"
              size="sm"
              (click)="statusFilter.set(option.value)"
            >
              {{ option.label }}
            </app-button>
          }
        </div>
      </div>

      <!-- Table Section -->
      @if (isLoading()) {
        <div role="status" class="py-16 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
          <app-spinner size="lg" />
          <span>Loading customer accounts...</span>
        </div>
      } @else if (filteredCustomers().length === 0 && !errorMessage()) {
        <app-card padding="lg" class="text-center text-sm text-slate-500">
          No customer accounts found matching your query.
        </app-card>
      } @else if (filteredCustomers().length > 0) {
        <app-table>
          <th table-header scope="col" class="p-4">Customer</th>
          <th table-header scope="col" class="p-4">Status</th>
          <th table-header scope="col" class="p-4">Registered</th>
          <th table-header scope="col" class="p-4 text-right">Action</th>

          @for (customer of filteredCustomers(); track customer.id) {
            <tr table-body class="border-t border-slate-200 dark:border-slate-800">
              <td class="p-4">
                <span class="font-medium text-slate-900 dark:text-white">{{ customer.email }}</span>
                <span class="block text-xs text-slate-500">#{{ customer.id }}</span>
              </td>
              <td class="p-4">
                <app-badge [variant]="customer.isActive ? 'success' : 'warning'" size="sm">
                  {{ customer.isActive ? 'Active' : 'Pending' }}
                </app-badge>
              </td>
              <td class="p-4 text-slate-500">{{ customer.createdAt ? customer.createdAt.slice(0, 10) : '—' }}</td>
              <td class="p-4 text-right">
                <app-button
                  [variant]="customer.isActive ? 'outline' : 'primary'"
                  size="sm"
                  (click)="handleToggleClick(customer)"
                  [disabled]="pendingId() !== null"
                >
                  @if (pendingId() === customer.id) {
                    <app-spinner size="sm" class="mr-1" />
                    <span>Saving...</span>
                  } @else {
                    <span>{{ customer.isActive ? 'Deactivate' : 'Activate' }}</span>
                  }
                </app-button>
              </td>
            </tr>
          }
        </app-table>
      }

      <!-- Deactivate Confirmation Dialog -->
      <app-dialog
        [open]="customerToDeactivate() !== null"
        (openChange)="customerToDeactivate.set(null)"
        title="Confirm Deactivation"
        description="Are you sure you want to deactivate this customer account? The user will no longer be able to sign in."
        size="sm"
      >
        <p class="font-bold text-slate-950 dark:text-white py-2">
          {{ customerToDeactivate()?.email }}
        </p>

        <div dialog-footer class="flex items-center gap-2">
          <app-button
            variant="secondary"
            size="sm"
            (click)="customerToDeactivate.set(null)"
          >
            Cancel
          </app-button>
          <app-button
            variant="danger"
            size="sm"
            (click)="confirmDeactivate()"
          >
            Confirm Deactivate
          </app-button>
        </div>
      </app-dialog>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersPageComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  readonly customers = signal<User[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<StatusFilter>('pending');
  readonly isLoading = signal(false);
  readonly pendingId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly customerToDeactivate = signal<User | null>(null);

  readonly filters: { value: StatusFilter; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'all', label: 'All' },
  ];

  readonly pendingCount = computed(() => this.customers().filter((user) => !user.isActive).length);
  readonly activeCount = computed(() => this.customers().filter((user) => user.isActive).length);
  readonly filteredCustomers = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.customers().filter((user) =>
      (this.statusFilter() === 'all' || user.isActive === (this.statusFilter() === 'active')) &&
      user.email.toLowerCase().includes(query),
    );
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.customerService.list().subscribe({
      next: (users) => {
        this.customers.set(users.filter((user) => user.role?.code === 'CUSTOMER'));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Could not load customers. Please check the backend connection and try again.');
      },
    });
  }

  handleToggleClick(customer: User): void {
    if (customer.isActive) {
      this.customerToDeactivate.set(customer);
    } else {
      this.toggleActive(customer, true);
    }
  }

  confirmDeactivate(): void {
    const customer = this.customerToDeactivate();
    if (!customer) return;
    this.customerToDeactivate.set(null);
    this.toggleActive(customer, false);
  }

  private toggleActive(customer: User, newActiveState: boolean): void {
    this.pendingId.set(customer.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.customerService.setActive(customer.id, newActiveState).subscribe({
      next: (updated) => {
        this.customers.update((users) =>
          users.map((user) => (user.id === customer.id ? { ...user, ...updated } : user)),
        );
        this.pendingId.set(null);
        this.successMessage.set(
          `${customer.email} has been ${updated.isActive ? 'activated' : 'deactivated'}.`,
        );
      },
      error: () => {
        this.pendingId.set(null);
        this.errorMessage.set(`Could not update ${customer.email}. Please try again.`);
      },
    });
  }
}
