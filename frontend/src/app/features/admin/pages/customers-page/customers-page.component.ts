import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { User } from '@core/models/user.model';
import {
  AppAlertComponent,
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
    AppAlertComponent,
    AppCardComponent,
    AppButtonComponent,
    AppBadgeComponent,
    AppInputComponent,
    AppTableComponent,
    AppSpinnerComponent,
    AppDialogComponent,
  ],
  templateUrl: './customers-page.component.html',
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
    return this.customers().filter(
      (user) =>
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
        this.errorMessage.set(
          'Could not load customers. Please check the backend connection and try again.',
        );
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
