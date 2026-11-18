import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import {
  AppAlertComponent,
  AppButtonComponent,
  AppInputComponent,
  AppSpinnerComponent,
} from '@shared/ui';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    AppAlertComponent,
    AppButtonComponent,
    AppInputComponent,
    AppSpinnerComponent,
  ],
  templateUrl: './login-page.component.html',
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
