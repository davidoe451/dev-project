import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center font-bold uppercase tracking-widest transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white border border-transparent',
        secondary: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-transparent',
        outline: 'border border-primary text-primary dark:text-sky-300 dark:border-sky-400',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        destructive: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        navy: 'bg-primary text-white dark:bg-sky-950 dark:text-sky-200 border border-navy-border dark:border-sky-800/40',
      },
      size: {
        sm: 'px-2 py-0.5 text-[9px]',
        md: 'px-2.5 py-1 text-[10px]',
        lg: 'px-3 py-1.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
export type BadgeVariant = NonNullable<BadgeVariantProps['variant']>;
export type BadgeSize = NonNullable<BadgeVariantProps['size']>;

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span [class]="badgeClass()">
      <ng-content />
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBadgeComponent {
  readonly variant = input<BadgeVariant>('default');
  readonly size = input<BadgeSize>('md');
  readonly class = input<string>('');

  protected readonly badgeClass = computed(() =>
    cn(badgeVariants({ variant: this.variant(), size: this.size() }), this.class())
  );
}

