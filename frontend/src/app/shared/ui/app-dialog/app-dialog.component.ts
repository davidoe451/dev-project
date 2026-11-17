import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  output,
} from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const dialogVariants = cva(
  'relative w-full bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 shadow-2xl p-6 transition-all duration-200 z-50',
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export type DialogVariantProps = VariantProps<typeof dialogVariants>;
export type DialogSize = NonNullable<DialogVariantProps['size']>;

@Component({
  selector: 'app-dialog',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop Overlay -->
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in"
          (click)="closeOnBackdrop() && close()"
          aria-hidden="true"
        ></div>

        <!-- Dialog Modal Box -->
        <div
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="title() ? id + '-title' : null"
          [class]="dialogClass()"
        >
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              @if (title()) {
                <h2
                  [id]="id + '-title'"
                  class="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white"
                >
                  {{ title() }}
                </h2>
              }
              @if (description()) {
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-light leading-relaxed">
                  {{ description() }}
                </p>
              }
            </div>

            @if (showCloseButton()) {
              <button
                type="button"
                (click)="close()"
                class="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <span class="material-symbols-outlined text-lg">close</span>
              </button>
            }
          </div>

          <!-- Content Body -->
          <div class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <ng-content />
          </div>

          <!-- Footer Actions -->
          <div class="mt-6 flex items-center justify-end gap-3 empty:hidden">
            <ng-content select="[dialog-footer]" />
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDialogComponent {
  readonly id = `dialog-${Math.random().toString(36).slice(2, 9)}`;
  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly size = input<DialogSize>('md');
  readonly closeOnBackdrop = input<boolean>(true);
  readonly showCloseButton = input<boolean>(true);
  readonly class = input<string>('');

  readonly openChange = output<boolean>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  close(): void {
    this.openChange.emit(false);
  }

  protected readonly dialogClass = computed(() =>
    cn(dialogVariants({ size: this.size() }), this.class())
  );
}

