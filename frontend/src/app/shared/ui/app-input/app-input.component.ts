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

export const inputVariants = cva(
  'w-full bg-slate-50 dark:bg-slate-900 border text-slate-900 dark:text-white placeholder:text-slate-400 font-medium transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'border-slate-200 dark:border-slate-700 focus:border-primary dark:focus:border-sky-400',
        error:
          'border-rose-500 focus:border-rose-600 text-rose-900 dark:text-rose-100 placeholder:text-rose-300',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-[13px]',
        lg: 'px-5 py-3.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type InputVariantProps = VariantProps<typeof inputVariants>;
export type InputVariant = NonNullable<InputVariantProps['variant']>;
export type InputSize = NonNullable<InputVariantProps['size']>;

@Component({
  selector: 'app-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppInputComponent),
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
          @if (required()) {
            <span class="text-rose-500 ml-0.5">*</span>
          }
        </label>
      }
      <div class="relative w-full flex items-center">
        <input
          [id]="id()"
          [name]="name() || id()"
          [type]="type()"
          [placeholder]="placeholder()"
          [autocomplete]="autocomplete()"
          [disabled]="isDisabled()"
          [value]="currentValue()"
          (input)="onInputChange($event)"
          (blur)="onBlur()"
          [class]="inputClass()"
        />
        <div class="absolute right-2 flex items-center empty:hidden">
          <ng-content select="[suffix]" />
        </div>
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
export class AppInputComponent implements ControlValueAccessor {
  readonly id = input<string>(`input-${Math.random().toString(36).slice(2, 9)}`);
  readonly name = input<string>('');
  readonly label = input<string>('');
  readonly required = input<boolean>(false);
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly autocomplete = input<string>('off');
  readonly disabled = input<boolean>(false);
  readonly error = input<string>('');
  readonly value = input<string>('');
  readonly size = input<InputSize>('md');
  readonly class = input<string>('');
  readonly wrapperClass = input<string>('');
  readonly hasSuffix = input<boolean>(false);

  readonly valueChange = output<string>();

  protected readonly innerValue = signal<string | null>(null);
  protected readonly isFormDisabled = signal<boolean>(false);

  protected readonly currentValue = computed(() => {
    const val = this.innerValue();
    return val !== null ? val : (this.value() ?? '');
  });

  protected readonly isDisabled = computed(() => {
    return this.disabled() || this.isFormDisabled();
  });

  protected readonly inputClass = computed(() => {
    const variant: InputVariant = this.error() ? 'error' : 'default';
    return cn(
      inputVariants({ variant, size: this.size() }),
      this.hasSuffix() ? 'pr-10' : '',
      this.class()
    );
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: unknown): void {
    this.innerValue.set(val != null ? String(val) : '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isFormDisabled.set(isDisabled);
  }

  protected onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newVal = target.value;
    this.innerValue.set(newVal);
    this.onChange(newVal);
    this.valueChange.emit(newVal);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected readonly cn = cn;
}
