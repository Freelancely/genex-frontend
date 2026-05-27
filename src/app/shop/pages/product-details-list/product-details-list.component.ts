import { Component } from '@angular/core';
import { ProductService } from '@/shared/services/product.service';
import { IProduct } from '@/types/product-type';

@Component({
    selector: 'app-product-details-list',
    templateUrl: './product-details-list.component.html',
    styleUrls: ['./product-details-list.component.scss'],
    standalone: false
})
export class ProductDetailsListComponent {
  public product!: IProduct;

  constructor(public productService: ProductService) {
    this.productService.products.subscribe((products) => {
      this.product = products[5];
    });
  }
}
