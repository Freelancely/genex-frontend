import { Component, Input } from '@angular/core';
import { CartService } from '@/shared/services/cart.service';
import { WishlistService } from '@/shared/services/wishlist.service';
import { IProduct } from '@/shared/types/product-type';
import { UtilsService } from '@/shared/services/utils.service';

@Component({
  selector: 'app-product-item-three',
  templateUrl: './product-item-three.component.html',
  styleUrls: ['./product-item-three.component.scss'],
  standalone: false
})
export class ProductItemThreeComponent {
  @Input() product!: IProduct;
  @Input() style_2: Boolean | undefined;
  @Input() isCenter: Boolean | undefined;
  @Input() primary_style: Boolean | undefined;

  constructor(
    public cartService: CartService,
    public wishlistService: WishlistService,
    public utilsService: UtilsService
  ) {}

  addToCart(product: IProduct) {
    if (this.cartService.isAddToCartInProgress()) {
      return; // Prevent multiple clicks
    }
    this.cartService.addCartProduct(product);
  }

  addToWishlist(product: IProduct) {
    this.wishlistService.addWishlistProduct(product).subscribe();
  }

  isItemInCart(item: IProduct): boolean {
    return this.cartService.getCartProducts().some((prd: IProduct) => prd.id === item.id);
  }

  productStatus(product: IProduct): boolean {
    return product.status === 'out-of-stock' || product.quantity === 0;
  }
}
