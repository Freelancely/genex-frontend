import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IProduct } from '@/types/product-type';
import { CartService } from '@/shared/services/cart.service';

@Component({
  selector: 'app-product-details-wrapper',
  templateUrl: './product-details-wrapper.component.html',
  styleUrls: ['./product-details-wrapper.component.scss'],
  standalone: false,
})
export class ProductDetailsWrapperComponent implements OnChanges {
  @Input() product!: IProduct;
  @Input() isShowBottom: boolean = true;

  textMore = false;
  isBuyNowLoading = false;

  constructor(
    public cartService: CartService,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.cartService.orderQuantity = 1;
    }
  }

  incrementQty(): void {
    const stock = Number(this.product?.quantity ?? 0);
    if (stock > 0 && this.cartService.orderQuantity >= stock) {
      this.toastrService.warning('No more stock available', 'Limit reached');
      return;
    }
    this.cartService.orderQuantity = (this.cartService.orderQuantity || 0) + 1;
  }

  decrementQty(): void {
    if (this.cartService.orderQuantity > 1) {
      this.cartService.orderQuantity--;
    }
  }

  handleTextToggle() {
    this.textMore = !this.textMore;
  }

  /**
   * Handle Buy Now click: Navigate to checkout with current cart items
   */
  handleBuyNow() {
    this.isBuyNowLoading = true;
    
    // Check if cart has items
    const cartItems = this.cartService.getCartProducts();
    if (cartItems.length === 0) {
      this.toastrService.warning('Your cart is empty. Please add items before checking out.');
      this.isBuyNowLoading = false;
      return;
    }
    
    // Navigate to checkout without adding current product
    this.router.navigate(['/pages/checkout']).then(() => {
      this.isBuyNowLoading = false;
    }).catch(error => {
      console.error('Navigation error:', error);
      this.isBuyNowLoading = false;
    });
  }
}
