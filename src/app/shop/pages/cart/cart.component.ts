import { CartService } from '@/shared/services/cart.service';
import { AuthService } from '@/shared/services/auth.service';
import { CouponService } from 'src/app/pages/Admin/Services/coupon.service';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss'],
    standalone: false
})
export class CartComponent {

  couponCode: string = '';
  shipCost: number = 0;
  isValidatingCoupon = false;

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private couponService: CouponService,
    private toastr: ToastrService
  ) {}

  handleCouponSubmit() {
    const code = this.couponCode?.trim();
    if (!code) {
      this.toastr.warning('Please enter a coupon code');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.toastr.info('Please log in to apply a coupon');
      return;
    }

    this.isValidatingCoupon = true;
    this.couponService.verifyCoupon(code).subscribe({
      next: (response) => {
        this.isValidatingCoupon = false;
        if (response.success) {
          localStorage.setItem('couponCode', code);
          this.toastr.success(response.message || 'Coupon applied. It will be used at checkout.');
          this.couponCode = '';
        } else {
          this.toastr.error(response.message || 'Invalid coupon');
        }
      },
      error: (err) => {
        this.isValidatingCoupon = false;
        this.toastr.error(err?.error?.message || 'Failed to validate coupon');
      }
    });
  }

  handleShippingCost(value: number | string) {
    if (value === 'free') {
      this.shipCost = 0;
    } else {
      this.shipCost = value as number;
    }
  }
}
