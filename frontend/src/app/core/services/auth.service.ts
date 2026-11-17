import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, RegisterResponse, User } from '../models/user.model';

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly token = signal<string | null>(this.getStoredToken());
  readonly isAuthenticated = computed(() => !!this.token());
  readonly roleCode = computed(() => {
    const role = this.currentUser()?.role;
    return typeof role === 'string' ? role : (role?.code ?? null);
  });
  readonly isAdmin = computed(() => this.roleCode() === 'ADMIN');

  readonly showLogoutConfirm = signal<boolean>(false);

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  }

  register(dto: RegisterDto): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, dto);
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap((res) => {
        if (res?.accessToken) {
          localStorage.setItem('token', res.accessToken);
          this.token.set(res.accessToken);
        }
        if (res?.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUser.set(res.user);
        }
      }),
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap((user) => {
        if (user) {
          const current = this.currentUser();
          const role =
            typeof user.role === 'string'
              ? { id: current?.role?.id ?? 0, code: user.role, name: current?.role?.name ?? user.role }
              : user.role;
          const merged = current ? { ...current, ...user, role } : { ...user, role };
          localStorage.setItem('user', JSON.stringify(merged));
          this.currentUser.set(merged);
        }
      }),
    );
  }

  promptLogout(): void {
    this.showLogoutConfirm.set(true);
  }

  cancelLogout(): void {
    this.showLogoutConfirm.set(false);
  }

  confirmLogout(): void {
    this.showLogoutConfirm.set(false);
    this.executeLogout();
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
    this.showLogoutConfirm.set(false);
  }

  private executeLogout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  logout(force = false): void {
    if (force) {
      this.executeLogout();
    } else {
      this.promptLogout();
    }
  }
}

