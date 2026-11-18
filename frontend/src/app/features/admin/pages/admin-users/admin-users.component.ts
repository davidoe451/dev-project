import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser } from '../../services/admin.service';
import { AppButtonComponent, AppDialogComponent } from '@shared/ui';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, AppButtonComponent, AppDialogComponent],
  template: `
    <div class="space-y-6 max-w-7xl mx-auto pb-12">
      <!-- 1. Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div class="flex items-center gap-2 text-xs uppercase text-slate-400 font-mono">
            <span>ADMIN</span>
            <span>/</span>
            <span class="text-primary dark:text-sky-300 font-bold">CLIENT VAULT</span>
          </div>
          <h2 class="font-display text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
            CUSTOMER ACCOUNTS
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-light">
            Review customer registrations and manage account access.
          </p>
        </div>

        <button
          type="button"
          (click)="loadUsers()"
          class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <span class="material-symbols-outlined text-base" [class.animate-spin]="isLoading()">refresh</span>
          <span>REFRESH CLIENTS</span>
        </button>
      </div>

      <!-- Feedback Banner -->
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

      <!-- 2. Search & Stats -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-dark-surface p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div class="flex-1 relative">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">search</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Search clients by name, email, or telephone..."
            class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-sky-400"
          />
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400 font-mono self-center">
          REGISTERED: <strong class="text-slate-900 dark:text-white">{{ users().length }}</strong> CLIENTS
        </div>
      </div>

      <!-- 3. Users Table -->
      <div class="flex flex-wrap gap-2" role="group" aria-label="Filter customer status on this page">
        @for (status of statuses; track status) {
          <app-button size="sm" [variant]="statusFilter() === status ? 'primary' : 'outline'" (click)="statusFilter.set(status)">{{ status === 'ALL' ? 'All on this page' : status === 'INACTIVE' ? 'Awaiting activation' : 'Active' }}</app-button>
        }
      </div>
      <div class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        @if (isLoading()) {
          <div class="py-16 text-center space-y-3">
            <span class="w-7 h-7 border-2 border-primary dark:border-sky-400 border-t-transparent rounded-full animate-spin inline-block"></span>
            <p class="text-xs uppercase tracking-wider text-slate-500">QUERYING CLIENT DATABASE...</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th class="px-5 py-3.5">CLIENT NAME</th>
                  <th class="px-5 py-3.5">EMAIL ADDRESS</th>
                  <th class="px-5 py-3.5">TELEPHONE</th>
                  <th class="px-5 py-3.5">ROLE PRIVILEGE</th>
                  <th class="px-5 py-3.5">MEMBERSHIP DATE</th>
                  <th class="px-5 py-3.5">STATUS</th>
                  <th class="px-5 py-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                @for (user of filteredUsers(); track user.id) {
                  <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 bg-primary text-white flex items-center justify-center font-bold text-[10px]">
                          {{ (user.fullName || user.email).slice(0, 1).toUpperCase() }}
                        </div>
                        <span class="font-bold uppercase text-slate-900 dark:text-white">
                          {{ user.fullName || 'Member' }}
                        </span>
                      </div>
                    </td>
                    <td class="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {{ user.email }}
                    </td>
                    <td class="px-5 py-3.5 font-mono text-slate-500">
                      {{ user.phone || '—' }}
                    </td>
                    <td class="px-5 py-3.5">
                      <span
                        class="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                        [class.bg-sky-100]="user.role?.code === 'ADMIN'"
                        [class.text-sky-800]="user.role?.code === 'ADMIN'"
                        [class.dark:bg-sky-950/80]="user.role?.code === 'ADMIN'"
                        [class.dark:text-sky-300]="user.role?.code === 'ADMIN'"
                        [class.bg-slate-100]="user.role?.code !== 'ADMIN'"
                        [class.text-slate-600]="user.role?.code !== 'ADMIN'"
                      >
                        {{ user.role?.code || 'CUSTOMER' }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {{ formatUserDate(user.createdAt) }}
                    </td>
                    <td class="px-5 py-3.5">
                      <span
                        class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        [class.bg-emerald-100]="user.status === 'ACTIVE'"
                        [class.text-emerald-800]="user.status === 'ACTIVE'"
                        [class.dark:bg-emerald-950/80]="user.status === 'ACTIVE'"
                        [class.dark:text-emerald-300]="user.status === 'ACTIVE'"
                        [class.bg-rose-100]="user.status !== 'ACTIVE'"
                        [class.text-rose-800]="user.status !== 'ACTIVE'"
                      >
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        (click)="requestStatusChange(user)"
                        [disabled]="updatingId() !== null || user.status === 'BLOCKED'"
                        class="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider border transition-colors cursor-pointer"
                        [class.border-rose-300]="user.status === 'ACTIVE'"
                        [class.text-rose-600]="user.status === 'ACTIVE'"
                        [class.hover:bg-rose-50]="user.status === 'ACTIVE'"
                        [class.border-emerald-300]="user.status !== 'ACTIVE'"
                        [class.text-emerald-600]="user.status !== 'ACTIVE'"
                        [class.hover:bg-emerald-50]="user.status !== 'ACTIVE'"
                      >
                        {{ updatingId() === user.id ? 'SAVING...' : user.status === 'BLOCKED' ? 'BLOCKED' : user.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE' }}
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-slate-400 uppercase tracking-wider text-xs">
                      No client accounts found matching search.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
        <span>Page {{ page() }} of {{ totalPages() }}</span>
        <div class="flex gap-2">
          <app-button size="sm" variant="outline" [disabled]="isLoading() || page() <= 1" (click)="changePage(-1)">Previous</app-button>
          <app-button size="sm" variant="outline" [disabled]="isLoading() || page() >= totalPages()" (click)="changePage(1)">Next</app-button>
        </div>
      </div>
      <app-dialog [open]="!!userToDeactivate()" (openChange)="!$event && userToDeactivate.set(null)" title="Deactivate customer" size="sm">
        <p>Deactivate {{ userToDeactivate()?.email }}? This customer will no longer be able to sign in.</p>
        <div dialog-footer class="flex gap-2">
          <app-button size="sm" variant="outline" (click)="userToDeactivate.set(null)">Cancel</app-button>
          <app-button size="sm" variant="danger" (click)="confirmDeactivate()">Deactivate</app-button>
        </div>
      </app-dialog>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersPageComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly users = signal<AdminUser[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  readonly updatingId = signal<string | null>(null);
  readonly userToDeactivate = signal<AdminUser | null>(null);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly statuses = ['ALL', 'INACTIVE', 'ACTIVE'] as const;
  readonly statusFilter = signal<string>('ALL');
  readonly filteredUsers = computed(() => this.users().filter((user) => this.statusFilter() === 'ALL' || user.status === this.statusFilter()));
  private usersRequest?: Subscription;

  searchQuery = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersRequest?.unsubscribe();
    this.isLoading.set(true);
    this.feedback.set(null);
    this.usersRequest = this.adminService.getUsers(this.page(), 20, this.searchQuery).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.users.set((res.items || []).filter((user) => user.role?.code === 'CUSTOMER'));
        this.totalPages.set(Math.max(1, res.meta.totalPages));
      },
      error: () => {
        this.isLoading.set(false);
        this.feedback.set({ type: 'error', message: 'Failed to retrieve users list.' });
      },
    });
  }

  onSearchChange(): void {
    this.page.set(1);
    this.loadUsers();
  }

  changePage(offset: number): void {
    this.page.update((page) => Math.max(1, Math.min(this.totalPages(), page + offset)));
    this.loadUsers();
  }

  requestStatusChange(user: AdminUser): void {
    if (user.status === 'BLOCKED' || this.updatingId()) return;
    if (user.status === 'ACTIVE') this.userToDeactivate.set(user);
    else this.toggleUserStatus(user);
  }

  confirmDeactivate(): void {
    const user = this.userToDeactivate();
    this.userToDeactivate.set(null);
    if (user) this.toggleUserStatus(user);
  }

  toggleUserStatus(user: AdminUser): void {
    this.updatingId.set(user.id);
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.adminService.updateUserStatus(user.id, nextStatus).subscribe({
      next: (updated) => {
        this.updatingId.set(null);
        this.users.update((list) => list.map((u) => (u.id === user.id ? { ...u, status: updated.status } : u)));
        this.feedback.set({ type: 'success', message: `Client "${user.email}" is now ${nextStatus}.` });
      },
      error: (err) => {
        this.updatingId.set(null);
        this.feedback.set({
          type: 'error',
          message: err.error?.message || 'Failed to update user status on server.',
        });
      },
    });
  }

  formatUserDate(iso?: string): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  }
}

