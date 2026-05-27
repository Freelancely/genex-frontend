import { Component } from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import feature_data, { IFeature } from '@/data/feature-data';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductService } from '@/shared/services/product.service';
import { IProduct } from '@/types/product-type';

@Component({
    selector: 'app-jewelry',
    templateUrl: './jewelry.component.html',
    styleUrls: ['./jewelry.component.scss'],
    standalone: false
})
export class JewelryComponent {
  // feature data
  public feature_items: IFeature[] = feature_data;
  public jewelryPopularItem: IProduct[] = [];
  public jewelryTopSellsItems: IProduct[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    public productService: ProductService
  ) {
    this.productService.products.subscribe((products) => {
      this.jewelryPopularItem = products
        .filter((p) => p.productType === 'jewelry')
        .slice(0, 6);
      this.jewelryTopSellsItems = products
        .filter((p) => p.productType === 'jewelry')
        .slice()
        .sort((a, b) => b.sellCount - a.sellCount)
        .slice(0, 6);
    });
  }
  // Only call with static literal HTML. Never pass user input or server response data:
  // bypassSecurityTrustHtml disables Angular's XSS protection.
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // brand data
  public brand_data = [
    '/assets/img/brand/logo_01.png',
    '/assets/img/brand/logo_02.png',
    '/assets/img/brand/logo_03.png',
    '/assets/img/brand/logo_04.png',
    '/assets/img/brand/logo_05.png',
    '/assets/img/brand/logo_02.png',
    '/assets/img/brand/logo_04.png',
  ];

  // instagram data
  public instagram_data = [
    {
      link: 'https://www.instagram.com/',
      img: '/assets/img/instagram/4/instagram-1.jpg',
    },
    {
      link: 'https://www.instagram.com/',
      img: '/assets/img/instagram/4/instagram-2.jpg',
    },
    {
      link: 'https://www.instagram.com/',
      img: '/assets/img/instagram/4/instagram-3.jpg',
    },
    {
      link: 'https://www.instagram.com/',
      img: '/assets/img/instagram/4/instagram-4.jpg',
    },
    {
      link: 'https://www.instagram.com/',
      img: '/assets/img/instagram/4/instagram-5.jpg',
    },
    {
      link: 'https://www.instagram.com/',
      img: '/assets/img/instagram/4/instagram-6.jpg',
    },
  ];

  ngOnInit(): void {
    // jewelry popular slider setting
    new Swiper('.tp-category-slider-active-4', {
      modules: [Pagination, Navigation, Scrollbar],
      slidesPerView: 5,
      spaceBetween: 25,
      pagination: {
        el: '.tp-category-slider-dot-4',
        clickable: true,
      },
      navigation: {
        nextEl: '.tp-category-slider-button-next-4',
        prevEl: '.tp-category-slider-button-prev-4',
      },
      scrollbar: {
        el: '.tp-category-swiper-scrollbar',
        draggable: true,
        dragClass: 'tp-swiper-scrollbar-drag',
        snapOnRelease: true,
      },
      breakpoints: {
        '1400': {
          slidesPerView: 5,
        },
        '1200': {
          slidesPerView: 4,
        },
        '992': {
          slidesPerView: 3,
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
      },
    });
    // jewelry best product setting
    new Swiper('.tp-best-slider-active', {
      modules: [Pagination, Navigation, Scrollbar],
      slidesPerView: 4,
      spaceBetween: 24,
      pagination: {
        el: '.tp-best-slider-dot',
        clickable: true,
      },
      navigation: {
        nextEl: '.tp-best-slider-button-next',
        prevEl: '.tp-best-slider-button-prev',
      },
      scrollbar: {
        el: '.tp-best-swiper-scrollbar',
        draggable: true,
        dragClass: 'tp-swiper-scrollbar-drag',
        snapOnRelease: true,
      },
      breakpoints: {
        '1200': {
          slidesPerView: 4,
        },
        '992': {
          slidesPerView: 4,
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
      },
    });
    // jewelry brand setting
    new Swiper('.tp-brand-slider-active', {
      modules: [Pagination, Navigation],
      slidesPerView: 5,
      spaceBetween: 0,
      pagination: {
        el: '.tp-brand-slider-dot',
        clickable: true,
      },
      navigation: {
        nextEl: '.tp-brand-slider-button-next',
        prevEl: '.tp-brand-slider-button-prev',
      },
      breakpoints: {
        '1200': {
          slidesPerView: 5,
        },
        '992': {
          slidesPerView: 5,
        },
        '768': {
          slidesPerView: 4,
        },
        '576': {
          slidesPerView: 3,
        },
        '0': {
          slidesPerView: 1,
        },
      },
    });
  }
}
