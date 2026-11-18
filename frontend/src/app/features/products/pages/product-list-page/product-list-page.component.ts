import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppAlertComponent, AppBadgeComponent, AppButtonComponent } from '@shared/ui';
import { CatalogSearchToolbarComponent } from '../../components/catalog-search-toolbar/catalog-search-toolbar.component';
import { CatalogFilterSidebarComponent } from '../../components/catalog-filter-sidebar/catalog-filter-sidebar.component';
import { CatalogProductResultsComponent } from '../../components/catalog-product-results/catalog-product-results.component';
import { ProductListPageState } from './product-list-page.state';

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [
    RouterLink,
    UpperCasePipe,
    AppAlertComponent,
    AppBadgeComponent,
    AppButtonComponent,
    CatalogSearchToolbarComponent,
    CatalogFilterSidebarComponent,
    CatalogProductResultsComponent,
  ],
  templateUrl: './product-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPageComponent extends ProductListPageState implements OnInit, OnDestroy {
  ngOnInit(): void {
    this.initialize();
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
