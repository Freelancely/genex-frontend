import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CouponService, Coupon } from '../Services/coupon.service';

@Component({
  selector: 'app-view-coupons',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-coupons.component.html',
  styleUrls: ['./view-coupons.component.scss']
})
export class ViewCouponsComponent implements OnInit {
  activeTab = signal<'live' | 'expired'>('live');
  coupons = signal<Coupon[]>([]);
  errorMessage = signal<string | null>(null);

  constructor(
    private readonly couponService: CouponService,
    private readonly router: Router,
    private readonly location: Location
  ) {}

  ngOnInit() {
    this.loadCoupons();
  }

  setActiveTab(tab: 'live' | 'expired') {
    this.activeTab.set(tab);
    this.loadCoupons();
  }

  loadCoupons() {
    const apiCall = this.activeTab() === 'live'
      ? this.couponService.getValidCoupons()
      : this.couponService.getAllCoupons();

    apiCall.subscribe({
      next: (response) => {
        if (response.success) {
          const now = new Date();
          const filteredCoupons = this.activeTab() === 'expired'
            ? (response.message as any[]).filter(coupon => new Date(coupon.endDate ?? coupon.EndDate) < now)
            : response.message;
          this.coupons.set(filteredCoupons.map(coupon => this.normalizeCoupon(coupon)));
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

  private normalizeCoupon(coupon: any): Coupon {
    const couponName = coupon.couponName ?? coupon.CouponName ?? coupon.CouponTitle ?? '';
    const couponImageUrl = coupon.couponImageUrl ?? coupon.CouponImageUrl ?? coupon.CouponImage ?? coupon.couponImage ?? '';
    const id = coupon.couponId ?? coupon.id ?? coupon._id ?? coupon.ID ?? '';

    return {
      couponId: coupon.couponId ?? id,
      id,
      couponCode: coupon.couponCode ?? coupon.CouponCode ?? '',
      couponName,
      CouponName: coupon.CouponName ?? coupon.couponName ?? coupon.CouponTitle ?? '',
      startDate: coupon.startDate ?? coupon.StartDate ?? '',
      endDate: coupon.endDate ?? coupon.EndDate ?? '',
      discountPercent: coupon.discountPercent ?? coupon.DiscountPercent ?? 0,
      couponImageUrl,
      couponImage: coupon.couponImage ?? coupon.CouponImage ?? couponImageUrl
    };
  }

  editCoupon(coupon: Coupon) {
  this.router.navigate(['/pages/admin/add-coupon'], { state: { coupon: { ...coupon, id: coupon.id } } });
}

  goBack() {
    this.location.back();
  }
}
