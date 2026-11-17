import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { AppButtonComponent } from '@shared/ui';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppButtonComponent],
  template: `
    <div
      class="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white transition-colors selection:bg-primary selection:text-white"
    >
      <!-- Navigation Header -->
      <header
        class="sticky top-0 z-40 w-full bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          <!-- Left: Brand Logo -->
          <div class="flex items-center gap-8">
            <a routerLink="/" class="flex items-center gap-2 group">
              <span
                class="font-display font-semibold text-2xl sm:text-3xl uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-primary transition-colors"
              >
                WEAREZ
              </span>
              <span class="w-1.5 h-1.5 bg-primary dark:bg-sky-400 rounded-none inline-block"></span>
            </a>

            <!-- Desktop Nav Links -->
            <nav class="hidden md:flex items-center gap-6 text-xs uppercase tracking-[0.15em] font-medium">
              <a
                routerLink="/"
                routerLinkActive="text-primary dark:text-sky-300 font-bold border-b-2 border-primary dark:border-sky-300"
                [routerLinkActiveOptions]="{ exact: true }"
                class="py-1 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                Home
              </a>
              @if (auth.isAuthenticated()) {
                <a
                  routerLink="/profile"
                  routerLinkActive="text-primary dark:text-sky-300 font-bold border-b-2 border-primary dark:border-sky-300"
                  class="py-1 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  Client Profile
                </a>
              }
            </nav>
          </div>

          <!-- Right Action Console -->
          <div class="flex items-center gap-3">
            <!-- Theme Toggle -->
            <button
              type="button"
              (click)="theme.toggle()"
              class="p-2 text-slate-500 hover:text-primary dark:hover:text-white transition-colors cursor-pointer"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              @if (theme.isDark()) {
                <span class="material-symbols-outlined text-xl text-amber-400">light_mode</span>
              } @else {
                <span class="material-symbols-outlined text-xl text-primary">dark_mode</span>
              }
            </button>

            <!-- Authentication User State -->
            @if (auth.isAuthenticated()) {
              <div class="flex items-center gap-2">
                @if (auth.isAdmin()) {
                  <a routerLink="/admin/customers" class="hidden sm:inline-block">
                    <app-button variant="primary" size="sm">
                      <span class="material-symbols-outlined text-base mr-1">admin_panel_settings</span>
                      Admin
                    </app-button>
                  </a>
                }
                <a
                  routerLink="/profile"
                  class="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-white transition-all cursor-pointer bg-white dark:bg-slate-900"
                  title="View Profile"
                >
                  <span class="w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                    {{ (auth.currentUser()?.email || 'U').slice(0, 1).toUpperCase() }}
                  </span>
                  <span class="hidden sm:inline-block text-[11px] font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                    {{ auth.currentUser()?.email }}
                  </span>
                </a>

                <app-button
                  type="button"
                  variant="outline"
                  size="icon"
                  (click)="auth.logout()"
                  ariaLabel="Sign Out"
                >
                  <span class="material-symbols-outlined text-lg">logout</span>
                </app-button>
              </div>
            } @else {
              <div class="flex items-center gap-2">
                <a routerLink="/auth/login">
                  <app-button variant="ghost" size="sm">Sign In</app-button>
                </a>
                <a routerLink="/auth/register">
                  <app-button variant="primary" size="sm">Register</app-button>
                </a>
              </div>
            }

            <!-- Mobile Hamburger Toggle -->
            <button
              type="button"
              (click)="isMobileMenuOpen.set(!isMobileMenuOpen())"
              class="md:hidden p-2 text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <span class="material-symbols-outlined text-2xl">
                {{ isMobileMenuOpen() ? 'close' : 'menu' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Mobile Drawer Menu -->
        @if (isMobileMenuOpen()) {
          <div
            class="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-bg p-4 space-y-3"
          >
            <a
              routerLink="/"
              (click)="isMobileMenuOpen.set(false)"
              class="block py-2 text-xs uppercase tracking-widest font-bold text-slate-800 dark:text-slate-200"
            >
              Home
            </a>
            @if (auth.isAuthenticated()) {
              <a
                routerLink="/profile"
                (click)="isMobileMenuOpen.set(false)"
                class="block py-2 text-xs uppercase tracking-widest font-bold text-slate-800 dark:text-slate-200"
              >
                Client Profile
              </a>
              @if (auth.isAdmin()) {
                <a
                  routerLink="/admin/customers"
                  (click)="isMobileMenuOpen.set(false)"
                  class="block py-2 text-xs uppercase tracking-widest font-bold text-slate-800 dark:text-slate-200"
                >
                  Admin · Customer Accounts
                </a>
              }
              <div class="pt-2">
                <app-button
                  type="button"
                  variant="danger"
                  size="sm"
                  [fullWidth]="true"
                  (click)="isMobileMenuOpen.set(false); auth.logout()"
                >
                  Sign Out
                </app-button>
              </div>
            } @else {
              <div class="flex flex-col gap-2 pt-2">
                <a routerLink="/auth/login" (click)="isMobileMenuOpen.set(false)">
                  <app-button variant="outline" [fullWidth]="true" size="sm">
                    Sign In
                  </app-button>
                </a>
                <a routerLink="/auth/register" (click)="isMobileMenuOpen.set(false)">
                  <app-button variant="primary" [fullWidth]="true" size="sm">
                    Create Account
                  </app-button>
                </a>
              </div>
            }
          </div>
        }
      </header>

      <!-- 3. Dynamic Page View Outlet -->
      <main class="flex-1">
        <router-outlet />
      </main>

      <!-- 4. Luxury Minimalist Footer -->
      <footer class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-12 pb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="space-y-3 md:col-span-2">
              <span class="font-display font-semibold text-xl uppercase tracking-tight text-slate-950 dark:text-white">
                WEAREZ MAISON
              </span>
              <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Architectural silhouettes and contemporary luxury engineered for the avant-garde.
              </p>
            </div>

            <div class="space-y-2 text-xs">
              <span class="font-bold text-[11px] uppercase tracking-wider text-slate-950 dark:text-white block">
                Navigation
              </span>
              <ul class="space-y-1.5 text-slate-500 dark:text-slate-400">
                <li><a routerLink="/" class="hover:text-primary dark:hover:text-white">Home</a></li>
                @if (auth.isAuthenticated()) {
                  <li><a routerLink="/profile" class="hover:text-primary dark:hover:text-white">Profile</a></li>
                } @else {
                  <li><a routerLink="/auth/login" class="hover:text-primary dark:hover:text-white">Sign In</a></li>
                  <li><a routerLink="/auth/register" class="hover:text-primary dark:hover:text-white">Register</a></li>
                }
              </ul>
            </div>

            <div class="space-y-2 text-xs">
              <span class="font-bold text-[11px] uppercase tracking-wider text-slate-950 dark:text-white block">
                Security & Legal
              </span>
              <ul class="space-y-1.5 text-slate-500 dark:text-slate-400">
                <li><span>Privacy Policy</span></li>
              </ul>
            </div>
          </div>

          <div
            class="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400"
          >
            <span>© 2026 WEAREZ Global Luxury Maison. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  public readonly auth = inject(AuthService);
  public readonly theme = inject(ThemeService);
  readonly isMobileMenuOpen = signal<boolean>(false);
}
