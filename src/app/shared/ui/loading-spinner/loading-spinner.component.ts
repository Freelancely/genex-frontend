import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  standalone: false,
})
export class LoadingSpinnerComponent {
  /** sm | md | lg */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  /** Optional label shown under the spinner. */
  @Input() label?: string;
  /** Adds vertical padding so it stands out inside a card / section. */
  @Input() inline = false;
}
