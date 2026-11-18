import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@core/models/product.model';
import { Order } from '@core/models/order.model';
import { unwrapResponse } from '@core/models/product-api.mapper';
import { AdminUserApi, mapAdminUser } from './admin-user.mapper';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  roleId?: string;
  createdAt: string;
  updatedAt: string;
  role?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface AdminOrdersResponse {
  items: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminUsersResponse {
  items: AdminUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAllOrders(page = 1, limit = 20, status?: string, search?: string): Observable<AdminOrdersResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (status && status !== 'ALL') {
      params = params.set('status', status);
    }
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<AdminOrdersResponse | Order[] | ApiResponse<AdminOrdersResponse | Order[]>>(`${this.baseUrl}/orders/admin/all`, { params })
      .pipe(map((response) => {
        const result = unwrapResponse(response);
        return Array.isArray(result)
          ? { items: result, meta: { total: result.length, page: 1, limit, totalPages: 1 } }
          : result;
      }));
  }

  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this.http
      .patch<ApiResponse<Order>>(`${this.baseUrl}/orders/admin/${orderId}/status`, { status })
      .pipe(map((res) => res.data));
  }

  getUsers(page = 1, limit = 20, search?: string): Observable<AdminUsersResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit).set('role', 'CUSTOMER');
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    type UserList = { items: AdminUserApi[]; meta: AdminUsersResponse['meta'] };
    return this.http
      .get<AdminUserApi[] | UserList | ApiResponse<AdminUserApi[] | UserList>>(`${this.baseUrl}/users`, { params })
      .pipe(map((response) => {
        const result = unwrapResponse(response);
        if (!Array.isArray(result)) {
          return { ...result, items: result.items.map(mapAdminUser) };
        }
        const query = search?.trim().toLowerCase() ?? '';
        const customers = result.map(mapAdminUser).filter((user) =>
          user.role?.code === 'CUSTOMER' &&
          [user.email, user.fullName, user.phone].some((value) => value?.toLowerCase().includes(query)),
        );
        return {
          items: customers.slice((page - 1) * limit, page * limit),
          meta: { total: customers.length, page, limit, totalPages: Math.max(1, Math.ceil(customers.length / limit)) },
        };
      }));
  }

  updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE'): Observable<AdminUser> {
    return this.http
      .patch<AdminUserApi | ApiResponse<AdminUserApi>>(`${this.baseUrl}/users/${userId}/active`, { isActive: status === 'ACTIVE' })
      .pipe(map((response) => mapAdminUser(unwrapResponse(response))));
  }
}

