import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="w-full overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
    >
      <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead
          class="bg-navy-50/80 dark:bg-navy-950/40 text-xs uppercase font-bold tracking-wider text-navy-900 dark:text-navy-300 border-b border-navy-100 dark:border-navy-900/60"
        >
          <tr>
            <ng-content select="[table-header]"></ng-content>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-transparent">
          <ng-content select="[table-body]"></ng-content>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      :host,
      table,
      th,
      td {
        font-family: inherit;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTableComponent {}
