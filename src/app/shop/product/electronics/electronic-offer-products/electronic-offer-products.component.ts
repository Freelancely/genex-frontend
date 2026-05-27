import { Component, OnInit } from '@angular/core';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import { ElectronicOfferProductsService } from 'src/app/shop/services/electronic-offer-products.service';
import { IProduct } from '@/types/product-type';

@Component({
  selector: 'app-electronic-offer-products',
  templateUrl: './electronic-offer-products.component.html',
  styleUrls: ['./electronic-offer-products.component.scss'],
  standalone: false
})
export class ElectronicOfferProductsComponent implements OnInit {
  public offer_products: IProduct[] = [];
  public loading = true;

  constructor(private offerProductsService: ElectronicOfferProductsService) {}

  ngOnInit(): void {
    // Fetch hot deals products from API
    this.offerProductsService.getHotDealsProducts().subscribe({
      next: (products) => {
        this.offer_products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching hot deals products:', error);
        this.offer_products = [];
        this.loading = false;
      }
    });

    // Initialize Swiper
    new Swiper('.tp-product-offer-slider-active', {
      slidesPerView: 4,
      spaceBetween: 30,
      loop: false,
      modules: [Pagination],
      pagination: {
        el: '.tp-deals-slider-dot',
        clickable: true
      },
      breakpoints: {
        '1200': {
          slidesPerView: 3
        },
        '992': {
          slidesPerView: 2
        },
        '768': {
          slidesPerView: 2
        },
        '576': {
          slidesPerView: 1
        },
        '0': {
          slidesPerView: 1
        }
      }
    });
  }
}
