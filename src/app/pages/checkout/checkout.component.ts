import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '@/shared/services/cart.service';
import { OrderService } from '../Admin/Services/order.service';
import { ToastrService } from 'ngx-toastr';
import { BillingInfoService } from '../Admin/Services/billing-info.service';
import { CouponService } from '../Admin/Services/coupon.service'; // Added CouponService import
import { AuthService } from '@/shared/services/auth.service';

interface BillingInfo {
  billingInfoId: string;
  fullName: string;
  phoneNUmber: string;
  province: string;
  city: string;
  address: string;
  landMark: string;
  label: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  standalone: false
})
export class CheckoutComponent implements OnInit {
  isOpenLogin = false;
  isOpenCoupon = false;
  shipCost: number = 0;
  couponCode: string = '';
  appliedCouponCode: string | null = null;
  appliedCouponDiscount: number = 0;
  couponMessage: string | null = null;
  payment_name: string = '';
  shippingMethod: string = '';
  billingInfos: BillingInfo[] = [];
  selectedBillingInfo: BillingInfo | null = null;
  showBillingForm = false;
  billingForm!: FormGroup;
  billingFormSubmitted = false;
  isSaving = false;
  editingBillingInfoId: string | null = null;
  isPlacingOrder = false;
  isCartLoading = true;

  constructor(
    public cartService: CartService,
    private toastrService: ToastrService,
    private billingInfoService: BillingInfoService,
    private orderService: OrderService,
    private couponService: CouponService, // Added CouponService
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeBillingForm();
    this.getBillingInfo();
    this.loadStoredCoupon();

    // Wait for cart items to load before validating
    this.cartService.getCartItems().subscribe({
      next: (response) => {
        this.isCartLoading = false;
        if (response.success) {
          // Cart loaded successfully, now validate
          this.validateCartNotEmpty();
        } else {
          console.warn('Failed to load cart items');
          this.validateCartNotEmpty(); // Still validate with current state
        }
      },
      error: (err) => {
        this.isCartLoading = false;
        console.error('Error loading cart items:', err);
        this.validateCartNotEmpty(); // Validate with current state even on error
      }
    });
  }

  private loadStoredCoupon() {
    const storedCode = localStorage.getItem('couponCode');
    const storedDiscount = Number(localStorage.getItem('couponDiscount'));

    if (storedCode) {
      this.appliedCouponCode = storedCode;
      if (!isNaN(storedDiscount) && storedDiscount > 0) {
        this.appliedCouponDiscount = storedDiscount;
      } else {
        this.couponService.verifyCoupon(storedCode).subscribe({
          next: (response) => {
            if (response.success) {
              this.appliedCouponDiscount = response.discount ?? 0;
              localStorage.setItem('couponDiscount', String(this.appliedCouponDiscount));
              this.couponMessage = response.message;
            } else {
              this.clearAppliedCoupon();
            }
          },
          error: () => {
            this.clearAppliedCoupon();
          }
        });
      }
    }
  }

  private clearAppliedCoupon() {
    this.appliedCouponCode = null;
    this.appliedCouponDiscount = 0;
    this.couponMessage = null;
    localStorage.removeItem('couponCode');
    localStorage.removeItem('couponDiscount');
  }

  /**
   * Validate that cart has items, redirect to shop if empty
   */
  validateCartNotEmpty() {
    const cartItems = this.cartService.getCartProducts();
    if (cartItems.length === 0) {
      this.toastrService.warning('Your cart is empty. Please add items before checking out.');
      setTimeout(() => this.router.navigate(['/shop/shop']), 1500);
    }
  }

  initializeBillingForm(billingInfo?: BillingInfo) {
    this.billingForm = new FormGroup({
      fullName: new FormControl(billingInfo?.fullName || null, Validators.required),
      phoneNUmber: new FormControl(billingInfo?.phoneNUmber || null, Validators.required),
      province: new FormControl(billingInfo?.province || null, Validators.required),
      city: new FormControl(billingInfo?.city || null, Validators.required),
      address: new FormControl(billingInfo?.address || null, Validators.required),
      landMark: new FormControl(billingInfo?.landMark || null),
      label: new FormControl(billingInfo?.label || null, Validators.required)
    });
  }

