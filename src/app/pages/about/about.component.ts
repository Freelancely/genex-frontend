import { Component, OnInit } from '@angular/core';
import { Coupon, CouponService } from '../Admin/Services/coupon.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: false
})
export class AboutComponent implements OnInit {
  coupons: Coupon[] = [];

  constructor(private couponService: CouponService) {}

  ngOnInit(): void {
    this.couponService.getValidCoupons().subscribe({
      next: (response) => {
        if (response.success) {
          this.coupons = (response.message || []).slice(0, 4);
        }
      },
      error: () => {
        this.coupons = [];
      }
    });
  }
}
