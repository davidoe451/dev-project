import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Order, OrderItem } from '@core/models/order.model';
import { Product } from '@core/models/product.model';
import { ProductService } from '@core/services/product.service';
import { AdminService } from '../../services/admin.service';
import { AppBadgeComponent, AppButtonComponent } from '@shared/ui';

interface ParsedOrderNote {
  paymentMethod: string;
  packaging: string;
  promo?: string;
  customerNote?: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppButtonComponent, AppBadgeComponent],
  template: `
    <div class="space-y-6 max-w-7xl mx-auto pb-16">
      <!-- 1. Header & Quick Actions -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5"
      >
        <div>
          <div class="flex items-center gap-2 text-[12px] uppercase text-slate-400 font-mono">
            <span>ADMIN</span>
            <span>/</span>
            <span class="text-primary dark:text-sky-300 font-bold">DISPATCH VAULT</span>
          </div>
          <h2 class="font-display text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
            ORDER FULFILLMENT & AIR DISPATCH CONSOLE
          </h2>
          <p class="text-[13px] text-slate-500 dark:text-slate-400 font-light">
            Monitor client acquisitions, inspect ordered garments and sizes, and manage fulfillment workflows.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <app-button
            type="button"
            variant="secondary"
            size="sm"
            (click)="printSummary()"
            title="Print Manifest"
          >
            <span class="material-symbols-outlined text-base">print</span>
            <span class="hidden sm:inline">PRINT MANIFEST</span>
          </app-button>

          <app-button
            type="button"
            variant="primary"
            size="sm"
            (click)="loadOrders()"
          >
            <span class="material-symbols-outlined text-base" [class.animate-spin]="isLoading()">refresh</span>
            <span>REFRESH</span>
          </app-button>
        </div>
      </div>

      <!-- Feedback Banner -->
      @if (feedback()) {
        <div
          class="p-3.5 border text-[13px] flex items-center justify-between transition-all"
          [class.bg-emerald-50]="feedback()?.type === 'success'"
          [class.text-emerald-800]="feedback()?.type === 'success'"
          [class.border-emerald-300]="feedback()?.type === 'success'"
          [class.dark:bg-emerald-950/60]="feedback()?.type === 'success'"
          [class.dark:text-emerald-300]="feedback()?.type === 'success'"
          [class.bg-rose-50]="feedback()?.type === 'error'"
          [class.text-rose-800]="feedback()?.type === 'error'"
          [class.border-rose-300]="feedback()?.type === 'error'"
          [class.dark:bg-rose-950/60]="feedback()?.type === 'error'"
          [class.dark:text-rose-300]="feedback()?.type === 'error'"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base">
              {{ feedback()?.type === 'success' ? 'check_circle' : 'error' }}
            </span>
            <span>{{ feedback()?.message }}</span>
          </div>
          <button type="button" (click)="feedback.set(null)" class="text-[12px] font-bold uppercase cursor-pointer">
            DISMISS
          </button>
        </div>
      }

      <!-- 2. KPI Metrics Bar -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <!-- Metric 1: Total Revenue -->
        <div class="p-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              DISPATCH REVENUE
            </span>
            <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">payments</span>
          </div>
          <div class="text-2xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight font-sans">
            \${{ totalRevenue() | number: '1.2-2' }}
          </div>
          <div class="text-[11px] text-slate-400 font-mono mt-0.5">EXCLUDING CANCELLED DISPATCHES</div>
        </div>

        <!-- Metric 2: Total Dispatches -->
        <div class="p-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              TOTAL ORDERS
            </span>
            <span class="material-symbols-outlined text-sky-600 dark:text-sky-400 text-lg">inventory_2</span>
          </div>
          <div class="text-2xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight font-sans">
            {{ allOrders().length }}
          </div>
          <div class="text-[11px] text-slate-400 font-mono mt-0.5">LIFETIME DISPATCH RUNS</div>
        </div>

        <!-- Metric 3: Needs Atelier Action -->
        <div class="p-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              NEEDS FULFILLMENT
            </span>
            <span class="material-symbols-outlined text-amber-500 text-lg">pending_actions</span>
          </div>
          <div class="text-2xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tracking-tight font-sans">
            {{ pendingCount() + processingCount() }}
          </div>
          <div class="text-[11px] text-slate-400 font-mono mt-0.5">
            {{ pendingCount() }} PENDING • {{ processingCount() }} PREPARING
          </div>
        </div>

        <!-- Metric 4: Successfully Completed -->
        <div class="p-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              FULFILLED & SHIPPED
            </span>
            <span class="material-symbols-outlined text-sky-500 text-lg">local_shipping</span>
          </div>
          <div class="text-2xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight font-sans">
            {{ shippedCount() + deliveredCount() }}
          </div>
          <div class="text-[11px] text-slate-400 font-mono mt-0.5">
            {{ shippedCount() }} IN TRANSIT • {{ deliveredCount() }} DELIVERED
          </div>
        </div>
      </div>

      <!-- 3. Status Filter Tabs with Counts -->
      <div
        class="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-[13px] uppercase tracking-wider font-bold"
      >
        @for (tab of statusTabs; track tab.key) {
          <button
            type="button"
            (click)="selectStatusTab(tab.key)"
            class="px-4 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            [class.border-primary]="activeStatus() === tab.key"
            [class.text-primary]="activeStatus() === tab.key"
            [class.dark:border-sky-400]="activeStatus() === tab.key"
            [class.dark:text-sky-300]="activeStatus() === tab.key"
            [class.border-transparent]="activeStatus() !== tab.key"
            [class.text-slate-500]="activeStatus() !== tab.key"
            [class.hover:text-slate-800]="activeStatus() !== tab.key"
            [class.dark:hover:text-slate-200]="activeStatus() !== tab.key"
          >
            <span>{{ tab.label }}</span>
            <span
              class="px-1.5 py-0.2 text-[11px] font-mono rounded-full font-bold"
              [class.bg-primary]="activeStatus() === tab.key"
              [class.text-white]="activeStatus() === tab.key"
              [class.dark:bg-sky-400]="activeStatus() === tab.key"
              [class.dark:text-slate-950]="activeStatus() === tab.key"
              [class.bg-slate-200]="activeStatus() !== tab.key"
              [class.text-slate-600]="activeStatus() !== tab.key"
              [class.dark:bg-slate-800]="activeStatus() !== tab.key"
              [class.dark:text-slate-400]="activeStatus() !== tab.key"
            >
              {{ getStatusCount(tab.key) }}
            </span>
          </button>
        }
      </div>

      <!-- 4. Multi-Dimension Filter Dock (Time: Ngày / Tuần / Tháng, Customer, Garment Item, Search, Sort) -->
      <div
        class="bg-white dark:bg-dark-surface p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5"
      >
        <!-- Top Row: Time Range Segmented Pills & Universal Search -->
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <!-- Time Range Filter Pills (Ngày, Tuần, Tháng) -->
          <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 overflow-x-auto shrink-0">
            <span class="text-[10px] text-slate-400 uppercase tracking-widest font-bold px-2 font-mono flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">calendar_month</span>
              <span>THỜI GIAN:</span>
            </span>
            <button
              type="button"
              (click)="timeRange.set('ALL')"
              [class.bg-primary]="timeRange() === 'ALL'"
              [class.text-white]="timeRange() === 'ALL'"
              [class.dark:bg-sky-400]="timeRange() === 'ALL'"
              [class.dark:text-slate-950]="timeRange() === 'ALL'"
              [class.text-slate-600]="timeRange() !== 'ALL'"
              [class.dark:text-slate-400]="timeRange() !== 'ALL'"
              class="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              TẤT CẢ ({{ timeRangeCounts().ALL }})
            </button>
            <button
              type="button"
              (click)="timeRange.set('TODAY')"
              [class.bg-primary]="timeRange() === 'TODAY'"
              [class.text-white]="timeRange() === 'TODAY'"
              [class.dark:bg-sky-400]="timeRange() === 'TODAY'"
              [class.dark:text-slate-950]="timeRange() === 'TODAY'"
              [class.text-slate-600]="timeRange() !== 'TODAY'"
              [class.dark:text-slate-400]="timeRange() !== 'TODAY'"
              class="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              HÔM NAY / 24H ({{ timeRangeCounts().TODAY }})
            </button>
            <button
              type="button"
              (click)="timeRange.set('WEEK')"
              [class.bg-primary]="timeRange() === 'WEEK'"
              [class.text-white]="timeRange() === 'WEEK'"
              [class.dark:bg-sky-400]="timeRange() === 'WEEK'"
              [class.dark:text-slate-950]="timeRange() === 'WEEK'"
              [class.text-slate-600]="timeRange() !== 'WEEK'"
              [class.dark:text-slate-400]="timeRange() !== 'WEEK'"
              class="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              TUẦN NÀY ({{ timeRangeCounts().WEEK }})
            </button>
            <button
              type="button"
              (click)="timeRange.set('MONTH')"
              [class.bg-primary]="timeRange() === 'MONTH'"
              [class.text-white]="timeRange() === 'MONTH'"
              [class.dark:bg-sky-400]="timeRange() === 'MONTH'"
              [class.dark:text-slate-950]="timeRange() === 'MONTH'"
              [class.text-slate-600]="timeRange() !== 'MONTH'"
              [class.dark:text-slate-400]="timeRange() !== 'MONTH'"
              class="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              THÁNG NÀY ({{ timeRangeCounts().MONTH }})
            </button>
          </div>

          <!-- Universal Search Input -->
          <div class="flex-1 relative min-w-[260px]">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">search</span>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              placeholder="TÌM THEO MÃ ĐƠN (#ORD-...), KHÁCH HÀNG, SĐT, MÓN HÀNG..."
              class="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-sky-400 placeholder:text-slate-400 transition-colors"
            />
            @if (searchQuery().trim()) {
              <button
                type="button"
                (click)="searchQuery.set('')"
                class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
              >
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            }
          </div>
        </div>

        <!-- Middle Row: Customer Filter, Garment Item Filter & Sort Selector -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <!-- Filter Theo Khách (Customer Text Input) -->
          <div class="space-y-1">
            <label for="order-customer-filter" class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              LỌC THEO KHÁCH HÀNG:
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                person
              </span>
              <input
                id="order-customer-filter"
                type="text"
                [value]="customerQuery()"
                (input)="customerQuery.set($any($event.target).value)"
                placeholder="Nhập tên khách hàng..."
                class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-8 pr-7 py-2 text-[12px] text-slate-800 dark:text-slate-200 font-medium placeholder:text-slate-400 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors"
              />
              @if (customerQuery().trim()) {
                <button
                  type="button"
                  (click)="customerQuery.set('')"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer flex items-center justify-center p-0.5"
                  title="Xóa lọc khách"
                >
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              }
            </div>
          </div>

          <!-- Filter Theo Món Hàng (Garment Item Text Input) -->
          <div class="space-y-1">
            <label for="order-item-filter" class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              LỌC THEO MÓN HÀNG:
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                checkroom
              </span>
              <input
                id="order-item-filter"
                type="text"
                [value]="itemQuery()"
                (input)="itemQuery.set($any($event.target).value)"
                placeholder="Nhập tên món, áo, quần..."
                class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-8 pr-7 py-2 text-[12px] text-slate-800 dark:text-slate-200 font-medium placeholder:text-slate-400 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors"
              />
              @if (itemQuery().trim()) {
                <button
                  type="button"
                  (click)="itemQuery.set('')"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer flex items-center justify-center p-0.5"
                  title="Xóa lọc món hàng"
                >
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              }
            </div>
          </div>

          <!-- Sort Selector -->
          <div class="space-y-1">
            <label for="order-sort-filter" class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              SẮP XẾP ĐƠN HÀNG:
            </label>
            <select
              id="order-sort-filter"
              [ngModel]="sortBy()"
              (ngModelChange)="sortBy.set($event)"
              class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[12px] text-slate-800 dark:text-slate-200 uppercase font-semibold focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">MỚI NHẤT TRƯỚC (NEWEST)</option>
              <option value="OLDEST">CŨ NHẤT TRƯỚC (OLDEST)</option>
              <option value="HIGHEST">GIÁ TRỊ CAO NHẤT (HIGHEST)</option>
              <option value="LOWEST">GIÁ TRỊ THẤP NHẤT (LOWEST)</option>
            </select>
          </div>

          <!-- Quick Results Indicator & Reset Action -->
          <div class="flex items-end justify-between sm:justify-end gap-3 pb-0.5">
            @if (isAnyFilterActive()) {
              <button
                type="button"
                (click)="resetAllFilters()"
                class="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                title="Reset all active filters"
              >
                <span class="material-symbols-outlined text-sm">filter_alt_off</span>
                <span>XÓA BỘ LỌC</span>
              </button>
            }

            <div class="text-[12px] text-slate-500 dark:text-slate-400 font-mono text-right">
              KHỚP: <strong class="text-slate-900 dark:text-white font-bold">{{ filteredOrders().length }}</strong> / {{ allOrders().length }}
            </div>
          </div>
        </div>

        <!-- Active Filter Indicator Badges Bar -->
        @if (isAnyFilterActive()) {
          <div class="flex items-center gap-2 flex-wrap pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <span class="text-slate-400 font-mono font-bold uppercase text-[10px]">ĐANG LỌC THEO:</span>

            @if (activeStatus() !== 'ALL') {
              <app-badge variant="secondary" size="md" class="flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                <span>TRẠNG THÁI: {{ activeStatus() }}</span>
                <button type="button" (click)="activeStatus.set('ALL')" class="hover:text-rose-500 cursor-pointer">
                  <span class="material-symbols-outlined text-xs">close</span>
                </button>
              </app-badge>
            }

            @if (timeRange() !== 'ALL') {
              <app-badge variant="navy" size="md" class="flex items-center gap-1.5">
                <span>THỜI GIAN: {{ timeRange() === 'TODAY' ? 'HÔM NAY / 24H' : timeRange() === 'WEEK' ? 'TUẦN NÀY' : 'THÁNG NÀY' }}</span>
                <button type="button" (click)="timeRange.set('ALL')" class="hover:text-rose-300 cursor-pointer">
                  <span class="material-symbols-outlined text-xs">close</span>
                </button>
              </app-badge>
            }

            @if (customerQuery().trim()) {
              <app-badge variant="secondary" size="md" class="flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                <span>KHÁCH: "{{ customerQuery() }}"</span>
                <button type="button" (click)="customerQuery.set('')" class="hover:text-rose-500 cursor-pointer">
                  <span class="material-symbols-outlined text-xs">close</span>
                </button>
              </app-badge>
            }

            @if (itemQuery().trim()) {
              <app-badge variant="secondary" size="md" class="flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                <span class="truncate max-w-[200px]">MÓN: "{{ itemQuery() }}"</span>
                <button type="button" (click)="itemQuery.set('')" class="hover:text-rose-500 cursor-pointer">
                  <span class="material-symbols-outlined text-xs">close</span>
                </button>
              </app-badge>
            }

            @if (searchQuery().trim()) {
              <app-badge variant="default" size="md" class="flex items-center gap-1.5 shadow-2xs">
                <span>TỪ KHÓA: "{{ searchQuery() }}"</span>
                <button type="button" (click)="searchQuery.set('')" class="hover:opacity-75 cursor-pointer">
                  <span class="material-symbols-outlined text-xs">close</span>
                </button>
              </app-badge>
            }

            <span class="ml-auto font-mono text-slate-500 dark:text-slate-400">
              DOANH SỐ KHỚP: <strong class="text-emerald-600 dark:text-emerald-400 font-bold">\${{ filteredRevenue() | number: '1.2-2' }}</strong>
            </span>
          </div>
        }
      </div>

      <!-- 5. Orders Table (Compact, neat typography with +1px font size) -->
      <div
        class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
      >
        @if (isLoading()) {
          <div class="py-20 text-center space-y-3">
            <span
              class="w-8 h-8 border-2 border-primary dark:border-sky-400 border-t-transparent rounded-full animate-spin inline-block"
            ></span>
            <p class="text-[13px] uppercase tracking-wider text-slate-500">RETRIEVING DISPATCH ARCHIVES...</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-[13px]">
              <thead
                class="bg-slate-50 dark:bg-slate-900/80 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800"
              >
                <tr>
                  <th class="px-4 py-3.5 w-10"></th>
                  <th class="px-5 py-3.5">ORDER RECORD</th>
                  <th class="px-5 py-3.5">PURCHASED GARMENTS (ITEMS)</th>
                  <th class="px-5 py-3.5">CLIENT RECIPIENT</th>
                  <th class="px-5 py-3.5">TOTAL & PAYMENT</th>
                  <th class="px-5 py-3.5">STATUS DISPATCH</th>
                  <th class="px-5 py-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                @for (ord of filteredOrders(); track ord.id) {
                  <!-- Main Order Row -->
                  <tr
                    class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    (click)="toggleExpandOrder(ord.id)"
                  >
                    <!-- Expand/Collapse toggle icon -->
                    <td class="pl-4 pr-1 py-4 text-center">
                      <button
                        type="button"
                        (click)="toggleExpandOrder(ord.id); $event.stopPropagation()"
                        class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                        [title]="isOrderExpanded(ord.id) ? 'Collapse order' : 'Expand order pieces'"
                      >
                        <span class="material-symbols-outlined text-base transition-transform duration-200" [class.rotate-90]="isOrderExpanded(ord.id)">
                          chevron_right
                        </span>
                      </button>
                    </td>

                    <!-- Order ID & Date -->
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono font-bold text-[13px] text-primary dark:text-sky-300">
                          #{{ ord.orderNumber }}
                        </span>
                        <button
                          type="button"
                          (click)="copyToClipboard(ord.orderNumber, 'ord-' + ord.id); $event.stopPropagation()"
                          class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                          title="Copy order ID"
                        >
                          <span class="material-symbols-outlined text-xs">
                            {{ copiedField() === 'ord-' + ord.id ? 'check' : 'content_copy' }}
                          </span>
                        </button>
                      </div>
                      <div class="text-[12px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {{ formatOrderDate(ord.createdAt) }}
                      </div>
                      <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                        {{ formatOrderTime(ord.createdAt) }}
                      </div>
                    </td>

                    <!-- PURCHASED GARMENTS (ITEMS) -->
                    <td class="px-5 py-4">
                      <div class="flex flex-col gap-2.5 min-w-[260px] max-w-[380px]">
                        @if (ord.items && ord.items.length > 0) {
                          @for (item of ord.items.slice(0, 2); track item.id || $index) {
                            <div class="flex items-center gap-3">
                              <img
                                [src]="getProductImage(item)"
                                [alt]="getProductName(item)"
                                class="w-10 h-12 object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 shrink-0 shadow-2xs"
                              />
                              <div class="min-w-0 flex-1">
                                <div
                                  class="font-bold uppercase text-[12px] text-slate-900 dark:text-white truncate"
                                  [title]="getProductName(item)"
                                >
                                  {{ getProductName(item) }}
                                </div>
                                <div class="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                  <span
                                    class="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                  >
                                    SIZE: {{ item.size || 'M' }}
                                  </span>
                                  <span>QTY: <strong class="text-slate-800 dark:text-slate-200">{{ item.quantity }}</strong></span>
                                  <span>·</span>
                                  <span class="font-bold text-slate-800 dark:text-slate-200">\${{ item.unitPrice }}</span>
                                </div>
                              </div>
                            </div>
                          }

                          @if (ord.items.length > 2) {
                            <button
                              type="button"
                              (click)="toggleExpandOrder(ord.id); $event.stopPropagation()"
                              class="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline uppercase flex items-center gap-1 cursor-pointer self-start"
                            >
                              <span>+{{ ord.items.length - 2 }} more pieces</span>
                              <span class="material-symbols-outlined text-xs">
                                {{ isOrderExpanded(ord.id) ? 'expand_less' : 'expand_more' }}
                              </span>
                            </button>
                          }
                        } @else {
                          <div class="flex items-center gap-2 text-slate-400 italic text-[12px]">
                            <span class="material-symbols-outlined text-sm">inventory_2</span>
                            <span>1 RUNWAY ARCHIVE PIECE</span>
                          </div>
                        }
                      </div>
                    </td>

                    <!-- CLIENT RECIPIENT -->
                    <td class="px-5 py-4">
                      <div class="font-bold text-[13px] text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{{ ord.customerName }}</span>
                      </div>
                      <div class="text-[12px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        <span class="material-symbols-outlined text-xs text-slate-400">call</span>
                        <a [href]="'tel:' + ord.phone" class="hover:underline" (click)="$event.stopPropagation()">
                          {{ ord.phone }}
                        </a>
                      </div>
                      <div
                        class="text-[11px] text-slate-400 max-w-[210px] truncate mt-0.5"
                        [title]="ord.address"
                      >
                        {{ ord.address }}
                      </div>
                    </td>

                    <!-- TOTAL & PAYMENT -->
                    <td class="px-5 py-4 font-mono">
                      <div class="font-bold text-[15px] text-slate-900 dark:text-white">
                        \${{ ord.totalAmount }}
                      </div>
                      <div class="mt-1 flex flex-wrap gap-1">
                        <span
                          class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {{ parseOrderNote(ord.note).paymentMethod }}
                        </span>
                      </div>
                    </td>

                    <!-- STATUS DISPATCH -->
                    <td class="px-5 py-4" (click)="$event.stopPropagation()">
                      <div class="flex items-center gap-2">
                        <select
                          [ngModel]="ord.status"
                          (ngModelChange)="onUpdateStatus(ord, $event)"
                          class="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider border rounded-none cursor-pointer focus:outline-none"
                          [ngClass]="getStatusSelectClass(ord.status)"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </td>

                    <!-- ACTIONS -->
                    <td class="px-5 py-4 text-right" (click)="$event.stopPropagation()">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="inspectOrder(ord)"
                          class="px-3 py-1.5 bg-slate-100 hover:bg-primary hover:text-white dark:bg-slate-800 dark:hover:bg-sky-400 dark:hover:text-slate-950 text-slate-800 dark:text-slate-200 font-bold uppercase text-[11px] tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                          title="Open Full Dossier"
                        >
                          <span class="material-symbols-outlined text-sm">visibility</span>
                          <span>INSPECT</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Inline Expandable Detail Tray -->
                  @if (isOrderExpanded(ord.id)) {
                    <tr class="bg-slate-50/80 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
                      <td colspan="7" class="p-5 sm:p-6">
                        <div class="space-y-4">
                          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div class="flex items-center gap-2 text-[13px] font-mono">
                              <span class="font-bold text-primary dark:text-sky-300">
                                COMPLETE PIECES BREAKDOWN (#{{ ord.orderNumber }})
                              </span>
                              <span class="text-slate-400">·</span>
                              <span class="text-slate-500">{{ ord.items.length }} TOTAL ITEMS</span>
                            </div>
                            <div class="flex items-center gap-2">
                              <button
                                type="button"
                                (click)="inspectOrder(ord)"
                                class="text-[12px] font-bold uppercase text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>OPEN FULL MODAL DOSSIER</span>
                                <span class="material-symbols-outlined text-sm">open_in_new</span>
                              </button>
                            </div>
                          </div>

                          <!-- Grid of all items in this order -->
                          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            @for (item of ord.items; track item.id || $index) {
                              <div
                                class="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs"
                              >
                                <img
                                  [src]="getProductImage(item)"
                                  [alt]="getProductName(item)"
                                  class="w-14 h-16 object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 shrink-0"
                                />
                                <div class="min-w-0 flex-1">
                                  <div class="text-[11px] text-slate-400 uppercase tracking-widest font-mono">
                                    {{ getProductBrand(item) }}
                                  </div>
                                  <h4 class="font-bold uppercase text-[13px] text-slate-900 dark:text-white truncate mt-0.5">
                                    {{ getProductName(item) }}
                                  </h4>
                                  <div class="flex items-center gap-2 text-[12px] font-mono mt-1 text-slate-600 dark:text-slate-300">
                                    <span class="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 font-bold border border-slate-200 dark:border-slate-700">
                                      SIZE {{ item.size || 'M' }}
                                    </span>
                                    <span>QTY: <strong>{{ item.quantity }}</strong></span>
                                  </div>
                                  <div class="flex items-baseline justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-[13px] font-mono">
                                    <span class="text-slate-400">\${{ item.unitPrice }}/ea</span>
                                    <span class="font-bold text-slate-900 dark:text-white">\${{ item.totalPrice }}</span>
                                  </div>
                                </div>
                              </div>
                            }
                          </div>

                          <!-- Dispatch Logistics & Client Instructions Strip -->
                          <div class="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[13px]">
                            <div class="space-y-1">
                              <div class="flex items-center gap-2">
                                <span class="font-bold uppercase text-[11px] text-slate-400">DISPATCH DESTINATION:</span>
                                <span class="text-slate-800 dark:text-slate-200 font-medium">{{ ord.address }}</span>
                              </div>
                              @if (parseOrderNote(ord.note).customerNote) {
                                <div class="flex items-center gap-2">
                                  <span class="font-bold uppercase text-[11px] text-amber-500">CLIENT NOTE:</span>
                                  <span class="text-slate-600 dark:text-slate-300 italic">{{ parseOrderNote(ord.note).customerNote }}</span>
                                </div>
                              }
                            </div>
                            <div class="flex items-center gap-3 shrink-0">
                              <span class="text-[11px] uppercase font-bold text-slate-400">PACKAGING:</span>
                              <span class="px-2 py-0.5 text-[11px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {{ parseOrderNote(ord.note).packaging }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  }
                } @empty {
                  <tr>
                    <td colspan="7" class="px-6 py-16 text-center text-slate-400 uppercase tracking-wider text-[13px] space-y-2">
                      <span class="material-symbols-outlined text-4xl block text-slate-300 dark:text-slate-600">inbox</span>
                      <p>No dispatch records found matching your filter criteria.</p>
                      @if (isAnyFilterActive()) {
                        <button
                          type="button"
                          (click)="resetAllFilters()"
                          class="mt-2 text-[12px] font-bold text-sky-600 dark:text-sky-400 uppercase underline cursor-pointer"
                        >
                          XÓA TẤT CẢ BỘ LỌC (CLEAR ALL FILTERS)
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- 6. Modal: Complete Order Inspection Dossier -->
      @if (selectedOrder()) {
        <div
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
        >
          <div
            class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 w-full max-w-3xl shadow-2xl my-8 overflow-hidden"
          >
            <!-- Modal Header -->
            <div
              class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[13px] font-mono font-bold text-sky-600 dark:text-sky-400">
                    DISPATCH DOSSIER #{{ selectedOrder()?.orderNumber }}
                  </span>
                  <span
                    class="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                    [ngClass]="getStatusSelectClass(selectedOrder()?.status || 'PENDING')"
                  >
                    {{ selectedOrder()?.status }}
                  </span>
                </div>
                <h3 class="font-display text-xl uppercase font-bold text-slate-900 dark:text-white mt-1">
                  ORDER FULFILLMENT & COURIER RECORD
                </h3>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="printDossier()"
                  class="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Print Packing Slip"
                >
                  <span class="material-symbols-outlined text-lg">print</span>
                </button>
                <button
                  type="button"
                  (click)="selectedOrder.set(null)"
                  class="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            <div class="p-6 space-y-6 text-[13px] max-h-[75vh] overflow-y-auto">
              <!-- Dispatch Lifecycle Stepper -->
              <div class="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  DISPATCH LIFECYCLE PROGRESSION
                </div>
                <div class="grid grid-cols-4 gap-2 text-center text-[11px] font-bold uppercase">
                  @for (step of ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']; track step; let idx = $index) {
                    <div class="flex flex-col items-center gap-1.5">
                      <div
                        class="w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-[12px]"
                        [class.bg-emerald-600]="isStepCompleted(selectedOrder()?.status, step)"
                        [class.text-white]="isStepCompleted(selectedOrder()?.status, step)"
                        [class.bg-primary]="selectedOrder()?.status === step"
                        [class.text-white]="selectedOrder()?.status === step"
                        [class.bg-slate-200]="!isStepCompleted(selectedOrder()?.status, step) && selectedOrder()?.status !== step"
                        [class.text-slate-500]="!isStepCompleted(selectedOrder()?.status, step) && selectedOrder()?.status !== step"
                        [class.dark:bg-slate-800]="!isStepCompleted(selectedOrder()?.status, step) && selectedOrder()?.status !== step"
                      >
                        @if (isStepCompleted(selectedOrder()?.status, step)) {
                          <span class="material-symbols-outlined text-sm">check</span>
                        } @else {
                          {{ idx + 1 }}
                        }
                      </div>
                      <span
                        [class.text-primary]="selectedOrder()?.status === step"
                        [class.dark:text-sky-400]="selectedOrder()?.status === step"
                        [class.text-emerald-600]="isStepCompleted(selectedOrder()?.status, step)"
                        [class.text-slate-400]="!isStepCompleted(selectedOrder()?.status, step) && selectedOrder()?.status !== step"
                      >
                        {{ step }}
                      </span>
                    </div>
                  }
                </div>
              </div>

              <!-- Recipient & Delivery Details -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      CLIENT RECIPIENT
                    </span>
                    <button
                      type="button"
                      (click)="copyToClipboard(selectedOrder()?.customerName || '', 'name')"
                      class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      title="Copy Name"
                    >
                      <span class="material-symbols-outlined text-xs">content_copy</span>
                    </button>
                  </div>
                  <div class="font-bold text-sm text-slate-900 dark:text-white">
                    {{ selectedOrder()?.customerName }}
                  </div>
                  <div class="text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 text-[12px]">
                    <span class="material-symbols-outlined text-xs">call</span>
                    <a [href]="'tel:' + selectedOrder()?.phone" class="hover:underline">
                      {{ selectedOrder()?.phone }}
                    </a>
                  </div>
                  <div class="text-[12px] text-slate-400 font-mono">
                    DISPATCH AUTHORIZED: {{ formatOrderDate(selectedOrder()?.createdAt) }} ({{ formatOrderTime(selectedOrder()?.createdAt) }})
                  </div>
                </div>

                <div class="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      DISPATCH DESTINATION
                    </span>
                    <button
                      type="button"
                      (click)="copyToClipboard(selectedOrder()?.address || '', 'address')"
                      class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      title="Copy Address"
                    >
                      <span class="material-symbols-outlined text-xs">content_copy</span>
                    </button>
                  </div>
                  <div class="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {{ selectedOrder()?.address }}
                  </div>
                  @if (parseOrderNote(selectedOrder()?.note).customerNote) {
                    <div class="text-[12px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 border border-amber-200 dark:border-amber-900/40">
                      <strong>Client Note:</strong> {{ parseOrderNote(selectedOrder()?.note).customerNote }}
                    </div>
                  }
                </div>
              </div>

              <!-- Payment & Packaging Protocol -->
              <div class="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    SETTLEMENT PROTOCOL
                  </span>
                  <div class="font-bold text-slate-900 dark:text-white uppercase">
                    {{ parseOrderNote(selectedOrder()?.note).paymentMethod }}
                  </div>
                  @if (parseOrderNote(selectedOrder()?.note).promo) {
                    <div class="text-[12px] text-sky-600 dark:text-sky-400 font-semibold mt-1">
                      {{ parseOrderNote(selectedOrder()?.note).promo }}
                    </div>
                  }
                </div>
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    ARCHIVE PACKAGING
                  </span>
                  <div class="font-bold text-slate-900 dark:text-white uppercase">
                    {{ parseOrderNote(selectedOrder()?.note).packaging }}
                  </div>
                </div>
              </div>

              <!-- Order Items List Detailed -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold uppercase tracking-wider text-[12px] text-slate-500">
                    PURCHASED GARMENTS & RUNWAY EDITIONS ({{ selectedOrder()?.items?.length || 0 }})
                  </h4>
                  <span class="text-[11px] font-mono text-slate-400">LINE ITEM VERIFICATION</span>
                </div>

                <div class="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800">
                  @for (item of selectedOrder()?.items; track item.id || $index) {
                    <div class="p-4 flex items-center justify-between gap-4 bg-white dark:bg-dark-surface">
                      <div class="flex items-center gap-3.5 min-w-0">
                        <img
                          [src]="getProductImage(item)"
                          [alt]="getProductName(item)"
                          class="w-14 h-16 object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 shrink-0 shadow-2xs"
                        />
                        <div class="min-w-0">
                          <div class="text-[11px] uppercase font-mono text-slate-400">
                            {{ getProductBrand(item) }}
                          </div>
                          <h5 class="font-bold uppercase text-[15px] text-slate-900 dark:text-white truncate">
                            {{ getProductName(item) }}
                          </h5>
                          <div class="flex items-center gap-3 text-[12px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                            <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                              SIZE: {{ item.size || 'M' }}
                            </span>
                            <span>QTY: <strong class="text-slate-900 dark:text-white">{{ item.quantity }}</strong></span>
                            <span class="text-slate-400">·</span>
                            <span>\${{ item.unitPrice }}/ea</span>
                          </div>
                          @if (item.productId) {
                            <div class="mt-1">
                              <a
                                [routerLink]="['/product', item.productId]"
                                target="_blank"
                                class="text-[11px] text-sky-600 dark:text-sky-400 hover:underline uppercase inline-flex items-center gap-1 font-semibold"
                              >
                                <span>VIEW LIVE PRODUCT PAGE</span>
                                <span class="material-symbols-outlined text-xs">launch</span>
                              </a>
                            </div>
                          }
                        </div>
                      </div>
                      <div class="text-right shrink-0">
                        <div class="font-mono font-bold text-[17px] text-slate-900 dark:text-white">
                          \${{ item.totalPrice }}
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono">
                          {{ item.quantity }} × \${{ item.unitPrice }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Order Summary & Status Update Footer -->
              <div class="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-[11px] text-slate-400 uppercase tracking-widest font-bold block mb-1">
                      UPDATE DISPATCH STATE
                    </span>
                    <div class="flex items-center gap-2">
                      <select
                        [ngModel]="selectedOrder()?.status"
                        (ngModelChange)="onModalUpdateStatus($event)"
                        class="px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider border rounded-none cursor-pointer focus:outline-none"
                        [ngClass]="getStatusSelectClass(selectedOrder()?.status || 'PENDING')"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>

                  <div class="text-right space-y-1">
                    <span class="text-[11px] text-slate-400 uppercase tracking-widest font-bold block">
                      TOTAL SETTLEMENT
                    </span>
                    <div class="text-2xl font-extrabold text-primary dark:text-white tracking-tight font-sans">
                      \${{ selectedOrder()?.totalAmount }}
                    </div>
                  </div>
                </div>

                <!-- Quick Progression Action Buttons -->
                <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  @if (selectedOrder()?.status === 'PENDING') {
                    <button
                      type="button"
                      (click)="onModalUpdateStatus('PROCESSING')"
                      class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold uppercase text-[12px] tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span class="material-symbols-outlined text-sm">precision_manufacturing</span>
                      <span>CONFIRM & BEGIN PROCESSING</span>
                    </button>
                  } @else if (selectedOrder()?.status === 'PROCESSING') {
                    <button
                      type="button"
                      (click)="onModalUpdateStatus('SHIPPED')"
                      class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold uppercase text-[12px] tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span class="material-symbols-outlined text-sm">local_shipping</span>
                      <span>DISPATCH COURIER (MARK SHIPPED)</span>
                    </button>
                  } @else if (selectedOrder()?.status === 'SHIPPED') {
                    <button
                      type="button"
                      (click)="onModalUpdateStatus('DELIVERED')"
                      class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[12px] tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span class="material-symbols-outlined text-sm">task_alt</span>
                      <span>MARK COMPLETED (DELIVERED)</span>
                    </button>
                  }

                  @if (selectedOrder()?.status !== 'CANCELLED' && selectedOrder()?.status !== 'DELIVERED') {
                    <button
                      type="button"
                      (click)="onModalUpdateStatus('CANCELLED')"
                      class="px-3 py-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-800 dark:bg-slate-800 dark:hover:bg-rose-950 dark:hover:text-rose-300 text-slate-700 dark:text-slate-300 font-bold uppercase text-[12px] tracking-wider transition-colors cursor-pointer"
                    >
                      CANCEL DISPATCH
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host,
      :host * {
        font-family:
          'Inter',
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          Helvetica,
          Arial,
          sans-serif !important;
        letter-spacing: -0.01em;
      }
      :host .material-symbols-outlined {
        font-family: 'Material Symbols Outlined' !important;
      }
      :host .font-mono {
        font-family:
          ui-monospace,
          SFMono-Regular,
          Menlo,
          Monaco,
          Consolas,
          'Liberation Mono',
          'Courier New',
          monospace !important;
      }
      :host .font-display {
        font-family:
          'Inter',
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          sans-serif !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersPageComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly productService = inject(ProductService);

  readonly allOrders = signal<Order[]>([]);
  readonly catalogProducts = signal<Product[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  readonly selectedOrder = signal<Order | null>(null);
  readonly expandedOrderIds = signal<Set<string>>(new Set<string>());
  readonly copiedField = signal<string | null>(null);

  readonly searchQuery = signal<string>('');
  readonly activeStatus = signal<string>('ALL');
  readonly timeRange = signal<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  readonly customerQuery = signal<string>('');
  readonly itemQuery = signal<string>('');
  readonly sortBy = signal<'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST'>('NEWEST');

  readonly statusTabs = [
    { key: 'ALL', label: 'ALL DISPATCHES' },
    { key: 'PENDING', label: 'PENDING' },
    { key: 'PROCESSING', label: 'PROCESSING' },
    { key: 'SHIPPED', label: 'SHIPPED' },
    { key: 'DELIVERED', label: 'DELIVERED' },
    { key: 'CANCELLED', label: 'CANCELLED' },
  ];

  // Computed KPI Metrics
  readonly totalRevenue = computed(() => {
    return this.allOrders()
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => {
        const val = typeof o.totalAmount === 'string' ? parseFloat(o.totalAmount) : o.totalAmount;
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
  });

  readonly pendingCount = computed(() => this.allOrders().filter((o) => o.status === 'PENDING').length);
  readonly processingCount = computed(() => this.allOrders().filter((o) => o.status === 'PROCESSING').length);
  readonly shippedCount = computed(() => this.allOrders().filter((o) => o.status === 'SHIPPED').length);
  readonly deliveredCount = computed(() => this.allOrders().filter((o) => o.status === 'DELIVERED').length);
  readonly cancelledCount = computed(() => this.allOrders().filter((o) => o.status === 'CANCELLED').length);

  // Time Range Counts (Ngày, Tuần, Tháng)
  readonly timeRangeCounts = computed(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;
    const thirtyDays = 30 * oneDay;

    let today = 0;
    let week = 0;
    let month = 0;

    for (const o of this.allOrders()) {
      const t = new Date(o.createdAt || 0).getTime();
      const diff = now - t;
      if (diff >= 0 && diff <= oneDay) today++;
      if (diff >= 0 && diff <= sevenDays) week++;
      if (diff >= 0 && diff <= thirtyDays) month++;
    }

    return {
      ALL: this.allOrders().length,
      TODAY: today,
      WEEK: week,
      MONTH: month,
    };
  });

  readonly isAnyFilterActive = computed(() => {
    return (
      this.searchQuery().trim().length > 0 ||
      this.activeStatus() !== 'ALL' ||
      this.timeRange() !== 'ALL' ||
      this.customerQuery().trim().length > 0 ||
      this.itemQuery().trim().length > 0
    );
  });

  readonly filteredRevenue = computed(() => {
    return this.filteredOrders()
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => {
        const val = typeof o.totalAmount === 'string' ? parseFloat(o.totalAmount) : o.totalAmount;
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
  });

  // Filtered & Sorted orders list
  readonly filteredOrders = computed(() => {
    let list = this.allOrders();

    // 1. Status Filter
    const st = this.activeStatus();
    if (st !== 'ALL') {
      list = list.filter((o) => o.status === st);
    }

    // 2. Time Range Filter (Ngày, Tuần, Tháng)
    const tr = this.timeRange();
    if (tr !== 'ALL') {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const maxDiff = tr === 'TODAY' ? oneDay : tr === 'WEEK' ? 7 * oneDay : 30 * oneDay;
      list = list.filter((o) => {
        const t = new Date(o.createdAt || 0).getTime();
        const diff = now - t;
        return diff >= 0 && diff <= maxDiff;
      });
    }

    // 3. Customer Filter (nhập chữ tìm theo tên khách)
    const cust = this.customerQuery().trim().toLowerCase();
    if (cust) {
      list = list.filter((o) => (o.customerName || '').toLowerCase().includes(cust));
    }

    // 4. Garment Item Filter (nhập chữ tìm theo tên món / brand)
    const targetItem = this.itemQuery().trim().toLowerCase();
    if (targetItem) {
      list = list.filter((o) =>
        (o.items || []).some((it) => {
          const prodName = this.getProductName(it).toLowerCase();
          const brandName = this.getProductBrand(it).toLowerCase();
          return prodName.includes(targetItem) || brandName.includes(targetItem);
        })
      );
    }

    // 5. Universal Search Query filter
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter((ord) => {
        const matchId = ord.orderNumber?.toLowerCase().includes(q) || ord.id?.toLowerCase().includes(q);
        const matchName = ord.customerName?.toLowerCase().includes(q);
        const matchPhone = ord.phone?.toLowerCase().includes(q);
        const matchAddress = ord.address?.toLowerCase().includes(q);
        const matchNote = ord.note?.toLowerCase().includes(q);
        const matchItems = (ord.items || []).some((it) => {
          const prodName = this.getProductName(it).toLowerCase();
          const brandName = this.getProductBrand(it).toLowerCase();
          const sizeName = (it.size || '').toLowerCase();
          return prodName.includes(q) || brandName.includes(q) || sizeName.includes(q);
        });
        return matchId || matchName || matchPhone || matchAddress || matchNote || matchItems;
      });
    }

    // 6. Sorting
    const sort = this.sortBy();
    return [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      const amountA = typeof a.totalAmount === 'string' ? parseFloat(a.totalAmount) : a.totalAmount;
      const amountB = typeof b.totalAmount === 'string' ? parseFloat(b.totalAmount) : b.totalAmount;

      switch (sort) {
        case 'OLDEST':
          return timeA - timeB;
        case 'HIGHEST':
          return amountB - amountA;
        case 'LOWEST':
          return amountA - amountB;
        case 'NEWEST':
        default:
          return timeB - timeA;
      }
    });
  });

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.selectedOrder()) {
      this.selectedOrder.set(null);
    }
  }

  ngOnInit(): void {
    this.loadCatalogProducts();
    this.loadOrders();
  }

  loadCatalogProducts(): void {
    this.productService.getProducts(1, 100).subscribe({
      next: (res) => {
        if (res.items) {
          this.catalogProducts.set(res.items);
        }
      },
      error: () => {},
    });
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.adminService.getAllOrders(1, 100, undefined, undefined).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.allOrders.set(res.items || []);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.feedback.set({ type: 'error', message: error.status === 404
          ? 'Order management is not available on the current backend yet.'
          : 'Could not load orders. Please check your connection and try again.' });
      },
    });
  }

  getStatusCount(statusKey: string): number {
    switch (statusKey) {
      case 'PENDING':
        return this.pendingCount();
      case 'PROCESSING':
        return this.processingCount();
      case 'SHIPPED':
        return this.shippedCount();
      case 'DELIVERED':
        return this.deliveredCount();
      case 'CANCELLED':
        return this.cancelledCount();
      case 'ALL':
      default:
        return this.allOrders().length;
    }
  }

  selectStatusTab(status: string): void {
    this.activeStatus.set(status);
  }

  resetAllFilters(): void {
    this.searchQuery.set('');
    this.activeStatus.set('ALL');
    this.timeRange.set('ALL');
    this.customerQuery.set('');
    this.itemQuery.set('');
  }

  toggleExpandOrder(id: string): void {
    this.expandedOrderIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  isOrderExpanded(id: string): boolean {
    return this.expandedOrderIds().has(id);
  }

  inspectOrder(ord: Order): void {
    this.selectedOrder.set(ord);
  }

  onUpdateStatus(ord: Order, newStatus: string): void {
    if (ord.status === newStatus) return;
    this.adminService.updateOrderStatus(ord.id, newStatus).subscribe({
      next: (updated) => {
        ord.status = updated.status;
        this.allOrders.update((list) => list.map((o) => (o.id === ord.id ? { ...o, status: updated.status } : o)));
        if (this.selectedOrder()?.id === ord.id) {
          this.selectedOrder.update((curr) => (curr ? { ...curr, status: updated.status } : null));
        }
        this.feedback.set({
          type: 'success',
          message: `Order #${ord.orderNumber} status updated to ${newStatus}.`,
        });
      },
      error: (err) => {
        this.feedback.set({
          type: 'error',
          message: err.error?.message || 'Failed to update order status on server.',
        });
        this.loadOrders();
      },
    });
  }

  onModalUpdateStatus(newStatus: string): void {
    const current = this.selectedOrder();
    if (!current) return;
    this.onUpdateStatus(current, newStatus);
  }

  // Product resolution helpers
  getProductName(item: OrderItem): string {
    if (item.product?.name) return item.product.name;
    const found = this.catalogProducts().find((p) => p.id === item.productId);
    return found?.name || `RUNWAY ARCHIVE GARMENT #${item.productId?.slice(0, 6) || '88'}`;
  }

  getProductImage(item: OrderItem): string {
    if (item.product?.images) {
      const first = item.product.images.split(',')[0].trim();
      if (first) return first;
    }
    const found = this.catalogProducts().find((p) => p.id === item.productId);
    if (found?.images) {
      const first = found.images.split(',')[0].trim();
      if (first) return first;
    }
    return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800';
  }

  getProductBrand(item: OrderItem): string {
    if (item.product?.brand) return item.product.brand;
    const found = this.catalogProducts().find((p) => p.id === item.productId);
    return found?.brand || 'WEAREZ ARCHIVE';
  }

  parseOrderNote(note?: string | null): ParsedOrderNote {
    if (!note) {
      return {
        paymentMethod: 'STANDARD CHECKOUT',
        packaging: 'ATELIER PACKAGING',
      };
    }

    const parts = note.split(' | ').map((s) => s.trim());
    let paymentMethod = 'STANDARD CHECKOUT';
    let packaging = 'ATELIER PACKAGING';
    let promo: string | undefined;
    let customerNote: string | undefined;

    for (const part of parts) {
      if (part.startsWith('PAYMENT:')) {
        paymentMethod = part.replace('PAYMENT:', '').trim();
      } else if (part.startsWith('PACKAGING:')) {
        packaging = part.replace('PACKAGING:', '').trim();
      } else if (part.includes('DISCOUNT APPLIED')) {
        promo = part;
      } else if (part.startsWith('NOTE:')) {
        customerNote = part.replace('NOTE:', '').trim();
      } else if (!customerNote) {
        customerNote = part;
      }
    }

    return { paymentMethod, packaging, promo, customerNote };
  }

  isStepCompleted(currentStatus?: string, step?: string): boolean {
    const sequence = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIdx = sequence.indexOf(currentStatus || '');
    const stepIdx = sequence.indexOf(step || '');
    return currentIdx > stepIdx && currentStatus !== 'CANCELLED';
  }

  copyToClipboard(text: string, fieldName: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      this.copiedField.set(fieldName);
      setTimeout(() => this.copiedField.set(null), 2000);
    }
  }

  printDossier(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  printSummary(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  formatOrderDate(iso?: string): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  }

  formatOrderTime(iso?: string): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  getStatusSelectClass(status: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
      case 'SHIPPED':
        return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800';
      case 'PROCESSING':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
      case 'PENDING':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
    }
  }
}
