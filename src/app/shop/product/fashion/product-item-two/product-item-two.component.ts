import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '@/shared/types/product-type';
import { ShopService } from '../../../services/shop.service';
import { CartService } from '@/shared/services/cart.service';
import { WishlistService } from '@/shared/services/wishlist.service';
import { CompareService } from '@/shared/services/compare.service';
import { UtilsService } from '@/shared/services/utils.service';

@Component({
  selector: 'app-product-item-two',
  templateUrl: './product-item-two.component.html',
  styleUrls: ['./product-item-two.component.scss'],
  standalone: false
})
export class ProductItemTwoComponent implements OnInit {
  @Input() productId?: string;
  @Input() product?: IProduct;
  @Input() spacing: boolean = true;
  @Input() filters?: {
    pageNumber?: number;
    pageSize?: number;
    categoryName?: string;
    subCategoryName?: string;
    productName?: string;
    minPrice?: number;
    maxPrice?: number;
    hasDiscount?: boolean;
    inStockOnly?: boolean;
    hotDeals?: boolean;
    attributeFilters?: { [key: string]: string };
    sortBy?: string;
  };
  public loadedProduct: IProduct | null = null;

  constructor(
    private shopService: ShopService,
    public cartService: CartService,
    public wishlistService: WishlistService,
    public compareService: CompareService,
    public utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    if (this.product) {
      this.loadedProduct = this.product;
    } else if (this.productId) {
      this.shopService.getProductById(this.productId).subscribe({
        next: (product) => {
          this.loadedProduct = product;
        },
        error: (err) => {
          console.error('Error fetching product:', err);
          this.loadedProduct = null;
        }
      });
    } else if (this.filters) {
      // Fetch a single product using filters (e.g., for a specific productName or productId)
      this.shopService.getProducts({ ...this.filters, pageSize: 1 }).subscribe({
        next: ({ products }) => {
          this.loadedProduct = products[0] || null;
        },
        error: (err) => {
          console.error('Error fetching product with filters:', err);
          this.loadedProduct = null;
        }
      });
    }
  }

  get productData(): IProduct | null {
    return this.loadedProduct;
  }

  addToCart(product: IProduct): void {
    this.cartService.addCartProduct(product);
  }

  addToWishlist(product: IProduct): void {
    this.wishlistService.addWishlistProduct(product).subscribe({
      next: (success) => {
        if (success) {
          // UI updates via async pipe
        }
      },
      error: (err) => {
        console.error('Error adding to wishlist:', err);
      }
    });
  }

  addToCompare(product: IProduct): void {
    this.compareService.add_compare_product(product);
  }

  isItemInCart(product: IProduct): boolean {
    return this.cartService.getCartProducts().some((prd: IProduct) => prd.id === product.id);
  }

  isItemInWishlist(product: IProduct): Observable<boolean> {
    return this.wishlistService.isItemInWishlist(product.id);
  }

  isItemInCompare(product: IProduct): boolean {
    return this.compareService.getCompareProducts().some((prd: IProduct) => prd.id === product.id);
  }

  productStatus(product: IProduct): boolean {
    return product.status.toLowerCase() === 'out-of-stock' || product.quantity === 0;
  }
}
