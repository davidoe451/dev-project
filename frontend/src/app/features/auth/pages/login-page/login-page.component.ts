import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AppButtonComponent, AppInputComponent, AppSpinnerComponent } from '@shared/ui';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    AppButtonComponent,
    AppInputComponent,
    AppSpinnerComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="space-y-1">
        <span class="text-[10px] uppercase tracking-[0.25em] text-primary dark:text-sky-300 font-bold block">
          VAULT AUTHENTICATION
        </span>
        <h2 class="font-display text-2xl sm:text-3xl uppercase tracking-tight text-slate-950 dark:text-white">
          Sign In
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-light">
          Sign in to access your WEAREZ account
        </p>
      </div>

      <!-- Error Alert -->
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

      <!-- Form -->
      <form class="space-y-4 pt-1" [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Email Input -->
        <app-input
          id="loginEmail"
          type="email"
          label="Email Address"
          [required]="true"
          formControlName="email"
          placeholder="e.g. client@example.com"
          autocomplete="email"
          [error]="emailError()"
        />

        <!-- Password Input with Toggle Suffix -->
        <app-input
          id="loginPassword"
          [type]="showPassword() ? 'text' : 'password'"
          label="Password"
          [required]="true"
          formControlName="password"
          placeholder="Enter your password"
          autocomplete="current-password"
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

        <!-- Submit Button -->
        <div class="pt-2">
          <app-button
            type="submit"
            size="lg"
            [fullWidth]="true"
            [disabled]="isLoading()"
            [class]="'shadow-md shadow-primary/20'"
          >
            @if (isLoading()) {
              <app-spinner size="sm" class="mr-2" />
              <span>AUTHENTICATING...</span>
            } @else {
              <span>Sign In</span>
              <span class="material-symbols-outlined text-base ml-1">arrow_forward</span>
            }
          </app-button>
        </div>
      </form>

      <!-- Switch to Register -->
      <div
        class="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400"
      >
        Don't have an account?
        <a
          routerLink="/auth/register"
          class="font-bold text-primary dark:text-sky-300 hover:underline ml-1 uppercase tracking-wider"
        >
          Create an account
        </a>
      </div>
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
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly showPassword = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly formSubmitted = signal<boolean>(false);

  readonly emailError = computed(() => {
    if (!this.formSubmitted()) return '';
    const ctrl = this.form.controls.email;
    if (ctrl.hasError('required')) return 'Email address is required.';
    if (ctrl.hasError('email')) return 'Please enter a valid email address.';
    return '';
  });

  readonly passwordError = computed(() => {
    if (!this.formSubmitted()) return '';
    const ctrl = this.form.controls.password;
    if (ctrl.hasError('required')) return 'Password is required.';
    return '';
  });

  onSubmit(): void {
    this.formSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.form.getRawValue();

    this.auth
      .login({
        email: email.trim(),
        password,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/profile']);
        },
        error: (err) => {
          this.isLoading.set(false);
          const serverMsg =
            err?.error?.message ||
            err?.message ||
            'Invalid email or password. Please try again.';
          this.errorMessage.set(Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg);
        },
      });
  }
}
