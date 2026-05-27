import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

@Component({
  selector: 'app-hero-banner-one',
  templateUrl: './hero-banner-one.component.html',
  styleUrls: ['./hero-banner-one.component.scss'],
  standalone: false
})
export class HeroBannerOneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  @ViewChild('prevBtn') prevBtn!: ElementRef;
  @ViewChild('nextBtn') nextBtn!: ElementRef;
  @ViewChild('paginationEl') paginationEl!: ElementRef;

  private swiperInstance: Swiper | undefined;

  ngAfterViewInit() {
    setTimeout(() => this.initializeSwiper(), 150);
  }

  private initializeSwiper() {
    if (!this.swiperContainer?.nativeElement) return;

    this.swiperInstance = new Swiper(this.swiperContainer.nativeElement, {
      modules: [Navigation, Pagination, Autoplay],
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      speed: 700,

      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },

      // ✅ Use element references — avoids global selector conflicts
      // when multiple swiper instances exist on the same page
      pagination: {
        el: this.paginationEl.nativeElement,
        clickable: true,
      },

      navigation: {
        nextEl: this.nextBtn.nativeElement,
        prevEl: this.prevBtn.nativeElement,
      },

      on: {
        init: () => {
        }
      }
    });
  }

  public goToNext(): void {
    this.swiperInstance?.slideNext();
  }

  public goToPrev(): void {
    this.swiperInstance?.slidePrev();
  }

  ngOnDestroy(): void {
    this.swiperInstance?.destroy(true, true);
  }
}
