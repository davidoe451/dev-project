import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AppButtonComponent, AppDialogComponent } from '@shared/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppDialogComponent, AppButtonComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  public readonly auth = inject(AuthService);
}
