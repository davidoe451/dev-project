import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppBadgeComponent, AppButtonComponent } from '@shared/ui';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, AppButtonComponent, AppBadgeComponent],
  template: `
    <div class="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
      <app-badge variant="default" size="md">ERROR 404 • ARCHIVE NOT FOUND</app-badge>
      <h1 class="font-display text-8xl sm:text-9xl font-bold text-primary dark:text-white mt-4">404</h1>
      <h2 class="font-display text-2xl sm:text-3xl font-bold uppercase text-slate-950 dark:text-white mt-2">
        ARCHIVE PROTOCOL DISCONNECTED
      </h2>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md font-light leading-relaxed">
        The archive specimen you are querying does not exist or has been relocated within the WEAREZ vault.
      </p>
      <div class="mt-8">
        <a routerLink="/">
          <app-button variant="primary" size="lg">RETURN TO VAULT HOME</app-button>
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPageComponent {}
