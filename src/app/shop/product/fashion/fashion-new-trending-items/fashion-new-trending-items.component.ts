import { Component } from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { IProduct } from '@/types/product-type';
import { ProductService } from '@/shared/services/product.service';

@Component({
    selector: 'app-fashion-new-trending-items',
    templateUrl: './fashion-new-trending-items.component.html',
    styleUrls: ['./fashion-new-trending-items.component.scss'],
    standalone: false
})
export class FashionNewTrendingItemsComponent {

  public product_items: IProduct[] = [];

  constructor(public productService: ProductService) {
    this.productService.products.subscribe((products) => {
      this.product_items = products.filter((p) => p.productType === 'chunlan').slice(-4);
    });
  }

  ngOnInit(): void {
    new Swiper('.tp-trending-slider-active', {
      slidesPerView: 2,
      spaceBetween: 24,
      loop: false,
      modules: [Navigation, Pagination],
      pagination: {
        el: ".tp-trending-slider-dot",
        clickable: true
      },
      navigation: {
        nextEl: ".tp-trending-slider-button-next",
        prevEl: ".tp-trending-slider-button-prev",
      },
      breakpoints: {
        '1200': {
          slidesPerView: 2,
        },
        '992': {
          slidesPerView: 2,
        },
        '768': {
          slidesPerView: 2,
        },
        '576': {
          slidesPerView: 2,
        },
        '0': {
          slidesPerView: 1,
        },
      }
    });
  }
}
