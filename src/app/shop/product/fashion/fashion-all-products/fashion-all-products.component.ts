import { ChangeDetectorRef, Component } from '@angular/core';
import { IProduct } from '@/types/product-type';
import { ProductService } from '@/shared/services/product.service';

@Component({
    selector: 'app-fashion-all-products',
    templateUrl: './fashion-all-products.component.html',
    styleUrls: ['./fashion-all-products.component.scss'],
    standalone: false
})
export class FashionAllProductsComponent {
  tabs: string[] = ['All Collection', 'Shoes', 'Clothing', 'Bags'];
  activeTab: string = this.tabs[0];

  public allProducts:IProduct[] = [];

  constructor(private cdr: ChangeDetectorRef,public productService: ProductService) {
    this.productService.products.subscribe((products) => {
      this.allProducts = products.filter((p) => p.productType === 'chunlan');
      this.filteredProducts = this.getFilteredProducts();
    });
  }

  handleActiveTab(tab: string): void {
    this.activeTab = tab;
    this.filteredProducts = this.getFilteredProducts(); // Update the filtered products
    this.cdr.detectChanges(); // Trigger change detection
  }
  // filtered Products
  filteredProducts = this.getFilteredProducts();
  // get Filtered Products
  getFilteredProducts(): IProduct[] {
    if (this.activeTab === 'All Collection') {
      return this.allProducts;
    } else {
      return this.allProducts.filter(
        (p) => p.category.name.toLowerCase() === this.activeTab.toLowerCase()
      );
    }
  }
}
