import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export const selectVariants = cva(
  'w-full bg-slate-50 dark:bg-slate-900 border text-slate-900 dark:text-white font-medium transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer appearance-none',
  {
    variants: {
      variant: {
        default:
          'border-slate-200 dark:border-slate-700 focus:border-primary dark:focus:border-sky-400',
        error:
          'border-rose-500 focus:border-rose-600 text-rose-900 dark:text-rose-100',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs pr-8',
        md: 'px-4 py-2.5 text-[13px] pr-9',
        lg: 'px-5 py-3.5 text-sm pr-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type SelectVariantProps = VariantProps<typeof selectVariants>;
export type SelectVariant = NonNullable<SelectVariantProps['variant']>;
export type SelectSize = NonNullable<SelectVariantProps['size']>;

@Component({
  selector: 'app-select',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div [class]="cn('flex flex-col gap-1.5 w-full', wrapperClass())">
      @if (label()) {
        <label
          [for]="id()"
          class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
        >
          {{ label() }}
        </label>
      }

      <div class="relative w-full">
        <select
          [id]="id()"
          [disabled]="isDisabled()"
          [value]="currentValue()"
          (change)="onSelectionChange($event)"
          (blur)="onBlur()"
          [class]="selectClass()"
        >
          @if (placeholder()) {
            <option value="" disabled [selected]="!currentValue()">
              {{ placeholder() }}
            </option>
          }
          @for (option of options(); track option.value) {
            <option [value]="option.value" [disabled]="option.disabled">
              {{ option.label }}
            </option>
          }
          <ng-content />
        </select>

        <span
          class="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
        >
          expand_more
        </span>
      </div>

      @if (error()) {
        <span class="text-[11px] font-medium text-rose-600 dark:text-rose-400">
          {{ error() }}
        </span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSelectComponent implements ControlValueAccessor {
  readonly id = input<string>(`select-${Math.random().toString(36).slice(2, 9)}`);
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly error = input<string>('');
  readonly value = input<string | number>('');
  readonly size = input<SelectSize>('md');
  readonly options = input<SelectOption[]>([]);
  readonly class = input<string>('');
  readonly wrapperClass = input<string>('');

  readonly valueChange = output<string>();

  protected readonly innerValue = signal<string | number | null>(null);
  protected readonly isFormDisabled = signal<boolean>(false);

  protected readonly currentValue = computed(() => {
    const val = this.innerValue();
    return val !== null ? val : (this.value() ?? '');
  });

  protected readonly isDisabled = computed(() => {
    return this.disabled() || this.isFormDisabled();
  });

  protected readonly selectClass = computed(() => {
    const variant: SelectVariant = this.error() ? 'error' : 'default';
    return cn(selectVariants({ variant, size: this.size() }), this.class());
  });

  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: unknown): void {
    this.innerValue.set(val != null ? (val as string | number) : '');
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isFormDisabled.set(isDisabled);
  }

  protected onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const val = target.value;
    this.innerValue.set(val);
    this.onChange(val);
    this.valueChange.emit(val);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected readonly cn = cn;
}
