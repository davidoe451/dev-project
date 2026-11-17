import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <span
      role="status"
      aria-label="Đang tải"
      class="inline-block animate-spin rounded-full border-2 border-slate-200 border-t-navy-900 dark:border-slate-800 dark:border-t-navy-300"
      [class.w-4]="size() === 'sm'"
      [class.h-4]="size() === 'sm'"
      [class.w-6]="size() === 'md'"
      [class.h-6]="size() === 'md'"
      [class.w-8]="size() === 'lg'"
      [class.h-8]="size() === 'lg'"
    ></span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        font-family: inherit;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