  getBillingInfo() {
    this.billingInfoService.getBillingInfos().subscribe({
      next: (response) => {
        if (response.success) {
          this.billingInfos = response.message || [];
          if (this.billingInfos.length > 0) {
            this.selectedBillingInfo = this.billingInfos[0];
          } else {
            this.selectedBillingInfo = null;
          }
        } else {
          console.error('Failed to load billing infos:', response);
          this.billingInfos = [];
          this.selectedBillingInfo = null;
        }
      },
      error: (error) => {
        console.error('Error loading billing infos:', error);
        this.billingInfos = [];
        this.selectedBillingInfo = null;
        this.toastrService.error('Failed to load billing information');
      }
    });
  }

  selectBillingInfo(info: BillingInfo) {
    this.selectedBillingInfo = info;
  }

  editBillingInfo(info: BillingInfo) {
    this.editingBillingInfoId = info.billingInfoId;
    this.initializeBillingForm(info);
    this.showBillingForm = true;
  }

  deleteBillingInfo(id: string) {
    if (confirm('Are you sure you want to delete this billing information?')) {
      this.billingInfoService.deleteBillingInfo(id).subscribe({
        next: () => {
          this.getBillingInfo();
          if (this.selectedBillingInfo?.billingInfoId === id) {
            this.selectedBillingInfo = this.billingInfos.length > 0 ? this.billingInfos[0] : null;
          }
        }
      });
    }
  }

  toggleBillingForm() {
    this.showBillingForm = !this.showBillingForm;
    if (!this.showBillingForm) {
      this.billingForm.reset();
      this.billingFormSubmitted = false;
      this.editingBillingInfoId = null;
    }
  }

  onBillingSubmit() {
  this.billingFormSubmitted = true;
  if (this.billingForm.valid && !this.isSaving) {
    this.isSaving = true;
    const billingInfo = this.billingForm.value;
    const request = this.editingBillingInfoId
      ? this.billingInfoService.updateBillingInfo(this.editingBillingInfoId, billingInfo)
      : this.billingInfoService.createBillingInfo(billingInfo);

    request.subscribe({
      next: (response: any) => {
        const ok = response?.success === true || response?.success === 'true' ||
                   response?.sucess === true || response?.sucess === 'true';
        if (ok) {
          this.toastrService.success(this.editingBillingInfoId ? 'Billing information updated' : 'Billing information saved');
          this.getBillingInfo();
          this.billingForm.reset();
          this.billingFormSubmitted = false;
          this.showBillingForm = false;
          this.editingBillingInfoId = null;
        } else {
          this.toastrService.error(this.editingBillingInfoId ? 'Failed to update billing information' : 'Failed to save billing information');
        }
        this.isSaving = false;
      },
      error: () => {
        this.toastrService.error('Error saving billing information');
        this.isSaving = false;
      }
    });
  }
}

  handleOpenLogin() {
    this.isOpenLogin = !this.isOpenLogin;
  }

  handleOpenCoupon() {
    this.isOpenCoupon = !this.isOpenCoupon;
  }

