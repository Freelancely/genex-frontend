import { IProduct } from '@/shared/types/product-type';
import { Component, Input, OnInit } from '@angular/core';
import { ShopService } from '../../services/shop.service';
import Swiper from 'swiper';
import { Scrollbar } from 'swiper/modules';

@Component({
  selector: 'app-related-products',
  templateUrl: './related-products.component.html',
  styleUrls: ['./related-products.component.scss'],
  standalone: false
})
export class RelatedProductsComponent implements OnInit {
  @Input() productId!: string;
  public related_products: IProduct[] = [];

  constructor(private shopService: ShopService) {}

  private loadRelatedProducts() {
    if (this.productId) {
      this.shopService.getProductById(this.productId).subscribe({
        next: (product: IProduct) => {
          const subCatId = product.subCategoryId;
          if (subCatId) {
            this.shopService.getProductsBySubCategoryId(subCatId).subscribe({
              next: (products: IProduct[]) => {
                this.related_products = products
                  .filter((p: IProduct) => p.id !== this.productId)
                  .slice(0, 4);
              },
              error: (err: any) => {
                console.error('Error fetching related products:', err);
              }
            });
          }
        },
        error: (err: any) => {
          console.error('Error fetching product:', err);
        }
      });
    }
  }

  ngOnInit(): void {
    this.loadRelatedProducts();
    new Swiper('.tp-product-related-slider-active', {
      slidesPerView: 4,
      spaceBetween: 24,
      modules: [Scrollbar],
      scrollbar: {
        el: '.tp-related-swiper-scrollbar',
        draggable: true,
        dragClass: 'tp-swiper-scrollbar-drag',
        snapOnRelease: true
      },
      breakpoints: {
        '1200': { slidesPerView: 4 },
        '992': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 2 },
        '0': { slidesPerView: 1 }
      }
    });
  }
}
