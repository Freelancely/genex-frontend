import { Component } from '@angular/core';
import feature_data, { IFeature } from '@/data/feature-data';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductService } from '@/shared/services/product.service';
import { IProduct } from '@/types/product-type';

@Component({
    selector: 'app-beauty',
    templateUrl: './beauty.component.html',
    styleUrls: ['./beauty.component.scss'],
    standalone: false
})
export class BeautyComponent {

  // featured_data
  public featured_data = [
    {
      id: 1,
      img: '/assets/img/product/featured/featured-1.png',
      title: 'Matte Liquid <br /> Lipstick & Lip Liner',
      subtitle: 'Molestias internos et commodi tempora dolores sapiente sed iste.',
      save: 72,
    },
    {
      id: 2,
      img: '/assets/img/product/featured/featured-2.png',
      title: 'Crushed Liquid <br /> Lip  - Cherry Crush',
      subtitle: 'Molestias internos et commodi tempora dolores sapiente sed iste.',
      save: 98,
    },
    {
      id: 3,
      img: '/assets/img/product/featured/featured-3.png',
      title: 'Mega Waterproof <br /> Concealer  - 125 Bisque',
      subtitle: 'Molestias internos et commodi tempora dolores sapiente sed iste.',
      save: 133,
    },
  ]

  // best sell products
  public products: IProduct[] = [];
  public feature_items:IFeature[] = feature_data;

  constructor(private sanitizer: DomSanitizer,public productService:ProductService) {
    this.productService.products.subscribe((products) => {
      this.products = products.filter((p) => p.productType === "polytron")
      .slice()
      .sort((a, b) => (b.sellCount ?? 0) - (a.sellCount ?? 0))
      .slice(0, 8);
    });
  }

  // Only call with static literal HTML. Never pass user input or server response data:
  // bypassSecurityTrustHtml disables Angular's XSS protection.
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // instagram data
  public instagram_data = [
    { id: 1, link: "https://www.instagram.com/", img: '/assets/img/instagram/3/instagram-1.jpg' },
    { id: 2, link: "https://www.instagram.com/", img: '/assets/img/instagram/3/instagram-2.jpg' },
    { id: 3, link: "https://www.instagram.com/", img: '/assets/img/instagram/3/instagram-3.jpg' },
    { id: 4, link: "https://www.instagram.com/", img: '/assets/img/instagram/3/instagram-4.jpg' },
    { id: 5, link: "https://www.instagram.com/", img: '/assets/img/instagram/3/instagram-5.jpg' },
    { id: 6, link: "https://www.instagram.com/", img: '/assets/img/instagram/3/instagram-6.jpg' },
  ]
}
