import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white hover:bg-primary-hover active:bg-navy-950 shadow-md shadow-primary/20 border border-primary focus-visible:ring-primary',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 focus-visible:ring-slate-500',
        outline:
          'border border-primary text-primary hover:bg-primary-light dark:text-sky-300 dark:border-sky-400 dark:hover:bg-dark-surface focus-visible:ring-primary',
        ghost:
          'bg-transparent text-slate-700 hover:text-primary hover:bg-slate-100 dark:text-slate-300 dark:hover:text-sky-300 dark:hover:bg-dark-surface focus-visible:ring-primary',
        danger:
          'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-md shadow-rose-600/20 focus-visible:ring-rose-600',
      },
      size: {
        sm: 'px-3 py-1.5 text-[11px] gap-1.5',
        md: 'px-5 py-2.5 text-xs gap-2',
        lg: 'px-7 py-3.5 text-xs sm:text-[13px] tracking-[0.16em] gap-2.5',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonVariantProps['variant']>;
export type ButtonSize = NonNullable<ButtonVariantProps['size']>;

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button [type]="type()" [disabled]="disabled()" [attr.aria-label]="ariaLabel()" [class]="buttonClass()">
      <ng-content />
    </button>
  `,
  host: {
    '[class.w-full]': 'fullWidth()',
    '[class.block]': 'fullWidth()',
    '[class.pointer-events-none]': 'disabled()',
  },
  styles: [
    `
      :host {
        display: inline-block;
        font-family: inherit;
      }
      :host([fullWidth='true']),
      :host.w-full {
        display: block;
        width: 100%;
      }
      button {
        font-family: inherit;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly class = input<string>('');

  protected readonly buttonClass = computed(() =>
    cn(
      buttonVariants({ variant: this.variant(), size: this.size() }),
      this.fullWidth() && 'w-full',
      this.class()
    )
  );
}
