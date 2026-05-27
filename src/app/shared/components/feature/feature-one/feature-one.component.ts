import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IFeature } from '@/data/feature-data';
import feature_data from '@/data/feature-data';

@Component({
    selector: 'app-feature-one',
    templateUrl: './feature-one.component.html',
    styleUrls: ['./feature-one.component.scss'],
    standalone: false
})
export class FeatureOneComponent {
  public feature_items:IFeature[] = feature_data;

  constructor(private sanitizer: DomSanitizer) {}

  // Only call with static literal HTML from @/data/feature-data. Never pass user input
  // or server response data: bypassSecurityTrustHtml disables Angular's XSS protection.
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
