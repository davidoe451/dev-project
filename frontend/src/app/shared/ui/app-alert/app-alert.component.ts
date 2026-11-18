import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const alertVariants = cva(
  'p-3.5 border text-xs sm:text-sm flex items-start gap-2.5 transition-colors',
  {
    variants: {
      variant: {
        info: 'bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-200',
        success:
          'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
        warning:
          'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
        destructive:
          'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

export type AlertVariantProps = VariantProps<typeof alertVariants>;
export type AlertVariant = NonNullable<AlertVariantProps['variant']>;

@Component({
  selector: 'app-alert',
  standalone: true,
  templateUrl: './app-alert.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAlertComponent {
  readonly variant = input<AlertVariant>('info');
  readonly title = input<string>('');
  readonly icon = input<string>('');
  readonly class = input<string>('');
  readonly dismissible = input<boolean>(false);
  readonly dismiss = output<void>();

  protected readonly alertClass = computed(() =>
    cn(alertVariants({ variant: this.variant() }), this.class()),
  );

  protected readonly resolvedIcon = computed(() => {
    if (this.icon()) return this.icon();
    switch (this.variant()) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'destructive':
        return 'error';
      default:
        return 'info';
    }
  });
}
