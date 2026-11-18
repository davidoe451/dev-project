import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AppButtonComponent } from '../app-button/app-button.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [AppButtonComponent],
  templateUrl: './app-pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPaginationComponent {
  readonly page = input<number>(1);
  readonly totalPages = input<number>(1);
  readonly totalItems = input<number>(0);
  readonly limit = input<number>(12);

  readonly pageChange = output<number>();

  protected readonly pages = computed(() => {
    const total = Math.max(1, this.totalPages());
    const current = Math.min(Math.max(1, this.page()), total);
    const items: (number | 'ellipsis')[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) items.push(i);
      return items;
    }

    items.push(1);
    if (current > 3) items.push('ellipsis');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) items.push(i);

    if (current < total - 2) items.push('ellipsis');
    items.push(total);
    return items;
  });

  protected readonly rangeStart = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.page() - 1) * this.limit() + 1;
  });

  protected readonly rangeEnd = computed(() =>
    Math.min(this.page() * this.limit(), this.totalItems()),
  );

  protected goTo(target: number): void {
    if (target < 1 || target > this.totalPages() || target === this.page()) return;
    this.pageChange.emit(target);
  }
}
