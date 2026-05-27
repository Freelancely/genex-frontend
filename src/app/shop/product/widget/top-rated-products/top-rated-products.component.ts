import { Component, OnInit } from '@angular/core';
import { IProduct } from '@/types/product-type';
import { ShopFilterService } from 'src/app/shop/services/shop-filter.service';

@Component({
  selector: 'app-top-rated-products',
  templateUrl: './top-rated-products.component.html',
  styleUrls: ['./top-rated-products.component.scss'],
  standalone: false
})
export class TopRatedProductsComponent implements OnInit {
  public topRatedProducts: { product: IProduct; averageRating: number }[] = [];

  constructor(private shopFilterService: ShopFilterService) {}

  ngOnInit(): void {
    this.shopFilterService.getTopRatedProducts(4).subscribe(products => {
      this.topRatedProducts = products.map(product => ({
        product,
        averageRating: this.calculateAverageRating(product)
      }));
    });
  }

  private calculateAverageRating(product: IProduct): number {
    if (!product.reviews || product.reviews.length === 0) {
      return 0;
    }
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((totalRating / product.reviews.length).toFixed(1));
  }
}
