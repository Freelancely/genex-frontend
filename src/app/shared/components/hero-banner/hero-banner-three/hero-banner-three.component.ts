import { Component, ElementRef, ViewChild } from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination, EffectFade } from 'swiper/modules';

@Component({
    selector: 'app-hero-banner-three',
    templateUrl: './hero-banner-three.component.html',
    styleUrls: ['./hero-banner-three.component.scss'],
    standalone: false
})
export class HeroBannerThreeComponent {

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  public swiperInstance: Swiper | undefined;

  // slider data
  public slider_data = [
    {
      id: 1,
      bg: "/assets/img/slider/3/slider-1.jpg",
      subtitle: "Winter Collection 2023",
      title: "Be your kind of beauty",
    },
    {
      id: 2,
      bg: "/assets/img/slider/3/slider-2.jpg",
      subtitle: "Top Brand Collection",
      title: "Use the best for you.",
    },
    {
      id: 3,
      bg: "/assets/img/slider/3/slider-3.jpg",
      subtitle: "Awesome Beauty Products",
      title: "Don't Worry for Skincare",
    },
  ]

  ngAfterViewInit() {
    if (this.swiperContainer) {
      this.swiperInstance =  new Swiper('.tp-slider-active-3', {
        slidesPerView: 1,
        spaceBetween: 30,
        effect: 'fade',
        modules: [Pagination, EffectFade],
        pagination: {
          el: ".tp-slider-3-dot",
          clickable: true
        }
      });
    }
  }
}
