import { Component, OnInit, signal } from '@angular/core';
import { ElectronicsService, Banner } from '../service/electronics.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-electronics',
  standalone: false,
  templateUrl: './electronics.component.html',
  styleUrls: ['./electronics.component.scss']
})
export class ElectronicsComponent implements OnInit {
  genexBanners = signal<Banner[]>([]);
  chunlanBanners = signal<Banner[]>([]);
  polytronBanners = signal<Banner[]>([]);

  // Track image loading states
  private loadedImages: Set<string> = new Set();
  private imageLoadPromises: Map<string, Promise<boolean>> = new Map();

  constructor(private electronicsService: ElectronicsService) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  private loadBanners(): void {
    this.electronicsService.getBanners('genex').subscribe({
      next: (response) => {
        if (response.success) {
          this.genexBanners.set(response.message);
          // Preload genex images
          if (response.message.length > 0) {
            this.preloadImage('genex', response.message[0].imageUrl);
          }
        }
      },
      error: (error) => console.error('Error fetching Genex banners:', error)
    });

    this.electronicsService.getBanners('chunlan').subscribe({
      next: (response) => {
        if (response.success) {
          this.chunlanBanners.set(response.message);
          // Preload chunlan images
          if (response.message.length > 0) {
            this.preloadImage('chunlan', response.message[0].imageUrl);
          }
        }
      },
      error: (error) => console.error('Error fetching Chunlan banners:', error)
    });

    this.electronicsService.getBanners('polytron').subscribe({
      next: (response) => {
        if (response.success) {
          this.polytronBanners.set(response.message);
          // Preload polytron images if needed
          if (response.message.length > 0) {
            this.preloadImage('polytron', response.message[0].imageUrl);
          }
        }
      },
      error: (error) => console.error('Error fetching Polytron banners:', error)
    });
  }

  private preloadImage(category: string, imageUrl: string): Promise<boolean> {
    const key = `${category}-${imageUrl}`;

    if (this.imageLoadPromises.has(key)) {
      return this.imageLoadPromises.get(key)!;
    }

    const promise = new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.add(key);
        resolve(true);
      };
      img.onerror = () => {
        console.error(`❌ Failed to preload ${category} banner image:`, imageUrl);
        resolve(false);
      };
      img.src = imageUrl;
    });

    this.imageLoadPromises.set(key, promise);
    return promise;
  }

  // Image loading event handlers
  public onImageLoad(category: string, event: any): void {
    const imageUrl = event.target.src;
    const key = `${category}-${imageUrl}`;
    this.loadedImages.add(key);
  }

  public onImageError(category: string, event: any): void {
    const imageUrl = event.target.src;
    const key = `${category}-${imageUrl}`;
    console.error(`❌ ${category} banner image failed to load:`, imageUrl);
    // Remove from loaded set if it was there
    this.loadedImages.delete(key);
  }

  // Check if image is loaded for a specific category
  public isImageLoaded(category: string): boolean {
    let imageUrl = '';

    switch (category) {
      case 'genex':
        imageUrl = this.genexBanners().length > 0 ? this.genexBanners()[0].imageUrl : '';
        break;
      case 'chunlan':
        imageUrl = this.chunlanBanners().length > 0 ? this.chunlanBanners()[0].imageUrl : '';
        break;
      case 'polytron':
        imageUrl = this.polytronBanners().length > 0 ? this.polytronBanners()[0].imageUrl : '';
        break;
      default:
        return false;
    }

    if (!imageUrl) return false;

    const key = `${category}-${imageUrl}`;
    return this.loadedImages.has(key);
  }

  // Get background image with proper loading states
  public getBackgroundImage(imageUrl: string): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return 'none';
    }

    // Check if image is loaded by looking for it in the loaded set
    const isLoaded = Array.from(this.loadedImages).some(key => key.includes(imageUrl));

    if (isLoaded) {
      return `url('${imageUrl}')`;
    }

    // Show gradient background while loading
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  // Validate image URL
  public isValidImageUrl(url: string): boolean {
    return !!(url && url.trim() !== '' && (typeof url === 'string' && (url.startsWith('http') || url.startsWith('/') || url.startsWith('assets/'))));
  }

  // Handle banner click events
  public onBannerClick(banner: Banner, event?: Event): void {
    if (banner.hyperlink && banner.hyperlink.trim() !== '') {
      window.open(banner.hyperlink, '_blank');
    } else {
      event?.preventDefault();
    }
  }
}
