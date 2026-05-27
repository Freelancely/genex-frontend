import { Component } from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination,EffectFade } from 'swiper/modules';

@Component({
    selector: 'app-hero-banner-two',
    templateUrl: './hero-banner-two.component.html',
    styleUrls: ['./hero-banner-two.component.scss'],
    standalone: false
})
export class HeroBannerTwoComponent  {
  public slider_data = [
    {
      id: 1,
      subtitle: "New Arrivals 2023",
      title: "The Clothing Collection",
      img: "/assets/img/slider/2/slider-1.png",
    },
    {
      id: 2,
      subtitle: "Best Selling 2023",
      title: "The Summer Collection",
      img: "/assets/img/slider/2/slider-2.png",
    },
    {
      id: 3,
      subtitle: "Winter Has Arrived",
      title: "Amazing New designs",
      img: "/assets/img/slider/2/slider-3.png",
    },
  ];

  ngOnInit(): void {
    new Swiper('.tp-slider-active-2', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: false,
      effect: 'fade',
      modules: [Navigation, Pagination,EffectFade],
      navigation: {
        nextEl: ".tp-slider-2-button-next",
        prevEl: ".tp-slider-2-button-prev",
      },
      pagination: {
        el: ".tp-slider-2-dot",
        clickable: true
      },
    });
  }
}
