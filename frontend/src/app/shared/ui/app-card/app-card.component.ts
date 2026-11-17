import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const cardVariants = cva(
  'border transition-all duration-200 text-slate-900 dark:text-slate-100 font-sans',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-dark-surface border-slate-200 dark:border-slate-800 shadow-xs',
        elevated: 'bg-white dark:bg-dark-surface border-slate-200 dark:border-slate-800 shadow-lg',
        outline: 'bg-transparent border-slate-200 dark:border-slate-800',
        interactive:
          'bg-white dark:bg-dark-surface border-slate-200 dark:border-slate-800 shadow-xs hover:border-primary/40 hover:shadow-md cursor-pointer',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export type CardVariantProps = VariantProps<typeof cardVariants>;
export type CardVariant = NonNullable<CardVariantProps['variant']>;
export type CardPadding = NonNullable<CardVariantProps['padding']>;

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <article [class]="cardClass()">
      @if (title()) {
        <header class="mb-4">
          <h3 class="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {{ title() }}
          </h3>
          @if (subtitle()) {
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{ subtitle() }}
            </p>
          }
        </header>
      }
      <ng-content />
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppCardComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly variant = input<CardVariant>('default');
  readonly padding = input<CardPadding>('default');
  readonly class = input<string>('');

  protected readonly cardClass = computed(() =>
    cn(cardVariants({ variant: this.variant(), padding: this.padding() }), this.class())
  );
}
