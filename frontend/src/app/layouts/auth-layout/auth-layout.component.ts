import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { AppCardComponent } from '@shared/ui';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AppCardComponent],
  template: `
    <div
      class="min-h-screen relative flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white transition-colors selection:bg-primary selection:text-white"
    >
      <!-- Top Utility Header -->
      <header
        class="w-full px-6 py-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-dark-bg/70 backdrop-blur-md z-20"
      >
        <a routerLink="/" class="flex items-center gap-2 group">
          <span
            class="font-display font-semibold text-2xl uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-primary transition-colors"
          >
            WEAREZ
          </span>
          <span class="w-1.5 h-1.5 bg-primary dark:bg-sky-400 rounded-none inline-block"></span>
        </a>

        <div class="flex items-center gap-3">
          <!-- Theme toggle -->
          <button
            type="button"
            (click)="theme.toggle()"
            class="p-1.5 text-slate-500 hover:text-primary dark:hover:text-white transition-colors cursor-pointer"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            @if (theme.isDark()) {
              <span class="material-symbols-outlined text-lg text-amber-400">light_mode</span>
            } @else {
              <span class="material-symbols-outlined text-lg text-primary">dark_mode</span>
            }
          </button>
        </div>
      </header>

      <!-- Main Center Form Container -->
      <main class="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <app-card variant="elevated" padding="lg" class="w-full max-w-md">
          <router-outlet />
        </app-card>
      </main>

      <!-- Bottom Minimalist Legal Bar -->
      <footer
        class="w-full px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 text-center text-[10px] uppercase tracking-widest text-slate-400 bg-white/50 dark:bg-dark-bg/50"
      >
        © 2026 WEAREZ Global Luxury Maison. All Rights Reserved. • 256-BIT ENCRYPTED MAISON VAULT
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        font-family: inherit;
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  public readonly theme = inject(ThemeService);
}
