import { ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewChild, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductSortOption } from '@core/models/catalog.model';
import { SearchSuggestionsResult } from '@core/services/catalog.service';
import { AppBadgeComponent, AppButtonComponent, AppCardComponent, AppInputComponent, AppSelectComponent, SelectOption } from '@shared/ui';

@Component({
  selector: 'app-catalog-search-toolbar',
  standalone: true,
  imports: [RouterLink, AppBadgeComponent, AppButtonComponent, AppCardComponent, AppInputComponent, AppSelectComponent],
  templateUrl: './catalog-search-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogSearchToolbarComponent {
  readonly categories = input.required<SelectOption[]>();
  readonly brands = input.required<SelectOption[]>();
  readonly sortOptions = input.required<SelectOption[]>();
  readonly search = input('');
  readonly selectedCategory = input('all');
  readonly selectedBrand = input('all');
  readonly sort = input<ProductSortOption>('newest');
  readonly suggestions = input<SearchSuggestionsResult>({ terms: [], matchingProducts: [] });
  readonly suggestionsOpen = input(false);
  readonly activeFilterCount = input(0);
  readonly gridCols = input<3 | 4>(3);

  readonly searchInput = output<string>();
  readonly applyTerm = output<string>();
  readonly categoryChange = output<string>();
  readonly brandChange = output<string>();
  readonly sortChange = output<string>();
  readonly gridColsChange = output<3 | 4>();
  readonly suggestionsOpenChange = output<boolean>();
  readonly toggleFilters = output<void>();
  readonly resetFilters = output<void>();

  @ViewChild('searchBoxContainer') private searchBoxContainer?: ElementRef<HTMLElement>;

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement): void {
    if (this.suggestionsOpen() && this.searchBoxContainer && !this.searchBoxContainer.nativeElement.contains(target)) {
      this.suggestionsOpenChange.emit(false);
    }
  }
}
