import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    title: 'Executive Console & Analytics | WEAREZ Admin',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardPageComponent),
  },
  {
    path: 'products',
    title: 'Product Catalog & Drops | WEAREZ Admin',
    loadComponent: () =>
      import('./pages/admin-products/admin-products.component').then((m) => m.AdminProductsPageComponent),
  },
  {
    path: 'orders',
    title: 'Customer Orders Dispatch | WEAREZ Admin',
    loadComponent: () =>
      import('./pages/admin-orders/admin-orders.component').then((m) => m.AdminOrdersPageComponent),
  },
  {
    path: 'users',
    title: 'Client Dossier Vault | WEAREZ Admin',
    loadComponent: () =>
      import('./pages/admin-users/admin-users.component').then((m) => m.AdminUsersPageComponent),
  },
];
