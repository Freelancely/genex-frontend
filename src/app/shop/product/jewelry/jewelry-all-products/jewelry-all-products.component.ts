import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IProduct } from '@/types/product-type';
import { ProductService } from '@/shared/services/product.service';

@Component({
    selector: 'app-jewelry-all-products',
    templateUrl: './jewelry-all-products.component.html',
    styleUrls: ['./jewelry-all-products.component.scss'],
    standalone: false
})
export class JewelryAllProductsComponent {

  @ViewChild('navActive') navActive!: ElementRef;
  @ViewChild('productTabMarker') productTabMarker!: ElementRef;

  active_tab: string = 'All Collection';
  tabs: string[] = ['All Collection', 'Bracelets', 'Necklaces', 'Earrings'];

  public allProducts: IProduct[] = [];

  constructor(private renderer: Renderer2, public productService: ProductService) {
    this.productService.products.subscribe((products) => {
      this.allProducts = products.filter(p => p.productType === 'jewelry');
    });
  }

  handleActiveMarker(event: Event, tab: string): void {
    this.active_tab = tab;
    const marker = document.getElementById("productTabMarker");
    if (marker && event.target) {
      marker.style.left = (event.target as HTMLButtonElement).offsetLeft + "px";
      marker.style.width = (event.target as HTMLButtonElement).offsetWidth + "px";
    }
  }

  get filteredProducts(): IProduct[] {
    switch (this.active_tab) {
      case 'All Collection':
        return this.allProducts.slice(0, 8);
      case 'Bracelets':
        return this.allProducts.filter(p => p.category.name === 'Bracelets');
      case 'Necklaces':
        return this.allProducts.filter(p => p.category.name === 'Necklaces');
      case 'Earrings':
        return this.allProducts.filter(p => p.category.name === 'Earrings');
      default:
        return [];
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.renderer.setStyle(this.productTabMarker.nativeElement, 'left', this.navActive.nativeElement.offsetLeft + 'px');
      this.renderer.setStyle(this.productTabMarker.nativeElement, 'width', this.navActive.nativeElement.offsetWidth + 'px');
    }, 0);
  }
}
