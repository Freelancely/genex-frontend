import { Component } from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { CartService } from '@/shared/services/cart.service';
import { IProduct } from '@/types/product-type';
import { ProductService } from '@/shared/services/product.service';

@Component({
    selector: 'app-fashion-popular-products',
    templateUrl: './fashion-popular-products.component.html',
    styleUrls: ['./fashion-popular-products.component.scss'],
    standalone: false
})


export class FashionPopularProductsComponent {


  // add to cart
  addToCart(product: IProduct) {
    this.cartService.addCartProduct(product);
  }

  // Function to check if an item is in the cart
  isItemInCart(item: IProduct): boolean {
    return this.cartService.getCartProducts().some((prd: IProduct) => prd.id === item.id);
  }


  public popular_prd: IProduct[] = [];

  constructor(public cartService: CartService, public productService: ProductService) {
    this.productService.products.subscribe((products) => {
      this.popular_prd = products.filter((p) => p.productType === "chunlan").slice(0, 8);
    });
  }

  ngOnInit(): void {
    new Swiper('.tp-category-slider-active-2', {
      slidesPerView: 5,
      spaceBetween: 20,
      loop: false,
      modules: [Pagination, Navigation, Scrollbar],
      pagination: {
        el: '.tp-category-slider-dot',
        clickable: true,
      },
      navigation: {
        nextEl: '.tp-category-slider-button-next',
        prevEl: '.tp-category-slider-button-prev',
      },
      scrollbar: {
        el: '.swiper-scrollbar',
        draggable: true,
        dragClass: 'tp-swiper-scrollbar-drag',
        snapOnRelease: true,
      },
      breakpoints: {
        '1200': {
          slidesPerView: 5,
        },
        '992': {
          slidesPerView: 4,
        },
        '768': {
          slidesPerView: 3,
        },
        '576': {
          slidesPerView: 2,
        },
        '0': {
          slidesPerView: 1,
        },
      },
    });
  }
}
