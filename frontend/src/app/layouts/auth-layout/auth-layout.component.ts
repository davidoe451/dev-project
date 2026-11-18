import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { AppButtonComponent, AppCardComponent } from '@shared/ui';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AppCardComponent, AppButtonComponent],
  templateUrl: './auth-layout.component.html',
  styles: [
    `
      :host {
        font-family: inherit;
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  public readonly theme = inject(ThemeService);
}
