import { ElectronicTrendingProductsService } from 'src/app/shop/services/electronic-trending-products.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IProduct } from '@/types/product-type';

@Component({
  selector: 'app-electronic-trending-products',
  templateUrl: './electronic-trending-products.component.html',
  styleUrls: ['./electronic-trending-products.component.scss'],
  standalone: false
})
export class ElectronicTrendingProductsComponent implements OnInit {
  public hotDealsProducts: IProduct[] = [];
  public topRatedProducts: IProduct[] = [];
  public filteredProducts: IProduct[] = [];
  public activeTab = 'Featured';
  public tabs = ['Featured', 'Top Sellers'];

  public loadingFeatured = true;
  public loadingTopSellers = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private trendingProductsService: ElectronicTrendingProductsService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.updateFilteredProducts();
  }

  get isLoadingActive(): boolean {
    return this.activeTab === 'Featured' ? this.loadingFeatured : this.loadingTopSellers;
  }

  loadProducts() {
    this.trendingProductsService.getHotDealsProducts(8).subscribe({
      next: (products) => {
        this.hotDealsProducts = products;
        this.loadingFeatured = false;
        if (this.activeTab === 'Featured') {
          this.filteredProducts = this.hotDealsProducts;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching hot deals products:', err);
        this.loadingFeatured = false;
        this.cdr.detectChanges();
      }
    });

    this.trendingProductsService.getTopSellingProducts(8).subscribe({
      next: (products) => {
        this.topRatedProducts = products;
        this.loadingTopSellers = false;
        if (this.activeTab === 'Top Sellers') {
          this.filteredProducts = this.topRatedProducts;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching top selling products:', err);
        this.loadingTopSellers = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleActiveTab(tab: string): void {
    this.activeTab = tab;
    this.updateFilteredProducts();
    this.cdr.detectChanges();
  }

  updateFilteredProducts(): void {
    if (this.activeTab === 'Featured') {
      this.filteredProducts = this.hotDealsProducts;
    } else if (this.activeTab === 'Top Sellers') {
      this.filteredProducts = this.topRatedProducts;
    } else {
      this.filteredProducts = [];
    }
  }
}
