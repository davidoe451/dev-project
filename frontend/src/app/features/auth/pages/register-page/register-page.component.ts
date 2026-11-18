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
  AppAlertComponent,
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
    AppAlertComponent,
    AppButtonComponent,
    AppInputComponent,
    AppBadgeComponent,
    AppSpinnerComponent,
  ],
  templateUrl: './register-page.component.html',
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
    this.form.controls.confirmPassword.valueChanges.subscribe((value) =>
      this.confirmPassword.set(value),
    );
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
