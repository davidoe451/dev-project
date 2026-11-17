import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AppBadgeComponent, AppButtonComponent, AppCardComponent } from '@shared/ui';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, AppCardComponent, AppButtonComponent, AppBadgeComponent],
  template: `
    <div class="space-y-16 sm:space-y-24 pb-16">
      <!-- 1. Hero Showcase Section -->
      <section class="relative overflow-hidden pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Text Content -->
          <div class="lg:col-span-7 space-y-6">
            <app-badge variant="secondary" size="md" class="gap-2">
              <span class="w-1.5 h-1.5 bg-primary dark:bg-sky-400 rounded-none inline-block"></span>
              Sprint 1 • Foundation & Identity
            </app-badge>

            <h1 class="font-display text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-slate-950 dark:text-white leading-[1.05]">
              Redefining <span class="italic font-normal">the aesthetic</span> of contemporary luxury
            </h1>

            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-light max-w-xl leading-relaxed">
              A collision of brutalist silhouettes and refined tailoring for the next generation. Handcrafted tactile artifacts engineered between Tokyo urban kineticism and Parisian couture salons.
            </p>

            <!-- Call to Actions -->
            <div class="pt-2 flex flex-wrap items-center gap-4">
              @if (auth.isAuthenticated()) {
                <a routerLink="/profile">
                  <app-button size="lg">
                    <span>Go to Client Profile</span>
                    <span class="material-symbols-outlined text-base ml-1">arrow_forward</span>
                  </app-button>
                </a>
              } @else {
                <a routerLink="/auth/register">
                  <app-button size="lg">
                    <span>Join Membership</span>
                    <span class="material-symbols-outlined text-base ml-1">arrow_forward</span>
                  </app-button>
                </a>

                <a routerLink="/auth/login">
                  <app-button variant="outline" size="lg">
                    Sign In
                  </app-button>
                </a>
              }
            </div>
          </div>

          <!-- Hero Graphic Panel -->
          <div class="lg:col-span-5 relative">
            <div class="aspect-4/5 bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col justify-between p-8 text-white shadow-2xl">
              <div class="space-y-1">
                <span class="text-[10px] uppercase tracking-[0.3em] text-slate-400 block font-mono">ARCHIVE PROTOCOL</span>
                <span class="text-xl font-display uppercase tracking-wider font-bold">WEAREZ MAISON</span>
              </div>

              <div class="space-y-4">
                <div class="w-12 h-0.5 bg-white/40"></div>
                <p class="text-xs text-slate-300 font-light leading-relaxed">
                  Engineered with NestJS, Prisma ORM, and Angular 20 Standalone architecture. Built for high performance, strict validation, and seamless authentication.
                </p>
                <div class="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                  AUTHENTICATION PROTOCOL • V1.0.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Value Pillars Grid -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <app-card padding="default" class="space-y-3">
            <span class="material-symbols-outlined text-2xl text-primary dark:text-sky-300">security</span>
            <h3 class="font-display text-lg uppercase tracking-wider text-slate-950 dark:text-white font-bold">
              Secure Authentication
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
              256-bit encrypted JWT token sessions with route guards protecting sensitive member resources.
            </p>
          </app-card>

          <app-card padding="default" class="space-y-3">
            <span class="material-symbols-outlined text-2xl text-primary dark:text-sky-300">tune</span>
            <h3 class="font-display text-lg uppercase tracking-wider text-slate-950 dark:text-white font-bold">
              Strict Validation
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
              Real-time credential verification, multi-factor criteria inspection, and backend error resolution.
            </p>
          </app-card>

          <app-card padding="default" class="space-y-3">
            <span class="material-symbols-outlined text-2xl text-primary dark:text-sky-300">devices</span>
            <h3 class="font-display text-lg uppercase tracking-wider text-slate-950 dark:text-white font-bold">
              Responsive Foundation
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
              Fluid mobile-first layouts crafted with TailwindCSS, dark mode integration, and accessible components.
            </p>
          </app-card>
        </div>
      </section>
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
export class HomePageComponent {
  public readonly auth = inject(AuthService);
}
