import { Component, OnInit, signal } from '@angular/core';
import { CouponService, Coupon } from '../Admin/Services/coupon.service';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.scss'],
  standalone: false
})
export class CouponComponent implements OnInit {
  coupons = signal<Coupon[]>([]);
  index = signal<number | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(private couponService: CouponService) {}

  ngOnInit() {
    this.couponService.getValidCoupons().subscribe({
      next: (response) => {
        if (response.success) {
          // Add placeholder logo and minimumAmount for compatibility
          const couponsWithDefaults = response.message.map(coupon => ({
            ...coupon,
            // logo: coupon.logo || 'https://i.ibb.co/kxGMcrw/ipad-1.png',
            // minimumAmount: coupon.minimumAmount || 100
          }));
          this.coupons.set(couponsWithDefaults);
        } else {
          this.errorMessage.set('Failed to load coupons');
        }
      },
      error: (error) => {
        this.errorMessage.set('Error loading coupons: ' + error.message);
        console.error('Error fetching coupons:', error.message);
      }
    });
  }

  async copyCouponCode(couponCode: string, i: number) {
    try {
      await navigator.clipboard.writeText(couponCode);
      this.index.set(i);
      setTimeout(() => {
        this.index.set(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy: ', error);
      this.errorMessage.set('Failed to copy coupon code');
    }
  }
}
