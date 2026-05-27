import { ElectronicTrendingProductsService } from 'src/app/shop/services/electronic-trending-products.service';
import { IProduct } from '@/types/product-type';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-electronic-sm-products',
  templateUrl: './electronic-sm-products.component.html',
  styleUrls: ['./electronic-sm-products.component.scss'],
  standalone: false
})
export class ElectronicSmProductsComponent implements OnInit {
  public discount_products: IProduct[] = [];
  public featured_products: IProduct[] = [];
  public selling_products: IProduct[] = [];

  public loadingDiscount = true;
  public loadingFeatured = true;
  public loadingSelling = true;

  constructor(
    private trendingProductsService: ElectronicTrendingProductsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.trendingProductsService.getDiscountedProducts(3).subscribe({
      next: (products) => {
        this.discount_products = products;
        this.loadingDiscount = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching discounted products:', err);
        this.loadingDiscount = false;
        this.cdr.detectChanges();
      }
    });

    this.trendingProductsService.getHotDealsProducts(3).subscribe({
      next: (products) => {
        this.featured_products = products;
        this.loadingFeatured = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching featured products:', err);
        this.loadingFeatured = false;
        this.cdr.detectChanges();
      }
    });

    this.trendingProductsService.getTopSellingProducts(3).subscribe({
      next: (products) => {
        this.selling_products = products;
        this.loadingSelling = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching top selling products:', err);
        this.loadingSelling = false;
        this.cdr.detectChanges();
      }
    });
  }
}
