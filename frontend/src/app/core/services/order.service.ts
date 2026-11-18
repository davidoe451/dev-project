import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/product.model';
import { CreateOrderDto, Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  createOrder(payload: CreateOrderDto): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.baseUrl, payload);
  }

  getMyOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.baseUrl}/my-orders`);
  }

  getMyOrderDetail(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/my-orders/${id}`);
  }
}

