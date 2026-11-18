import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen flex bg-slate-100 dark:bg-dark-bg text-slate-900 dark:text-slate-100 font-sans selection:bg-primary selection:text-white dark:selection:bg-blue-600 dark:selection:text-white">
      <!-- Mobile Sidebar Backdrop -->
      @if (isMobileMenuOpen()) {
        <button
          type="button"
          aria-label="Close Mobile Sidebar Menu"
          class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden w-full h-full border-none cursor-default"
          (click)="isMobileMenuOpen.set(false)"
        ></button>
      }

      <!-- 1. Left Sidebar Navigation -->
      <aside
        class="fixed top-0 bottom-0 left-0 z-50 w-64 bg-primary text-white flex flex-col border-r border-navy-border transition-transform duration-300 ease-in-out lg:translate-x-0"
        [class.-translate-x-full]="!isMobileMenuOpen()"
        [class.translate-x-0]="isMobileMenuOpen()"
      >
        <!-- Sidebar Brand Header -->
        <div class="h-18 sm:h-20 px-6 flex items-center justify-between border-b border-navy-border">
          <a routerLink="/admin" class="flex items-center gap-2.5">
            <span class="font-display font-bold text-xl sm:text-2xl tracking-tight uppercase text-white">
              WEAREZ
            </span>
            <span class="px-1.5 py-0.5 bg-sky-500/20 text-sky-300 text-[9px] font-bold tracking-widest uppercase border border-sky-400/30">
              CONSOLE
            </span>
          </a>
          <!-- Close button on mobile -->
          <button
            type="button"
            (click)="isMobileMenuOpen.set(false)"
            class="p-1 text-slate-400 hover:text-white lg:hidden cursor-pointer"
            aria-label="Close Sidebar"
          >
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Navigation Menu -->
        <div class="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div class="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            SYSTEM ARCHITECTURE
          </div>

          <a
            routerLink="/admin/dashboard"
            routerLinkActive="bg-white/10 text-white font-bold border-l-2 border-sky-400"
            (click)="isMobileMenuOpen.set(false)"
            class="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined text-lg">dashboard</span>
            <span>DASHBOARD</span>
          </a>

          <a
            routerLink="/admin/products"
            routerLinkActive="bg-white/10 text-white font-bold border-l-2 border-sky-400"
            (click)="isMobileMenuOpen.set(false)"
            class="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined text-lg">inventory_2</span>
            <span>PRODUCTS & DROPS</span>
          </a>

          <a
            routerLink="/admin/orders"
            routerLinkActive="bg-white/10 text-white font-bold border-l-2 border-sky-400"
            (click)="isMobileMenuOpen.set(false)"
            class="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined text-lg">receipt_long</span>
            <span>CUSTOMER ORDERS</span>
          </a>

          <a
            routerLink="/admin/users"
            routerLinkActive="bg-white/10 text-white font-bold border-l-2 border-sky-400"
            (click)="isMobileMenuOpen.set(false)"
            class="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined text-lg">group</span>
            <span>CLIENT VAULT</span>
          </a>

          <div class="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            DISPATCH OPERATIONS
          </div>

          <a
            routerLink="/"
            class="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined text-lg">storefront</span>
            <span>CLIENT STOREFRONT</span>
          </a>
        </div>

        <!-- Sidebar Footer: Logged in Administrator Card -->
        <div class="p-4 border-t border-navy-border bg-navy-950">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 bg-sky-500/20 text-sky-300 border border-sky-400/40 flex items-center justify-center font-bold text-xs shrink-0">
                {{ getAdminInitials() }}
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-xs font-bold text-white truncate uppercase">
                  {{ auth.currentUser()?.fullName || auth.currentUser()?.name || 'ADMINISTRATOR' }}
                </span>
                <span class="block text-[10px] text-sky-300 uppercase tracking-wider truncate">
                  {{ auth.roleCode() || 'ADMIN' }}
                </span>
              </div>
            </div>
            <button
              type="button"
              (click)="onLogout()"
              class="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Sign Out of Console"
            >
              <span class="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- 2. Main Content Wrapper (Shifted right by 64 cols on lg screens) -->
      <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
        <!-- Top Management Bar -->
        <header class="sticky top-0 z-30 h-18 sm:h-20 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <!-- Mobile Hamburger Toggle -->
            <button
              type="button"
              (click)="isMobileMenuOpen.set(!isMobileMenuOpen())"
              class="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
              aria-label="Open Sidebar"
            >
              <span class="material-symbols-outlined text-2xl">menu</span>
            </button>

            <!-- Console Header / Title -->
            <div>
              <div class="flex items-center gap-2 text-xs uppercase text-slate-400">
                <span>MAISON VAULT</span>
                <span>/</span>
                <span class="font-bold text-primary dark:text-sky-300">ADMIN CONSOLE</span>
              </div>
              <h1 class="text-sm sm:text-base font-bold uppercase tracking-tight text-slate-900 dark:text-white">
                CONTROL & DISPATCH WORKSPACE
              </h1>
            </div>
          </div>

          <!-- Topbar Actions -->
          <div class="flex items-center gap-3 sm:gap-4">
            <!-- Storefront Shortcut Button -->
            <a
              routerLink="/"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider font-bold transition-colors"
            >
              <span class="material-symbols-outlined text-sm">open_in_new</span>
              <span>LIVE STORE</span>
            </a>

            <!-- Dark / Light Theme Toggle -->
            <button
              type="button"
              (click)="theme.toggle()"
              class="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              [attr.aria-label]="theme.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
              <span class="material-symbols-outlined text-lg block">
                {{ theme.isDark() ? 'light_mode' : 'dark_mode' }}
              </span>
            </button>

            <!-- Status Indicator -->
            <div class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>API SYNCHRONIZED</span>
            </div>
          </div>
        </header>

        <!-- 3. Primary Admin Viewport (Router Outlet) -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent implements OnInit {
  public readonly auth = inject(AuthService);
  public readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  readonly isMobileMenuOpen = signal<boolean>(false);

  ngOnInit(): void {
    if (!this.auth.isAdmin()) {
      void this.router.navigate(['/']);
    }
  }

  getAdminInitials(): string {
    const user = this.auth.currentUser();
    const name = user?.fullName || user?.name || user?.username || 'AD';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  onLogout(): void {
    this.auth.logout();
  }
}
