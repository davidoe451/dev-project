import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, User } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { OrderService } from '@core/services/order.service';
import { Order } from '@core/models/order.model';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [RouterLink, FormsModule, NgClass],
  template: `
    <div class="w-full flex flex-col selection:bg-primary selection:text-white pb-24">
      <!-- Top Breadcrumb Bar -->
      <div
        class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center"
      >
        <nav class="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <a routerLink="/" class="hover:text-primary dark:hover:text-white transition-colors">HOME</a>
          <span>/</span>
          <span class="text-slate-900 dark:text-white font-semibold">CLIENT PROFILE & VAULT</span>
        </nav>
      </div>

      <!-- Main Profile Console -->
      <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <!-- 1. VIP Client Header Card -->
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
        >
          <div class="flex items-center gap-5">
            <!-- Monogram Avatar -->
            <div
              class="w-16 h-16 sm:w-20 sm:h-20 bg-primary text-white flex items-center justify-center font-display text-2xl sm:text-3xl font-bold tracking-wider shadow-lg shadow-primary/20"
            >
              {{ getInitials() }}
            </div>

            <!-- Client Info -->
            <div class="space-y-1">
              <div class="flex items-center gap-2.5">
                <span
                  class="px-2.5 py-0.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest"
                >
                  VIP MAISON CLIENT
                </span>
                <span class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  NFC ENCRYPTED #{{ getIdSnippet() }}
                </span>
              </div>
              <h1 class="font-display text-2xl sm:text-3xl uppercase tracking-tight text-slate-950 dark:text-white">
                {{ auth.currentUser()?.fullName || auth.currentUser()?.name || auth.currentUser()?.username || auth.currentUser()?.email?.split('@')?.[0] || 'MEMBER' }}
              </h1>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {{ auth.currentUser()?.email }}
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3">
            @if (auth.isAdmin()) {
              <a
                routerLink="/admin"
                class="bg-primary hover:bg-navy-border text-white px-5 py-2.5 text-xs uppercase tracking-wider font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span class="material-symbols-outlined text-base text-sky-300">admin_panel_settings</span>
                <span>ADMIN CONSOLE</span>
              </a>
            }
            <a
              routerLink="/cart"
              class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-5 py-2.5 text-xs uppercase tracking-wider font-bold transition-colors inline-flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-base">shopping_bag</span>
              <span>BAG ({{ cart.itemCount() }})</span>
            </a>
            <button
              type="button"
              (click)="onLogout()"
              class="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-5 py-2.5 text-xs uppercase tracking-wider font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">logout</span>
              <span>SIGN OUT</span>
            </button>
          </div>
        </div>

        <!-- 2. Main Console Layout: Left Nav Sidebar + Active Tab View -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <!-- Left Navigation Sidebar (4 Cols) -->
          <div class="lg:col-span-4 space-y-4">
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 sm:p-3 shadow-sm space-y-1">
              <!-- Tab 1: Client Dossier (Profile info) -->
              <button
                type="button"
                (click)="activeTab.set('profile')"
                [class.bg-primary]="activeTab() === 'profile'"
                [class.text-white]="activeTab() === 'profile'"
                [class.shadow-sm]="activeTab() === 'profile'"
                [class.text-slate-700]="activeTab() !== 'profile'"
                [class.dark:text-slate-300]="activeTab() !== 'profile'"
                [class.hover:bg-slate-100]="activeTab() !== 'profile'"
                [class.dark:hover:bg-slate-800]="activeTab() !== 'profile'"
                class="w-full text-left p-3 flex items-center gap-3 transition-all cursor-pointer group"
              >
                <span
                  class="material-symbols-outlined text-xl transition-colors"
                  [class.text-sky-300]="activeTab() === 'profile'"
                  [class.text-slate-400]="activeTab() !== 'profile'"
                >
                  person
                </span>
                <div class="flex-1 min-w-0">
                  <span class="block text-xs uppercase font-bold tracking-wider truncate">CLIENT DOSSIER</span>
                  <span
                    class="block text-[10px] truncate"
                    [class.text-slate-300]="activeTab() === 'profile'"
                    [class.text-slate-400]="activeTab() !== 'profile'"
                  >
                    Name, contact & shipping address
                  </span>
                </div>
                <span class="material-symbols-outlined text-sm opacity-60">chevron_right</span>
              </button>

              <!-- Tab 2: Change Password -->
              <button
                type="button"
                (click)="activeTab.set('password')"
                [class.bg-primary]="activeTab() === 'password'"
                [class.text-white]="activeTab() === 'password'"
                [class.shadow-sm]="activeTab() === 'password'"
                [class.text-slate-700]="activeTab() !== 'password'"
                [class.dark:text-slate-300]="activeTab() !== 'password'"
                [class.hover:bg-slate-100]="activeTab() !== 'password'"
                [class.dark:hover:bg-slate-800]="activeTab() !== 'password'"
                class="w-full text-left p-3 flex items-center gap-3 transition-all cursor-pointer group"
              >
                <span
                  class="material-symbols-outlined text-xl transition-colors"
                  [class.text-sky-300]="activeTab() === 'password'"
                  [class.text-slate-400]="activeTab() !== 'password'"
                >
                  lock_reset
                </span>
                <div class="flex-1 min-w-0">
                  <span class="block text-xs uppercase font-bold tracking-wider truncate">CHANGE PASSWORD</span>
                  <span
                    class="block text-[10px] truncate"
                    [class.text-slate-300]="activeTab() === 'password'"
                    [class.text-slate-400]="activeTab() !== 'password'"
                  >
                    Update account access credentials
                  </span>
                </div>
                <span class="material-symbols-outlined text-sm opacity-60">chevron_right</span>
              </button>

              <!-- Tab 3: Order History -->
              <button
                type="button"
                (click)="activeTab.set('orders')"
                [class.bg-primary]="activeTab() === 'orders'"
                [class.text-white]="activeTab() === 'orders'"
                [class.shadow-sm]="activeTab() === 'orders'"
                [class.text-slate-700]="activeTab() !== 'orders'"
                [class.dark:text-slate-300]="activeTab() !== 'orders'"
                [class.hover:bg-slate-100]="activeTab() !== 'orders'"
                [class.dark:hover:bg-slate-800]="activeTab() !== 'orders'"
                class="w-full text-left p-3 flex items-center gap-3 transition-all cursor-pointer group"
              >
                <span
                  class="material-symbols-outlined text-xl transition-colors"
                  [class.text-sky-300]="activeTab() === 'orders'"
                  [class.text-slate-400]="activeTab() !== 'orders'"
                >
                  receipt_long
                </span>
                <div class="flex-1 min-w-0">
                  <span class="block text-xs uppercase font-bold tracking-wider truncate">ORDER ARCHIVES</span>
                  <span
                    class="block text-[10px] truncate"
                    [class.text-slate-300]="activeTab() === 'orders'"
                    [class.text-slate-400]="activeTab() !== 'orders'"
                  >
                    Dispatched drops & VIP priority
                  </span>
                </div>
                <span class="material-symbols-outlined text-sm opacity-60">chevron_right</span>
              </button>

              <!-- Tab 4: Security Protocols -->
              <button
                type="button"
                (click)="activeTab.set('security')"
                [class.bg-primary]="activeTab() === 'security'"
                [class.text-white]="activeTab() === 'security'"
                [class.shadow-sm]="activeTab() === 'security'"
                [class.text-slate-700]="activeTab() !== 'security'"
                [class.dark:text-slate-300]="activeTab() !== 'security'"
                [class.hover:bg-slate-100]="activeTab() !== 'security'"
                [class.dark:hover:bg-slate-800]="activeTab() !== 'security'"
                class="w-full text-left p-3 flex items-center gap-3 transition-all cursor-pointer group"
              >
                <span
                  class="material-symbols-outlined text-xl transition-colors"
                  [class.text-sky-300]="activeTab() === 'security'"
                  [class.text-slate-400]="activeTab() !== 'security'"
                >
                  shield
                </span>
                <div class="flex-1 min-w-0">
                  <span class="block text-xs uppercase font-bold tracking-wider truncate">VAULT PROTOCOLS</span>
                  <span
                    class="block text-[10px] truncate"
                    [class.text-slate-300]="activeTab() === 'security'"
                    [class.text-slate-400]="activeTab() !== 'security'"
                  >
                    Hardware token & session safety
                  </span>
                </div>
                <span class="material-symbols-outlined text-sm opacity-60">chevron_right</span>
              </button>
            </div>

            <!-- Client Tier Protocol Card -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
              <div class="flex items-center gap-2 text-primary dark:text-sky-300 text-xs font-bold uppercase tracking-wider">
                <span class="material-symbols-outlined text-base">verified</span>
                <span>AUTHENTICATED CLIENT</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Your dossier preferences and session token are encrypted with 256-bit Maison security protocol.
              </p>
            </div>
          </div>

          <!-- Right Content Area (8 Cols) -->
          <div class="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            @switch (activeTab()) {
              <!-- TAB 1: CLIENT DOSSIER (PROFILE INFO) -->
              @case ('profile') {
                <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h2 class="font-display text-xl uppercase tracking-tight text-slate-950 dark:text-white">
                      CLIENT DOSSIER & DISPATCH PREFERENCES
                    </h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                      Update your contact details and default courier delivery destination.
                    </p>
                  </div>
                  @if (savedNotification()) {
                    <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                      SAVED
                    </span>
                  }
                </div>

                <!-- Feedback Banner -->
                @if (feedbackMessage()) {
                  <div
                    [class.bg-emerald-50]="feedbackType() === 'success'"
                    [class.border-emerald-200]="feedbackType() === 'success'"
                    [class.text-emerald-800]="feedbackType() === 'success'"
                    [class.dark:bg-emerald-950/60]="feedbackType() === 'success'"
                    [class.dark:border-emerald-800]="feedbackType() === 'success'"
                    [class.dark:text-emerald-300]="feedbackType() === 'success'"
                    [class.bg-amber-50]="feedbackType() === 'warning'"
                    [class.border-amber-200]="feedbackType() === 'warning'"
                    [class.text-amber-800]="feedbackType() === 'warning'"
                    [class.dark:bg-amber-950/60]="feedbackType() === 'warning'"
                    [class.dark:border-amber-800]="feedbackType() === 'warning'"
                    [class.dark:text-amber-300]="feedbackType() === 'warning'"
                    class="p-3 text-xs border flex items-center justify-between gap-3 font-medium transition-all"
                  >
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">
                        {{ feedbackType() === 'success' ? 'check_circle' : 'info' }}
                      </span>
                      <span>{{ feedbackMessage() }}</span>
                    </div>
                    <button
                      type="button"
                      (click)="feedbackMessage.set(null)"
                      class="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                }

                <form class="space-y-4" (submit)="onSaveProfile($event)">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <!-- Full Name -->
                    <div class="space-y-1.5">
                      <label for="profileFullName" class="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
                        FULL NAME
                      </label>
                      <input
                        id="profileFullName"
                        type="text"
                        [(ngModel)]="profileName"
                        name="profileName"
                        placeholder="e.g. Alexander Vance"
                        class="w-full bg-slate-50 dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary selection:bg-primary selection:text-white dark:selection:bg-blue-600 dark:selection:text-white"
                      />
                    </div>

                    <!-- Email (Read Only) -->
                    <div class="space-y-1.5">
                      <label for="profileEmail" class="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
                        EMAIL ADDRESS
                      </label>
                      <input
                        id="profileEmail"
                        type="email"
                        [value]="auth.currentUser()?.email"
                        disabled
                        class="w-full bg-slate-100 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed selection:bg-primary selection:text-white dark:selection:bg-blue-600 dark:selection:text-white"
                      />
                    </div>

                    <!-- Phone Number -->
                    <div class="space-y-1.5">
                      <label for="profilePhone" class="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
                        COURIER PHONE NUMBER
                      </label>
                      <input
                        id="profilePhone"
                        type="tel"
                        [(ngModel)]="profilePhone"
                        name="profilePhone"
                        placeholder="e.g. +84 912 345 678"
                        class="w-full bg-slate-50 dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary selection:bg-primary selection:text-white dark:selection:bg-blue-600 dark:selection:text-white"
                      />
                    </div>

                    <!-- Preferred Region -->
                    <div class="space-y-1.5">
                      <label for="profileRegion" class="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
                        PREFERRED DISPATCH REGION
                      </label>
                      <select
                        id="profileRegion"
                        [(ngModel)]="profileRegion"
                        name="profileRegion"
                        class="w-full bg-slate-50 dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-bold focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="VN">VIETNAM (VN) - AIR PRIORITY</option>
                        <option value="FR">FRANCE (FR) - PARIS ATELIER</option>
                        <option value="JP">JAPAN (JP) - TOKYO HUB</option>
                        <option value="US">UNITED STATES (US) - GLOBAL DDP</option>
                      </select>
                    </div>

                    <!-- Shipping Address -->
                    <div class="sm:col-span-2 space-y-1.5">
                      <label for="profileAddress" class="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
                        DEFAULT DELIVERY ADDRESS
                      </label>
                      <input
                        id="profileAddress"
                        type="text"
                        [(ngModel)]="profileAddress"
                        name="profileAddress"
                        placeholder="e.g. Apartment, suite, unit, building, street address"
                        class="w-full bg-slate-50 dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary selection:bg-primary selection:text-white dark:selection:bg-blue-600 dark:selection:text-white"
                      />
                    </div>
                  </div>

                  <div class="pt-2">
                    <button
                      type="submit"
                      [disabled]="isSaving()"
                      class="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white px-6 py-3 text-xs uppercase tracking-[0.16em] font-bold transition-all shadow-md active:scale-98 cursor-pointer inline-flex items-center gap-2"
                    >
                      @if (isSaving()) {
                        <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>UPDATING ON SERVER...</span>
                      } @else {
                        <span class="material-symbols-outlined text-base">save</span>
                        <span>SAVE PREFERENCES</span>
                      }
                    </button>
                  </div>
                </form>
              }

              <!-- TAB 2: CHANGE PASSWORD -->
              @case ('password') {
                <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h2 class="font-display text-base uppercase tracking-tight text-slate-950 dark:text-white">
                    CHANGE ACCOUNT PASSWORD
                  </h2>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-0.5">
                    Update your account credentials to maintain protocol security.
                  </p>
                </div>

                <!-- Password Feedback Banner -->
                @if (passwordFeedbackMessage()) {
                  <div
                    [class.bg-emerald-50]="passwordFeedbackType() === 'success'"
                    [class.border-emerald-200]="passwordFeedbackType() === 'success'"
                    [class.text-emerald-800]="passwordFeedbackType() === 'success'"
                    [class.dark:bg-emerald-950/60]="passwordFeedbackType() === 'success'"
                    [class.dark:border-emerald-800]="passwordFeedbackType() === 'success'"
                    [class.dark:text-emerald-300]="passwordFeedbackType() === 'success'"
                    [class.bg-rose-50]="passwordFeedbackType() === 'warning'"
                    [class.border-rose-200]="passwordFeedbackType() === 'warning'"
                    [class.text-rose-800]="passwordFeedbackType() === 'warning'"
                    [class.dark:bg-rose-950/60]="passwordFeedbackType() === 'warning'"
                    [class.dark:border-rose-800]="passwordFeedbackType() === 'warning'"
                    [class.dark:text-rose-300]="passwordFeedbackType() === 'warning'"
                    class="p-2 text-xs border flex items-center justify-between gap-2.5 font-medium transition-all max-w-md"
                  >
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">
                        {{ passwordFeedbackType() === 'success' ? 'check_circle' : 'error' }}
                      </span>
                      <span>{{ passwordFeedbackMessage() }}</span>
                    </div>
                    <button
                      type="button"
                      (click)="passwordFeedbackMessage.set(null)"
                      class="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                }

                <form class="space-y-3 max-w-md" (submit)="onChangePassword($event)">
                  <!-- Current Password -->
                  <div class="space-y-1">
                    <label for="currentPassword" class="text-[10px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
                      CURRENT PASSWORD
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      [(ngModel)]="currentPassword"
                      name="currentPassword"
                      required
                      placeholder="Enter your current password"
                      class="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary selection:bg-primary selection:text-white dark:selection:bg-blue-600 dark:selection:text-white"
                    />
                  </div>

                  <!-- New Password -->
                  <div class="space-y-1">
                    <label for="newPassword" class="text-[10px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
                      NEW PASSWORD
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      [(ngModel)]="newPassword"
                      name="newPassword"
                      required
                      minlength="6"
                      placeholder="Enter new secure password (min 6 chars)"
                      class="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary selection:bg-primary selection:text-white dark:selection:bg-blue-600 dark:selection:text-white"
                    />
                  </div>

                  <!-- Confirm New Password -->
                  <div class="space-y-1">
                    <label for="confirmNewPassword" class="text-[10px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
                      CONFIRM NEW PASSWORD
                    </label>
                    <input
                      id="confirmNewPassword"
                      type="password"
                      [(ngModel)]="confirmNewPassword"
                      name="confirmNewPassword"
                      required
                      minlength="6"
                      placeholder="Repeat your new password"
                      class="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary selection:bg-primary selection:text-white dark:selection:bg-blue-600 dark:selection:text-white"
                    />
                  </div>

                  <div class="pt-1.5">
                    <button
                      type="submit"
                      [disabled]="isUpdatingPassword()"
                      class="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white px-5 py-2 text-xs uppercase tracking-[0.16em] font-bold transition-all shadow-sm active:scale-98 cursor-pointer inline-flex items-center gap-2"
                    >
                      @if (isUpdatingPassword()) {
                        <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>UPDATING PASSWORD...</span>
                      } @else {
                        <span class="material-symbols-outlined text-sm">key</span>
                        <span>UPDATE PASSWORD</span>
                      }
                    </button>
                  </div>
                </form>
              }

              <!-- TAB 3: ORDER ARCHIVES -->
              @case ('orders') {
                <div class="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 class="font-display text-xl uppercase tracking-tight text-slate-950 dark:text-white">
                      ORDER ARCHIVES & DISPATCH RECORDS
                    </h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                      Review completed runway drops and active shipments dispatched to your address.
                    </p>
                  </div>
                  <button
                    type="button"
                    (click)="loadOrders()"
                    class="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <span class="material-symbols-outlined text-sm" [class.animate-spin]="isLoadingOrders()">refresh</span>
                    <span>REFRESH</span>
                  </button>
                </div>

                @if (isLoadingOrders()) {
                  <div class="py-12 flex flex-col items-center justify-center gap-3">
                    <span class="w-6 h-6 border-2 border-primary dark:border-sky-400 border-t-transparent rounded-full animate-spin"></span>
                    <span class="text-xs uppercase tracking-wider text-slate-500">RETRIEVING DISPATCH RECORDS...</span>
                  </div>
                } @else if (ordersError()) {
                  <div class="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
                    <span>{{ ordersError() }}</span>
                    <button type="button" (click)="loadOrders()" class="font-bold underline uppercase ml-4 cursor-pointer">Retry</button>
                  </div>
                } @else if (orders().length === 0) {
                  <div class="p-8 sm:p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
                    <span class="material-symbols-outlined text-4xl text-slate-400">inventory_2</span>
                    <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      NO DISPATCH ARCHIVES FOUND
                    </h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      You have not authorized any runway drops yet. Explore the archive to place your first order.
                    </p>
                    <div class="pt-2">
                      <a
                        routerLink="/catalog"
                        class="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 text-xs uppercase tracking-wider font-bold transition-colors inline-flex items-center gap-2"
                      >
                        <span class="material-symbols-outlined text-base">storefront</span>
                        <span>EXPLORE READY-TO-WEAR</span>
                      </a>
                    </div>
                  </div>
                } @else {
                  <div class="space-y-4">
                    @for (ord of orders(); track ord.id) {
                      <div class="border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
                        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
                          <div class="flex items-center gap-2.5">
                            <span class="text-xs font-bold font-mono text-primary dark:text-sky-300">
                              #{{ ord.orderNumber }}
                            </span>
                            <span
                              class="px-2 py-0.5 text-[10px] font-bold uppercase"
                              [ngClass]="getOrderStatusClass(ord.status)"
                            >
                              {{ ord.status }}
                            </span>
                          </div>
                          <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                            <span>DISPATCHED: {{ formatOrderDate(ord.createdAt) }}</span>
                            <span class="font-bold text-slate-900 dark:text-white font-mono text-sm">
                              {{ '$' + ord.totalAmount }}
                            </span>
                          </div>
                        </div>

                        <!-- Order items list -->
                        <div class="space-y-3">
                          @for (item of ord.items; track item.id) {
                            <div class="flex items-center justify-between gap-4 text-xs">
                              <div class="flex items-center gap-3 min-w-0">
                                @if (item.product?.images) {
                                  <img
                                    [src]="item.product!.images!.split(',')[0].trim()"
                                    [alt]="item.product?.name || 'Item'"
                                    class="w-12 h-14 object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                  />
                                }
                                <div class="min-w-0">
                                  <h4 class="font-semibold uppercase text-slate-900 dark:text-white truncate">
                                    {{ item.product?.name || 'Archive Piece' }}
                                  </h4>
                                  <p class="text-[11px] text-slate-500 mt-0.5">
                                    SIZE: <span class="font-mono font-bold">{{ item.size }}</span> • QTY: {{ item.quantity }}
                                  </p>
                                </div>
                              </div>
                              <div class="text-right shrink-0">
                                <span class="font-bold text-slate-900 dark:text-white font-mono">
                                  {{ '$' + item.totalPrice }}
                                </span>
                              </div>
                            </div>
                          }
                        </div>

                        <div class="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
                          <div>
                            RECIPIENT: <strong class="text-slate-700 dark:text-slate-300">{{ ord.customerName }}</strong>
                            <span class="mx-1">•</span>
                            ADDRESS: {{ ord.address }}
                          </div>
                          @if (ord.note) {
                            <div class="italic text-slate-400">{{ ord.note }}</div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }

                <div class="pt-2">
                  <a
                    routerLink="/catalog"
                    class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-5 py-2.5 text-xs uppercase tracking-wider font-bold transition-colors inline-flex items-center gap-2"
                  >
                    <span class="material-symbols-outlined text-base">storefront</span>
                    <span>DISCOVER RUNWAY DROPS</span>
                  </a>
                </div>
              }

              <!-- TAB 4: VAULT PROTOCOLS & SECURITY -->
              @case ('security') {
                <div class="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h2 class="font-display text-xl uppercase tracking-tight text-slate-950 dark:text-white">
                    MAISON VAULT PROTOCOL & ACTIVE SESSIONS
                  </h2>
                  <p class="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                    Hardware tokens, encrypted sessions, and device authorization controls.
                  </p>
                </div>

                <div class="space-y-4 text-xs text-slate-600 dark:text-slate-400">
                  <div class="p-4 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span class="material-symbols-outlined text-base text-primary dark:text-sky-300 mt-0.5">lock</span>
                    <div>
                      <span class="font-bold text-slate-900 dark:text-white block uppercase">256-BIT HARDWARE ENCRYPTION</span>
                      <span class="text-[11px] text-slate-500 dark:text-slate-400">Hardware token stored securely in local vault storage.</span>
                    </div>
                  </div>

                  <div class="p-4 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span class="material-symbols-outlined text-base text-primary dark:text-sky-300 mt-0.5">verified_user</span>
                    <div>
                      <span class="font-bold text-slate-900 dark:text-white block uppercase">BEARER TOKEN AUTHENTICATION</span>
                      <span class="text-[11px] text-slate-500 dark:text-slate-400">Bearer token active on railway API with automated refresh.</span>
                    </div>
                  </div>

                  <div class="p-4 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span class="material-symbols-outlined text-base text-primary dark:text-sky-300 mt-0.5">all_inclusive</span>
                    <div>
                      <span class="font-bold text-slate-900 dark:text-white block uppercase">ISOLATED CART VAULT</span>
                      <span class="text-[11px] text-slate-500 dark:text-slate-400">Bag contents automatically scoped and persisted strictly to this authenticated account.</span>
                    </div>
                  </div>
                </div>

                <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    (click)="onLogout()"
                    class="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-6 py-3 text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <span class="material-symbols-outlined text-base">logout</span>
                    <span>SIGN OUT OF ALL SESSIONS</span>
                  </button>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        font-family: inherit;
        display: block;
      }
      :host-context(.dark) input::selection,
      :host-context([data-theme='dark']) input::selection,
      .dark input::selection {
        background-color: #2563eb !important;
        color: #ffffff !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit {
  public readonly auth = inject(AuthService);
  public readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  readonly activeTab = signal<'profile' | 'password' | 'orders' | 'security'>('profile');

  // Client profile fields
  profileName = '';
  profilePhone = '';
  profileAddress = '';
  profileRegion = 'VN';

  readonly savedNotification = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly feedbackMessage = signal<string | null>(null);
  readonly feedbackType = signal<'success' | 'warning'>('success');

  // Change Password state
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  readonly isUpdatingPassword = signal<boolean>(false);
  readonly passwordFeedbackMessage = signal<string | null>(null);
  readonly passwordFeedbackType = signal<'success' | 'warning'>('success');

  // Order Archives state
  readonly orders = signal<Order[]>([]);
  readonly isLoadingOrders = signal<boolean>(false);
  readonly ordersError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.activeTab() === 'orders') {
        this.loadOrders();
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['tab'] === 'orders') {
        this.activeTab.set('orders');
      }
    });

    const user = this.auth.currentUser();
    if (user) {
      this.profileName = user.fullName || user.name || user.username || (user.email ? user.email.split('@')[0] : '');
      this.profilePhone = user.phone || '';
      this.profileAddress = user.address || '';
    }

    // Attempt to load fresh profile data from /users/me
    this.auth.getProfile().subscribe({
      next: (freshUser: User) => {
        if (freshUser) {
          const freshName = freshUser.fullName || freshUser.name || freshUser.username;
          if (freshName) this.profileName = freshName;
          if (freshUser.phone) this.profilePhone = freshUser.phone;
          if (freshUser.address) this.profileAddress = freshUser.address;
        }
      },
      error: () => {},
    });
  }

  getIdSnippet(): string {
    const id = this.auth.currentUser()?.id ?? '8892';
    return String(id).slice(-6);
  }

  getInitials(): string {
    const user = this.auth.currentUser();
    const name = user?.fullName || user?.name || user?.username || (user?.email ? user.email.split('@')[0] : 'M');
    const parts = name.split(/[\s@._-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  onSaveProfile(e: Event): void {
    e.preventDefault();
    const user = this.auth.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    this.feedbackMessage.set(null);

    // Backend API accepts only fullName and phone
    const apiPayload: Partial<User> = {
      fullName: this.profileName,
      phone: this.profilePhone,
    };

    const localPayload: User = {
      ...user,
      name: this.profileName,
      fullName: this.profileName,
      phone: this.profilePhone,
      address: this.profileAddress,
      region: this.profileRegion,
    };

    this.auth.updateProfile(apiPayload).subscribe({
      next: (updatedUser: User) => {
        this.isSaving.set(false);
        this.savedNotification.set(true);
        this.feedbackType.set('success');
        this.feedbackMessage.set('Profile preferences updated successfully.');
        const merged: User = {
          ...localPayload,
          ...updatedUser,
        };
        localStorage.setItem('user', JSON.stringify(merged));
        this.auth.currentUser.set(merged);
        setTimeout(() => this.savedNotification.set(false), 4000);
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        // Persist locally in vault so user changes aren't lost
        localStorage.setItem('user', JSON.stringify(localPayload));
        this.auth.currentUser.set(localPayload);
        this.savedNotification.set(true);
        setTimeout(() => this.savedNotification.set(false), 4000);

        const status = err.status || 'Network';
        const detail = err.error?.message || err.message || 'API endpoint not available';
        this.feedbackType.set('warning');
        this.feedbackMessage.set(`API Response [HTTP ${status}]: ${detail}. Updated locally in browser vault.`);
      },
    });
  }

  onChangePassword(e: Event): void {
    e.preventDefault();
    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordFeedbackType.set('warning');
      this.passwordFeedbackMessage.set('New password and confirmation do not match.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordFeedbackType.set('warning');
      this.passwordFeedbackMessage.set('New password must be at least 6 characters.');
      return;
    }

    this.isUpdatingPassword.set(true);
    this.passwordFeedbackMessage.set(null);

    this.auth
      .changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.isUpdatingPassword.set(false);
          this.passwordFeedbackType.set('success');
          this.passwordFeedbackMessage.set('Password changed successfully.');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';
        },
        error: (err: HttpErrorResponse) => {
          this.isUpdatingPassword.set(false);
          const serverMsg = Array.isArray(err.error?.message)
            ? err.error.message.join(', ')
            : err.error?.message || err.message || 'Failed to update password. Please check your current password.';
          this.passwordFeedbackType.set('warning');
          this.passwordFeedbackMessage.set(serverMsg);
        },
      });
  }

  loadOrders(): void {
    if (!this.auth.isAuthenticated()) return;
    this.isLoadingOrders.set(true);
    this.ordersError.set(null);
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.isLoadingOrders.set(false);
        if (res.success && Array.isArray(res.data)) {
          this.orders.set(res.data);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoadingOrders.set(false);
        this.ordersError.set(err.error?.message || err.message || 'Unable to retrieve order history at this time.');
      },
    });
  }

  getOrderStatusClass(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
      case 'SHIPPED':
      case 'PROCESSING':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-800';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
      case 'PENDING':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
    }
  }

  formatOrderDate(isoDate?: string): string {
    if (!isoDate) return '';
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return isoDate;
    }
  }

  onLogout(): void {
    this.auth.logout();
  }
}
