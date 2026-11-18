import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppBadgeComponent, AppButtonComponent } from '@shared/ui';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, AppButtonComponent, AppBadgeComponent],
  templateUrl: './not-found-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPageComponent {}
