import { Component, Input } from '@angular/core';
import { IProduct } from '@/types/product-type';
import { CartService } from '@/shared/services/cart.service';
import { WishlistService } from '@/shared/services/wishlist.service';
import { UtilsService } from '@/shared/services/utils.service';

@Component({
  selector: 'app-product-item-one',
  templateUrl: './product-item-one.component.html',
  styleUrls: ['./product-item-one.component.scss'],
  standalone: false
})
export class ProductItemOneComponent {
  @Input() product!: IProduct;
  @Input() offer_style: boolean | undefined;

  constructor(
    public cartService: CartService,
    public wishlistService: WishlistService,
    public utilsService: UtilsService
  ) {}

  // add to cart
  addToCart(product: IProduct) {
    this.cartService.addCartProduct(product);
  }

  // add to wishlist
  addToWishlist(product: IProduct) {
    this.wishlistService.addWishlistProduct(product);
  }

  // Function to check if an item is in the cart
  isItemInCart(item: IProduct): boolean {
    return this.cartService.getCartProducts().some((prd: IProduct) => prd.id === item.id);
  }

  productStatus(product: IProduct): boolean {
    return product.status === 'out-of-stock' || product.quantity === 0;
  }
}
