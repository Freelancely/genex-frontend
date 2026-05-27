import { Component, OnInit, AfterViewInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import Swiper from 'swiper';
import { Pagination, EffectFade } from 'swiper/modules';
import { ElectronicsService, Banner } from 'src/app/home/service/electronics.service';
import { IProductBanner } from '@/types/banner-d-type';

@Component({
  selector: 'app-electronic-product-banner',
  templateUrl: './electronic-product-banner.component.html',
  styleUrls: ['./electronic-product-banner.component.scss'],
  standalone: false
})
export class ElectronicProductBannerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;

  public productBannerData = signal<IProductBanner[]>([]);
  private swiperInstance: Swiper | undefined;
  private loadedImages = new Set<string>();

  constructor(private electronicsService: ElectronicsService) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  ngAfterViewInit(): void {
    // Initialize swiper after view init and when banners are loaded
    setTimeout(() => {
      if (this.productBannerData().length > 0) {
        this.initializeSwiper();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
    }
  }

  loadBanners(): void {
    this.electronicsService.getBanners('polytron').subscribe({
      next: (response: { success: boolean; message: Banner[] }) => {
        if (response.success && response.message.length > 0) {
          this.productBannerData.set(
            response.message.map((banner: Banner) => ({
              bannerId: banner.bannerId,
              hyperlink: banner.hyperlink,
              imageUrl: banner.imageUrl,
              img: banner.imageUrl // Map imageUrl to img for HTML compatibility
            } as IProductBanner))
          );

          // Initialize swiper after banners are loaded
          setTimeout(() => {
            this.initializeSwiper();
          }, 100);
        } else {
          console.warn('⚠️ No Polytron banners returned');
        }
      },
      error: (error: any) => {
        console.error('❌ Error fetching Polytron banners:', error);
      }
    });
  }

  private initializeSwiper(): void {
    if (!this.swiperContainer?.nativeElement || this.productBannerData().length === 0) {
      console.warn('Cannot initialize swiper - missing container or banners');
      return;
    }

    // Destroy existing instance if any
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
    }

    const bannerCount = this.productBannerData().length;

    this.swiperInstance = new Swiper('.tp-product-banner-slider-active', {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: bannerCount > 1, // Only enable loop if multiple banners
      effect: 'slide', // Use slide instead of fade for better compatibility
      speed: 600,
      modules: [Pagination],
      pagination: {
        el: '.tp-product-banner-slider-dot',
        clickable: true,
        dynamicBullets: bannerCount > 5,
        renderBullet: (index: number, className: string) => {
          return `<span class="${className}" data-slide="${index}"></span>`;
        }
      },
      autoplay: bannerCount > 1 ? {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      } : false,
      observer: true,
      observeParents: true,
      observeSlideChildren: true,
      on: {
        init: () => {
        },
        slideChange: (swiper) => {
        }
      }
    });
  }

  public onImageLoad(imageUrl: string, event: any): void {
    this.loadedImages.add(imageUrl);

    // Update swiper after image loads
    if (this.swiperInstance) {
      setTimeout(() => {
        this.swiperInstance!.update();
      }, 50);
    }
  }

  public onImageError(imageUrl: string, event: any): void {
    console.error('❌ Product banner image failed to load:', imageUrl);
    this.loadedImages.add(imageUrl); // Treat as loaded to prevent infinite loading
  }

  public isImageLoaded(imageUrl: string): boolean {
    return this.loadedImages.has(imageUrl);
  }

  public onBannerClick(banner: IProductBanner, event: Event): void {
    event.preventDefault();

    if (banner.hyperlink) {
      // Open external links in new tab, internal links in same tab
      if (banner.hyperlink.startsWith('http') || banner.hyperlink.startsWith('//')) {
        window.open(banner.hyperlink, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = banner.hyperlink;
      }
    }
  }

  public refreshBanners(): void {
    this.loadedImages.clear();
    this.loadBanners();
  }
}
