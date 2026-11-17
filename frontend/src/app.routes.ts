import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { adminGuard } from '@core/guards/admin.guard';

export const routes: Routes = [
  // 1. Main Client Layout (Sprint 1: Home & Client Profile)
  {
    path: '',
    loadComponent: () =>
      import('@layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        title: 'WEAREZ | Haute Contemporary Luxury',
        loadComponent: () =>
          import('@features/home/pages/home-page/home-page.component').then((m) => m.HomePageComponent),
      },
      {
        path: 'profile',
        title: 'Client Profile | WEAREZ',
        canActivate: [authGuard],
        loadComponent: () =>
          import('@features/profile/pages/profile-page/profile-page.component').then((m) => m.ProfilePageComponent),
      },
      {
        path: 'admin/customers',
        title: 'Customer Accounts | WEAREZ',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('@features/admin/pages/customers-page/customers-page.component').then(
            (m) => m.CustomersPageComponent,
          ),
      },
    ],
  },

  // 2. Auth Flow (Login & Register)
  {
    path: 'auth',
    loadComponent: () =>
      import('@layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        title: 'Sign In | WEAREZ',
        loadComponent: () =>
          import('@features/auth/pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
      },
      {
        path: 'register',
        title: 'Create Account | WEAREZ',
        loadComponent: () =>
          import('@features/auth/pages/register-page/register-page.component').then((m) => m.RegisterPageComponent),
      },
      {
        path: 'signup',
        redirectTo: 'register',
        pathMatch: 'full',
      },
    ],
  },

  // 3. Top-Level Aliases
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'signup', redirectTo: 'auth/register', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },

  // 4. Fallback 404
  {
    path: '**',
    title: '404 - Not Found | WEAREZ',
    loadComponent: () =>
      import('@shared/pages/not-found-page/not-found-page.component').then((m) => m.NotFoundPageComponent),
  },
];
