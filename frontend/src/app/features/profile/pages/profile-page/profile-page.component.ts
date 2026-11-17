import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AppBadgeComponent, AppButtonComponent, AppCardComponent, AppSpinnerComponent } from '@shared/ui';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [RouterLink, AppCardComponent, AppButtonComponent, AppBadgeComponent, AppSpinnerComponent],
  template: `
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p class="text-[11px] uppercase tracking-[0.2em] text-primary dark:text-sky-300 font-bold">MY ACCOUNT</p>
          <h1 class="font-display text-3xl uppercase text-slate-950 dark:text-white mt-2">Profile</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Your account information</p>
        </div>
        @if (auth.isAdmin()) {
          <a routerLink="/admin/customers">
            <app-button variant="primary" size="md">
              <span class="material-symbols-outlined text-lg mr-1">admin_panel_settings</span>
              <span>Open Admin</span>
            </app-button>
          </a>
        }
      </div>

      @if (isLoading()) {
        <div class="py-12 flex justify-center items-center">
          <app-spinner size="lg" />
        </div>
      }

      @if (loadError()) {
        <div role="alert" class="p-3 border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
          Could not refresh your account information. Showing your last saved details.
        </div>
      }

      <app-card padding="lg" class="space-y-6">
        <div class="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div class="w-14 h-14 flex items-center justify-center bg-primary text-white font-display text-xl font-bold">
            {{ (auth.currentUser()?.email || 'U').slice(0, 1).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="text-xs text-slate-500 dark:text-slate-400">Email address</p>
            <p class="font-semibold text-slate-950 dark:text-white break-all">{{ auth.currentUser()?.email || '—' }}</p>
          </div>
        </div>

        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">Account ID</dt>
            <dd class="font-medium text-slate-950 dark:text-white mt-1">#{{ auth.currentUser()?.id || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">Account type</dt>
            <dd class="mt-1">
              <app-badge [variant]="auth.roleCode() === 'ADMIN' ? 'navy' : 'secondary'">
                {{ auth.roleCode() === 'ADMIN' ? 'Administrator' : auth.roleCode() === 'CUSTOMER' ? 'Customer' : '—' }}
              </app-badge>
            </dd>
          </div>
          @if (auth.currentUser()?.createdAt) {
            <div>
              <dt class="text-xs text-slate-500 dark:text-slate-400">Member since</dt>
              <dd class="font-medium text-slate-950 dark:text-white mt-1">{{ auth.currentUser()?.createdAt?.slice(0, 10) }}</dd>
            </div>
          }
        </dl>

        <div class="pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4">
          <a routerLink="/">
            <app-button variant="ghost" size="sm">Back to Home</app-button>
          </a>
          <app-button variant="danger" size="sm" (click)="auth.logout()">
            Sign Out
          </app-button>
        </div>
      </app-card>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly isLoading = signal(false);
  readonly loadError = signal(false);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.auth.getProfile().subscribe({
      next: () => {
        this.isLoading.set(false);
        this.loadError.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set(true);
      },
    });
  }
}
