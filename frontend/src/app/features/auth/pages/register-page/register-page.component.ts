import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import {
  AppBadgeComponent,
  AppButtonComponent,
  AppInputComponent,
  AppSpinnerComponent,
  BadgeVariant,
} from '@shared/ui';

const passwordsMatchValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    AppButtonComponent,
    AppInputComponent,
    AppBadgeComponent,
    AppSpinnerComponent,
  ],
  template: `
    <div class="space-y-6">
      @if (isSuccess()) {
        <!-- Success State Card -->
        <div class="space-y-6 text-center py-4">
          <div
            class="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-sm"
          >
            <span class="material-symbols-outlined text-3xl text-primary dark:text-sky-300">
              check_circle
            </span>
          </div>

          <div class="space-y-2">
            <span
              class="text-[10px] uppercase tracking-[0.25em] text-primary dark:text-sky-300 font-bold block"
            >
              REGISTRATION SUCCESSFUL
            </span>
            <h2 class="font-display text-2xl uppercase tracking-tight text-slate-950 dark:text-white">
              Welcome to WEAREZ
            </h2>
            <p class="text-xs text-slate-600 dark:text-slate-300">
              Your account for
              <strong class="font-bold text-slate-950 dark:text-white">
                {{ registeredEmail() }}
              </strong>
              has been created.
            </p>
            @if (!registeredIsActive()) {
              <p class="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3">
                Your account is awaiting activation by an administrator. You can sign in once it is active. Email verification is not available yet.
              </p>
            }
          </div>

          <div class="pt-2 flex flex-col gap-2.5">
            @if (registeredIsActive()) {
              <a routerLink="/auth/login">
                <app-button [fullWidth]="true" size="lg">
                  <span>Proceed to Sign In</span>
                  <span class="material-symbols-outlined text-base ml-1">arrow_forward</span>
                </app-button>
              </a>
            }
            <a routerLink="/">
              <app-button variant="secondary" [fullWidth]="true">
                Return Home
              </app-button>
            </a>
          </div>
        </div>
      } @else {
        <!-- Header -->
        <div class="space-y-1">
          <span class="text-[10px] uppercase tracking-[0.25em] text-primary dark:text-sky-300 font-bold block">
            MEMBERSHIP REGISTRATION
          </span>
          <h2 class="font-display text-2xl sm:text-3xl uppercase tracking-tight text-slate-950 dark:text-white">
            Create Account
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-light">
            Join WEAREZ for exclusive runway and client access
          </p>
        </div>

        <!-- Error Alert Banner -->
        @if (errorMessage()) {
          <div
            class="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5"
          >
            <span class="material-symbols-outlined text-base text-rose-600 dark:text-rose-400 mt-0.5">error</span>
            <div class="flex-1 font-medium leading-relaxed">
              {{ errorMessage() }}
            </div>
          </div>
        }

        <!-- Registration Form -->
        <form class="space-y-4 pt-1" [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Email Field -->
          <app-input
            id="registerEmail"
            type="email"
            label="Email Address"
            [required]="true"
            formControlName="email"
            placeholder="e.g. client@example.com"
            autocomplete="email"
            [error]="emailError()"
          />

          <!-- Password Field with Show/Hide Toggle & Live Criteria -->
          <div class="space-y-2 pt-1">
            <div class="flex items-center justify-between">
              <label
                for="registerPassword"
                class="text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300"
              >
                Password <span class="text-rose-500">*</span>
              </label>
              @if (password().length > 0) {
                <app-badge [variant]="strengthBadgeVariant()" size="sm">
                  {{ passwordStrengthLabel() }}
                </app-badge>
              }
            </div>

            <app-input
              id="registerPassword"
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              placeholder="Create a secure password"
              autocomplete="new-password"
              [hasSuffix]="true"
              [error]="passwordError()"
            >
              <app-button
                suffix
                type="button"
                variant="ghost"
                size="icon"
                (click)="showPassword.set(!showPassword())"
                [class]="'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1'"
                [ariaLabel]="showPassword() ? 'Hide password' : 'Show password'"
              >
                <span class="material-symbols-outlined text-base">
                  {{ showPassword() ? 'visibility_off' : 'visibility' }}
                </span>
              </app-button>
            </app-input>

            <!-- Password Strength Bar (4 segments) -->
            <div class="grid grid-cols-4 gap-1.5 h-1.5 w-full pt-0.5">
              <div
                class="h-full rounded-none transition-all duration-300"
                [class]="criteriaMetCount() >= 1 ? passwordStrengthColor() : 'bg-slate-200 dark:bg-slate-800'"
              ></div>
              <div
                class="h-full rounded-none transition-all duration-300"
                [class]="criteriaMetCount() >= 2 ? passwordStrengthColor() : 'bg-slate-200 dark:bg-slate-800'"
              ></div>
              <div
                class="h-full rounded-none transition-all duration-300"
                [class]="criteriaMetCount() >= 3 ? passwordStrengthColor() : 'bg-slate-200 dark:bg-slate-800'"
              ></div>
              <div
                class="h-full rounded-none transition-all duration-300"
                [class]="criteriaMetCount() >= 4 ? passwordStrengthColor() : 'bg-slate-200 dark:bg-slate-800'"
              ></div>
            </div>

            <!-- Criteria Checklist: subtle small bullet dots -->
            <ul class="space-y-1.5 pt-1.5 text-[11px] list-none p-0 m-0">
              <li
                class="flex items-center gap-2 transition-colors duration-200 select-none"
                [class]="hasMinLength()
                  ? 'text-primary dark:text-sky-300 font-medium'
                  : 'text-slate-400 dark:text-slate-500'"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200"
                  [class]="hasMinLength() ? 'bg-primary dark:bg-sky-400' : 'bg-slate-300 dark:bg-slate-600'"
                ></span>
                <span>At least 6 characters</span>
              </li>

              <li
                class="flex items-center gap-2 transition-colors duration-200 select-none"
                [class]="hasLetters()
                  ? 'text-primary dark:text-sky-300 font-medium'
                  : 'text-slate-400 dark:text-slate-500'"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200"
                  [class]="hasLetters() ? 'bg-primary dark:bg-sky-400' : 'bg-slate-300 dark:bg-slate-600'"
                ></span>
                <span>Letters (a-z, A-Z)</span>
              </li>

              <li
                class="flex items-center gap-2 transition-colors duration-200 select-none"
                [class]="hasNumbers()
                  ? 'text-primary dark:text-sky-300 font-medium'
                  : 'text-slate-400 dark:text-slate-500'"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200"
                  [class]="hasNumbers() ? 'bg-primary dark:bg-sky-400' : 'bg-slate-300 dark:bg-slate-600'"
                ></span>
                <span>Numbers (0-9)</span>
              </li>

              <li
                class="flex items-center gap-2 transition-colors duration-200 select-none"
                [class]="hasSpecialChars()
                  ? 'text-primary dark:text-sky-300 font-medium'
                  : 'text-slate-400 dark:text-slate-500'"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200"
                  [class]="hasSpecialChars() ? 'bg-primary dark:bg-sky-400' : 'bg-slate-300 dark:bg-slate-600'"
                ></span>
                <span>Special character (!&#64;#...)</span>
              </li>
            </ul>
          </div>

          <!-- Confirm Password Field with Show/Hide Toggle -->
          <app-input
            id="registerConfirmPassword"
            [type]="showConfirmPassword() ? 'text' : 'password'"
            label="Confirm Password"
            [required]="true"
            formControlName="confirmPassword"
            placeholder="Re-enter your password"
            autocomplete="new-password"
            [hasSuffix]="true"
            [error]="confirmPasswordError()"
          >
            <app-button
              suffix
              type="button"
              variant="ghost"
              size="icon"
              (click)="showConfirmPassword.set(!showConfirmPassword())"
              [class]="'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1'"
              [ariaLabel]="showConfirmPassword() ? 'Hide password' : 'Show password'"
            >
              <span class="material-symbols-outlined text-base">
                {{ showConfirmPassword() ? 'visibility_off' : 'visibility' }}
              </span>
            </app-button>
          </app-input>

          <!-- Submit Button -->
          <div class="pt-3">
            <app-button
              type="submit"
              size="lg"
              [fullWidth]="true"
              [disabled]="isLoading()"
              [class]="'shadow-md shadow-primary/20'"
            >
              @if (isLoading()) {
                <app-spinner size="sm" class="mr-2" />
                <span>CREATING ACCOUNT...</span>
              } @else {
                <span>Create Account</span>
                <span class="material-symbols-outlined text-base ml-1">arrow_forward</span>
              }
            </app-button>
          </div>
        </form>

        <!-- Switch to Login -->
        <div
          class="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400"
        >
          Already have an account?
          <a
            routerLink="/auth/login"
            class="font-bold text-primary dark:text-sky-300 hover:underline ml-1 uppercase tracking-wider"
          >
            Sign in here
          </a>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group(
    {
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/[a-zA-Z]/),
          Validators.pattern(/[0-9]/),
          Validators.pattern(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  readonly email = signal<string>('');
  readonly password = signal<string>('');
  readonly confirmPassword = signal<string>('');
  readonly formSubmitted = signal<boolean>(false);

  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isSuccess = signal<boolean>(false);
  readonly registeredEmail = signal<string>('');
  readonly registeredIsActive = signal<boolean>(false);

  constructor() {
    this.form.controls.email.valueChanges.subscribe((value) => this.email.set(value));
    this.form.controls.password.valueChanges.subscribe((value) => this.password.set(value));
    this.form.controls.confirmPassword.valueChanges.subscribe((value) => this.confirmPassword.set(value));
  }

  readonly emailTrimmed = computed(() => this.email().trim());
  readonly emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  readonly isEmailValid = computed(() => this.emailRegex.test(this.emailTrimmed()));

  readonly emailError = computed(() => {
    if (!this.formSubmitted() && !this.form.controls.email.touched) return '';
    if (!this.emailTrimmed()) return 'Email address is required.';
    if (!this.isEmailValid()) return 'Invalid email format (e.g. client@example.com).';
    return '';
  });

  readonly hasMinLength = computed(() => this.password().length >= 6);
  readonly hasLetters = computed(() => /[a-zA-Z]/.test(this.password()));
  readonly hasNumbers = computed(() => /[0-9]/.test(this.password()));
  readonly hasSpecialChars = computed(() =>
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(this.password()),
  );

  readonly criteriaMetCount = computed(() => {
    let count = 0;
    if (this.hasMinLength()) count++;
    if (this.hasLetters()) count++;
    if (this.hasNumbers()) count++;
    if (this.hasSpecialChars()) count++;
    return count;
  });

  readonly isPasswordValid = computed(() => this.criteriaMetCount() === 4);

  readonly passwordError = computed(() => {
    if (!this.formSubmitted() && !this.form.controls.password.touched) return '';
    if (!this.password()) return 'Password is required.';
    if (!this.isPasswordValid()) return 'Password must fulfill all 4 security criteria.';
    return '';
  });

  readonly passwordStrengthLabel = computed(() => {
    const count = this.criteriaMetCount();
    if (this.password().length === 0) return '';
    if (count <= 1) return 'Weak';
    if (count === 2) return 'Fair';
    if (count === 3) return 'Good';
    return 'Strong';
  });

  readonly strengthBadgeVariant = computed<BadgeVariant>(() => {
    const count = this.criteriaMetCount();
    if (count <= 1) return 'destructive';
    if (count === 2) return 'warning';
    if (count === 3) return 'secondary';
    return 'success';
  });

  readonly passwordStrengthColor = computed(() => {
    const count = this.criteriaMetCount();
    if (count <= 1) return 'bg-rose-500';
    if (count === 2) return 'bg-amber-500';
    if (count === 3) return 'bg-sky-500';
    return 'bg-primary dark:bg-sky-400';
  });

  readonly isConfirmPasswordMatch = computed(() => {
    return (
      this.confirmPassword().length > 0 &&
      this.password().length > 0 &&
      this.confirmPassword() === this.password()
    );
  });

  readonly confirmPasswordError = computed(() => {
    if (!this.formSubmitted() && !this.form.controls.confirmPassword.touched) return '';
    if (!this.confirmPassword()) return 'Please confirm your password.';
    if (!this.isConfirmPasswordMatch()) return 'Passwords do not match.';
    return '';
  });

  readonly isFormValid = computed(() => {
    return (
      this.isEmailValid() &&
      this.isPasswordValid() &&
      this.isConfirmPasswordMatch()
    );
  });

  onSubmit(): void {
    this.formSubmitted.set(true);
    this.form.markAllAsTouched();

    if (!this.isFormValid() || this.form.invalid) {
      if (!this.isEmailValid()) {
        this.errorMessage.set('Please enter a valid email address.');
      } else if (!this.isPasswordValid()) {
        this.errorMessage.set('Password must fulfill all 4 security criteria.');
      } else if (!this.isConfirmPasswordMatch()) {
        this.errorMessage.set('Password confirmation does not match.');
      }
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth
      .register({
        email: this.form.controls.email.value.trim(),
        password: this.form.controls.password.value,
      })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.registeredEmail.set(res?.email || this.emailTrimmed());
          this.registeredIsActive.set(res?.isActive === true);
          this.isSuccess.set(true);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err?.status === 409 || err?.error?.message?.includes('already registered')) {
            this.errorMessage.set(
              'This email is already registered. Please sign in or use a different email address.',
            );
          } else {
            const serverMsg =
              err?.error?.message ||
              err?.error?.error ||
              err?.message ||
              'Unable to complete registration. Please try again.';
            this.errorMessage.set(Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg);
          }
        },
      });
  }
}
