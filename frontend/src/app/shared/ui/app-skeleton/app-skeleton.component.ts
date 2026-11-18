import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const skeletonVariants = cva('animate-pulse bg-slate-200 dark:bg-slate-800', {
  variants: {
    variant: {
      default: 'rounded-none',
      rounded: 'rounded-md',
      circle: 'rounded-full',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type SkeletonVariantProps = VariantProps<typeof skeletonVariants>;
export type SkeletonVariant = NonNullable<SkeletonVariantProps['variant']>;

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `<div [class]="skeletonClass()" aria-hidden="true"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSkeletonComponent {
  readonly variant = input<SkeletonVariant>('default');
  readonly class = input<string>('h-4 w-full');

  protected readonly skeletonClass = computed(() =>
    cn(skeletonVariants({ variant: this.variant() }), this.class()),
  );
}