  handleShippingCost(value: number | string, method: string) {
    if (value === 'free') {
      this.shipCost = 0;
    } else {
      this.shipCost = value as number;
    }
    this.shippingMethod = method;
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  public countrySelectOptions = [
    { value: 'select-country', text: 'Select Country' },
    { value: 'berlin-germany', text: 'Berlin Germany' },
    { value: 'paris-france', text: 'Paris France' },
    { value: 'tokiyo-japan', text: 'Tokiyo Japan' },
    { value: 'new-york-us', text: 'New York US' }
  ];

  changeHandler(selectedOption: { value: string; text: string }) {
    this.billingForm.patchValue({
      province: selectedOption.value
    });
  }

  handleCouponSubmit() {
    if (this.couponCode) {
      this.couponService.verifyCoupon(this.couponCode).subscribe({
        next: (response) => {
          if (response.success) {
            const discount = response.discount ?? 0;
            this.appliedCouponCode = this.couponCode;
            this.appliedCouponDiscount = discount;
            this.couponMessage = response.message;
            localStorage.setItem('couponCode', this.couponCode);
            localStorage.setItem('couponDiscount', String(discount));
            this.toastrService.success(`${response.message} (${discount}% off)`);
            this.couponCode = '';
            this.isOpenCoupon = false;
          } else {
            this.toastrService.error(`Invalid coupon: ${response.message}`);
          }
        },
        error: (err) => {
          this.toastrService.error('Error validating coupon');
          console.error('Coupon validation error:', err);
        }
      });
    } else {
      this.toastrService.error('Please enter a coupon code');
    }
  }

  handlePayment(value: string) {
    this.payment_name = value;
  }

  get couponDiscountAmount(): number {
    const subtotal = this.cartService.totalPriceQuantity().total || 0;
    return this.appliedCouponDiscount > 0 ? subtotal * (this.appliedCouponDiscount / 100) : 0;
  }

  get totalAfterDiscount(): number {
    const subtotal = this.cartService.totalPriceQuantity().total || 0;
    return Math.max(0, subtotal - this.couponDiscountAmount);
  }

  get orderTotal(): number {
    return Math.max(0, this.totalAfterDiscount + this.shipCost);
  }

  get isBillingInfoValid(): boolean {
    return this.billingInfos && this.billingInfos.length > 0 && !!this.selectedBillingInfo;
  }

  onSubmit() {
    // Check if user has any saved billing information
    if (!this.billingInfos || this.billingInfos.length === 0) {
      this.toastrService.error('Please add billing information before placing an order');
      return;
    }

    // Check if billing information is selected
    if (!this.selectedBillingInfo) {
      this.toastrService.error('Please select billing information');
      return;
    }

    if (!this.shippingMethod) {
      this.toastrService.error('Please select a shipping option');
      return;
    }

    if (!this.payment_name) {
      this.toastrService.error('Please select a payment method');
      return;
    }

    const cartItems = this.cartService.getCartProducts();
    if (cartItems.length === 0) {
      this.toastrService.error('No items in cart to place order');
      return;
    }

    this.isPlacingOrder = true;
    const paymentMode = this.payment_name === 'fonepay' ? 'FonePay' : 'Cod';
    const couponCode = localStorage.getItem('couponCode') || ''; // Retrieve coupon code from localStorage

    this.orderService.placeOrder(
      cartItems,
      couponCode,
      paymentMode,
      this.selectedBillingInfo.billingInfoId,
      this.shippingMethod,
      this.shipCost
    ).subscribe({
      next: (response) => {
        if (response.success) {
          if (response.paymentRequired && response.paymentUrl) {
            // Redirect to payment gateway
            window.location.href = response.paymentUrl;
          } else {
            // Order placed successfully without payment (COD)
            this.cartService.clear_cart();
            this.billingForm.reset();
            this.billingFormSubmitted = false;
            localStorage.removeItem('couponCode');
            this.couponCode = '';
            this.payment_name = '';
            this.shipCost = 0;
            this.isPlacingOrder = false;
            this.toastrService.success(response.message || 'Order placed successfully');
            this.router.navigate(['/pages/profile'], { queryParams: { tab: 'orders' } });
          }
        } else {
          this.toastrService.error(`Failed to place order: ${response.message}`);
          this.isPlacingOrder = false;
        }
      },
      error: () => {
        this.isPlacingOrder = false;
      }
    });
  }

  get fullName() { return this.billingForm.get('fullName'); }
  get phoneNUmber() { return this.billingForm.get('phoneNUmber'); }
  get province() { return this.billingForm.get('province'); }
  get city() { return this.billingForm.get('city'); }
  get address() { return this.billingForm.get('address'); }
  get landMark() { return this.billingForm.get('landMark'); }
  get label() { return this.billingForm.get('label'); }
}
