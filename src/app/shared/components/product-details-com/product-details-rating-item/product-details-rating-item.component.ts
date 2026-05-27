import { Component,Input } from '@angular/core';

@Component({
    selector: 'app-product-details-rating-item',
    templateUrl: './product-details-rating-item.component.html',
    styleUrls: ['./product-details-rating-item.component.scss'],
    standalone: false
})
export class ProductDetailsRatingItemComponent {
  @Input() star!: number;
  @Input() width!: string;
}
