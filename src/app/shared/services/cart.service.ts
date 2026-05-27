import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { IProduct } from '@/types/product-type';
import { Observable, BehaviorSubject, throwError, of, timer } from 'rxjs';
import { catchError, tap, shareReplay, retryWhen, mergeMap, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '@/shared/services/auth.service';
import { ApiResponse } from '../components/product-details-com/Service/profile.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Initialize from localStorage instead of empty array to prevent cart count from showing 0
  private cartProductsSubject = new BehaviorSubject<IProduct[]>(this.loadCartFromLocalStorageSync());
  cartProducts$ = this.cartProductsSubject.asObservable();
  private cartCache$: Observable<any> | null = null; // Cache for getCartItems
  private readonly CART_STORAGE_KEY = 'genex_cart_data';
  private readonly CART_STORAGE_EXPIRY_KEY = 'genex_cart_expiry';
  private readonly STORAGE_EXPIRY_MINUTES = 60;
  private readonly RETRY_ATTEMPTS = 3;
  private readonly INITIAL_RETRY_DELAY = 100; // ms
  private isAddingToCart = false; // Prevent multiple simultaneous add operations

  public orderQuantity: number = 1;
  public isCartOpen: boolean = false;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toastrService: ToastrService,
    private authService: AuthService
  ) {}

  /**
   * Check if an error is transient and worth retrying
   */
  private isTransientError(error: any): boolean {
    // Retry on network errors, server errors (5xx), or timeout errors
    if (error.status) {
      return error.status >= 500 || error.status === 0 || error.status === 408;
    }
    // Retry on network-related errors
    return error.name === 'TimeoutError' || error.name === 'NetworkError';
  }

  /**
   * Synchronously load cart from localStorage (used for initialization)
   * This prevents cart count from showing 0 when component first loads
   */
  private loadCartFromLocalStorageSync(): IProduct[] {
    try {
      const storedData = localStorage.getItem(this.CART_STORAGE_KEY);
      const expiryTime = localStorage.getItem(this.CART_STORAGE_EXPIRY_KEY);

      if (!storedData || !expiryTime) {
        return [];
      }

      // Check if data has expired
      if (new Date().getTime() > parseInt(expiryTime, 10)) {
        this.clearCartFromLocalStorage();
        return [];
      }

      const cartProducts = JSON.parse(storedData) as IProduct[];
      return cartProducts;
    } catch (e) {
      console.error('Failed to load cart from localStorage on init:', e);
      return [];
    }
  }

  /**
   * Get cart items from API or localStorage fallback (cached)
   */
  getCartItems(): Observable<any> {
    if (this.authService.isAdmin()) {
      this.cartProductsSubject.next([]);
      return new Observable(observer => {
        observer.next({ success: true, message: [] });
        observer.complete();
      });
    }

    if (!this.authService.isAuthenticated()) {
      this.cartProductsSubject.next([]);
      return new Observable(observer => {
        observer.next({ success: true, message: [] });
        observer.complete();
      });
    }

    if (!this.cartCache$) {
      this.cartCache$ = this.fetchCartFromAPI().pipe(
        shareReplay(1) // Cache the result to prevent duplicate API calls
      );
    }
    return this.cartCache$;
  }

  /**
   * Explicitly refresh cart from API, ignoring cache
   * Use this when navigating between pages to ensure fresh data
   */
  refreshCartItems(): Observable<any> {
    if (this.authService.isAdmin()) {
      this.cartProductsSubject.next([]);
      return new Observable(observer => {
        observer.next({ success: true, message: [] });
        observer.complete();
      });
    }

    if (!this.authService.isAuthenticated()) {
      this.cartProductsSubject.next([]);
      return new Observable(observer => {
        observer.next({ success: true, message: [] });
        observer.complete();
      });
    }

    // Always fetch fresh, don't use cache
    return this.fetchCartFromAPI();
  }

  /**
   * Internal method to fetch cart from API
   */
  private fetchCartFromAPI(): Observable<any> {
    return this.http.get<{ success: boolean; message: any[] }>(`${this.apiUrl}cart/cart-items`).pipe(
      // Retry logic with exponential backoff for transient failures
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (index < this.RETRY_ATTEMPTS && this.isTransientError(error)) {
              const delayMs = this.INITIAL_RETRY_DELAY * Math.pow(2, index);
              return timer(delayMs);
            }
            return throwError(() => error);
          })
        )
      ),
      tap(response => {
        // Fixed typo: succss -> success
        if (response.success) {
          const cartProducts = response.message.map(item => ({
            id: item.productId,
            cartItemId: item.cartItemId,
            title: item.productName,
            price: item.price,
            img: item.imageUrl,
            quantity: item.quantity,
            orderQuantity: item.quantity,
            sku: '',
            slug: '',
            unit: '',
            imageURLs: [],
            parent: '',
            children: '',
            discount: 0,
            brand: { name: '' },
            category: { name: '' },
            status: '',
            productType: '',
            description: '',
            additionalInformation: [],
            sellCount: 0,
            reviews: [],
          }));
          this.cartProductsSubject.next(cartProducts);
          // Save to localStorage for fallback
          this.saveCartToLocalStorage(cartProducts);
        } else {
          console.warn('API returned success=false');
          this.loadCartFromLocalStorage();
        }
      }),
      catchError(err => {
        console.error('getCartItems API Error:', err);
        // Silently fall back to cached cart; the HTTP interceptor already surfaces real errors.
        const cachedCart = this.loadCartFromLocalStorage();
        if (!cachedCart || cachedCart.length === 0) {
          this.cartProductsSubject.next([]);
        }
        return throwError(() => err);
      })
    );
  }

  /**
   * Check if add to cart operation is currently in progress
   */
  isAddToCartInProgress(): boolean {
    return this.isAddingToCart;
  }

  /**
   * Save cart to localStorage with expiry timestamp
   */
  private saveCartToLocalStorage(cartProducts: IProduct[]): void {
    try {
      const expiryTime = new Date().getTime() + (this.STORAGE_EXPIRY_MINUTES * 60 * 1000);
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cartProducts));
      localStorage.setItem(this.CART_STORAGE_EXPIRY_KEY, expiryTime.toString());
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }

  /**
   * Load cart from localStorage if valid and not expired
   */
  private loadCartFromLocalStorage(): IProduct[] {
    try {
      const storedData = localStorage.getItem(this.CART_STORAGE_KEY);
      const expiryTime = localStorage.getItem(this.CART_STORAGE_EXPIRY_KEY);

      if (!storedData || !expiryTime) {
        return [];
      }

      // Check if data has expired
      if (new Date().getTime() > parseInt(expiryTime, 10)) {
        this.clearCartFromLocalStorage();
        return [];
      }

      const cartProducts = JSON.parse(storedData) as IProduct[];
      this.cartProductsSubject.next(cartProducts);
      return cartProducts;
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
      return [];
    }
  }

  /**
   * Clear cart from localStorage (e.g., on logout)
   */
  private clearCartFromLocalStorage(): void {
    try {
      localStorage.removeItem(this.CART_STORAGE_KEY);
      localStorage.removeItem(this.CART_STORAGE_EXPIRY_KEY);
    } catch (e) {
      console.error('Failed to clear cart from localStorage:', e);
    }
  }

  getCartProducts(): IProduct[] {
    return this.cartProductsSubject.value;
  }

  handleOpenCartSidebar() {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen && !this.authService.isAdmin()) {
      this.cartCache$ = null; // Invalidate cache when cart is opened
      this.refreshCartItems().subscribe(); // Always fetch fresh when opening cart
    }
  }
  

  /**
   * Add product to cart (async version that returns Promise for use in Buy Now flow)
   */
  addCartProductAsync(payload: IProduct): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.isAddingToCart) {
        resolve(false);
        return;
      }

      if (this.authService.isAdmin()) {
        this.toastrService.error('Admins cannot add items to cart');
        resolve(false);
        return;
      }

      if (!this.authService.isAuthenticated()) {
        this.toastrService.warning('Please log in to add items to your cart');
        resolve(false);
        return;
      }

      if (payload.status === 'out-of-stock' || payload.quantity === 0) {
        this.toastrService.error(`Out of stock: ${payload.title}`);
        resolve(false);
        return;
      }

      this.isAddingToCart = true; // Set flag to prevent multiple calls

      const requestBody = {
        productId: payload.id,
        quantity: this.orderQuantity
      };
      
      this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}cart/add-to-cart`, requestBody).pipe(
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, index) => {
              if (index < this.RETRY_ATTEMPTS && this.isTransientError(error)) {
                const delayMs = this.INITIAL_RETRY_DELAY * Math.pow(2, index);
                return timer(delayMs);
              }
              return throwError(() => error);
            })
          )
        ),
        tap(response => {
          if (response.success) {
            this.toastrService.success(`${payload.title} added to cart`);
            this.cartCache$ = null; // Invalidate cache
            this.refreshCartItems().subscribe(); // Fetch fresh cart data
            resolve(true);
          } else {
            this.toastrService.error(`Failed to add ${payload.title} to cart: ${response.message}`);
            resolve(false);
          }
        }),
        catchError(err => {
          console.error('add-to-cart Error:', err);
          if (err?.status !== 401 && err?.status !== 403) {
            this.toastrService.error(`Failed to add ${payload.title} to cart`);
          }
          resolve(false);
          return throwError(() => err);
        }),
        finalize(() => {
          this.isAddingToCart = false; // Reset flag when operation completes
        })
      ).subscribe();
    });
  }

  /**
   * Add product to cart (sync version for regular Add to Cart button)
   */
  addCartProduct(payload: IProduct): void {
    this.addCartProductAsync(payload).then(success => {
      // Success/error handling is done inside addCartProductAsync
    });
  }

  removeCartProduct(payload: IProduct) {
    if (this.authService.isAdmin()) {
      return;
    }

    const cartItemId = payload.cartItemId;
    if (!cartItemId) {
      console.error('CartItemId is missing for:', payload.title);
      this.toastrService.error(`Cart item ID not found for ${payload.title}.`);
      return;
    }

    this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}cart/remove-item`, {
      body: { cartItemId }
    }).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (index < this.RETRY_ATTEMPTS && this.isTransientError(error)) {
              const delayMs = this.INITIAL_RETRY_DELAY * Math.pow(2, index);
              return timer(delayMs);
            }
            return throwError(() => error);
          })
        )
      ),
      tap(response => {
        if (response.success) {
          const updatedProducts = this.cartProductsSubject.value.filter(p => p.cartItemId !== cartItemId);
          this.cartProductsSubject.next(updatedProducts);
          // Update localStorage
          this.saveCartToLocalStorage(updatedProducts);
          this.toastrService.success(`${payload.title} removed from cart`);
        } else {
          this.toastrService.error(`Failed to remove ${payload.title} from cart`);
        }
      }),
      catchError(err => {
        console.error('Error in DELETE request:', err);
        if (err?.status !== 401 && err?.status !== 403) {
          this.toastrService.error(`Failed to remove ${payload.title} from cart`);
        }
        return throwError(() => err);
      })
    ).subscribe();
  }

  clear_cart() {
    if (this.authService.isAdmin()) {
      this.cartProductsSubject.next([]);
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.cartProductsSubject.next([]);
      return;
    }

    this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}cart/remove-all`).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (index < this.RETRY_ATTEMPTS && this.isTransientError(error)) {
              const delayMs = this.INITIAL_RETRY_DELAY * Math.pow(2, index);
              return timer(delayMs);
            }
            return throwError(() => error);
          })
        )
      ),
      tap(response => {
        if (response.success) {
          this.cartProductsSubject.next([]);
          this.clearCartFromLocalStorage();
          this.toastrService.success("Cart cleared");
        } else {
          this.toastrService.error("Failed to clear cart");
        }
      }),
      catchError(err => {
        console.error('Error clearing cart:', err);
        if (err?.status !== 401 && err?.status !== 403) {
          this.toastrService.error("Failed to clear cart");
        }
        return throwError(() => err);
      })
    ).subscribe();
  }

  decrement(item?: IProduct) {
    if (this.authService.isAdmin()) {
      return;
    }

    if (item) {
      if (item.orderQuantity && item.orderQuantity > 1) {
        const requestBody = {
          cartItemId: item.cartItemId,
          quantity: 1
        };

        this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}cart/decrease-quantity`, requestBody).pipe(
          retryWhen(errors =>
            errors.pipe(
              mergeMap((error, index) => {
                if (index < this.RETRY_ATTEMPTS && this.isTransientError(error)) {
                  const delayMs = this.INITIAL_RETRY_DELAY * Math.pow(2, index);
                  return timer(delayMs);
                }
                return throwError(() => error);
              })
            )
          ),
          tap(response => {
            if (response.success) {
              item.orderQuantity!--;
              this.updateCartItem(item, true);
              this.toastrService.success(`Quantity decreased for ${item.title}`);
            } else {
              this.toastrService.error(`Failed to decrease quantity for ${item.title}: ${response.message}`);
            }
          }),
          catchError(err => {
            console.error('decrease-quantity Error:', err);
            if (err?.status !== 401 && err?.status !== 403) {
              this.toastrService.error(`Failed to decrease quantity for ${item.title}`);
            }
            return throwError(() => err);
          })
        ).subscribe();
      }
    } else {
      if (this.orderQuantity > 1) {
        this.orderQuantity--;
      }
    }
  }

  increment(item?: IProduct) {
    if (this.authService.isAdmin()) {
      return;
    }

    if (item) {
      const requestBody = {
        cartItemId: item.cartItemId,
        quantity: 1
      };

      this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}cart/increase-quantity`, requestBody).pipe(
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, index) => {
              if (index < this.RETRY_ATTEMPTS && this.isTransientError(error)) {
                const delayMs = this.INITIAL_RETRY_DELAY * Math.pow(2, index);
                return timer(delayMs);
              }
              return throwError(() => error);
            })
          )
        ),
        tap(response => {
          if (response.success) {
            item.orderQuantity = (item.orderQuantity || 0) + 1;
            this.updateCartItem(item, true);
            this.toastrService.success(`Quantity increased for ${item.title}`);
          } else {
            this.toastrService.error(`Failed to increase quantity for ${item.title}: ${response.message}`);
          }
        }),
        catchError(err => {
          console.error('increase-quantity Error:', err);
          if (err?.status !== 401 && err?.status !== 403) {
            this.toastrService.error(`Failed to increase quantity for ${item.title}`);
          }
          return throwError(() => err);
        })
      ).subscribe();
    } else {
      this.orderQuantity++;
    }
  }

  initialOrderQuantity() {
    this.orderQuantity = 1;
  }

  public updateCartItem(item: IProduct, fromApi: boolean = false) {
    if (this.authService.isAdmin()) {
      return;
    }

    const products = this.cartProductsSubject.value;
    const updatedProducts = products.map(p => p.cartItemId === item.cartItemId ? { ...p, orderQuantity: item.orderQuantity } : p);
    this.cartProductsSubject.next(updatedProducts);

    if (!fromApi) {
      this.cartCache$ = null; // Invalidate cache
      this.refreshCartItems().subscribe(); // Fetch fresh data
    }
  }

  public updateCartItemFromInput(item: IProduct) {
    if (this.authService.isAdmin()) {
      return;
    }

    if (item.orderQuantity && item.orderQuantity >= 1) {
      const currentQuantity = this.cartProductsSubject.value.find(p => p.cartItemId === item.cartItemId)?.quantity || 0;
      const quantityDifference = item.orderQuantity - currentQuantity;

      if (quantityDifference > 0) {
        const requestBody = {
          cartItemId: item.cartItemId,
          quantity: quantityDifference
        };
        this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}cart/increase-quantity`, requestBody).pipe(
          tap(response => {
            if (response.success) {
              this.updateCartItem(item, true);
              this.toastrService.success(`Quantity updated for ${item.title}`);
            } else {
              this.toastrService.error(`Failed to update quantity for ${item.title}: ${response.message}`);
              item.orderQuantity = currentQuantity;
              this.updateCartItem(item, true);
            }
          }),
          catchError(err => {
            console.error('increase-quantity Error:', err);
            item.orderQuantity = currentQuantity;
            this.updateCartItem(item, true);
            return throwError(() => err);
          })
        ).subscribe();
      } else if (quantityDifference < 0) {
        const requestBody = {
          cartItemId: item.cartItemId,
          quantity: Math.abs(quantityDifference)
        };
        this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}cart/decrease-quantity`, requestBody).pipe(
          tap(response => {
            if (response.success) {
              this.updateCartItem(item, true);
              this.toastrService.success(`Quantity updated for ${item.title}`);
            } else {
              this.toastrService.error(`Failed to update quantity for ${item.title}: ${response.message}`);
              item.orderQuantity = currentQuantity;
              this.updateCartItem(item, true);
            }
          }),
          catchError(err => {
            console.error('decrease-quantity Error:', err);
            item.orderQuantity = currentQuantity;
            this.updateCartItem(item, true);
            return throwError(() => err);
          })
        ).subscribe();
      }
    } else {
      this.toastrService.error(`Quantity for ${item.title} must be at least 1`);
      item.orderQuantity = 1;
      this.updateCartItem(item, true);
    }
  }

  public totalPriceQuantity(): { total: number; quantity: number } {
    const products = this.cartProductsSubject.value;
    let total = 0;
    let quantity = 0;

    products.forEach(item => {
      const price = item.discount > 0 ? item.price - (item.price * item.discount / 100) : item.price;
      total += price * (item.orderQuantity || 0);
      quantity += item.orderQuantity || 0;
    });

    return { total, quantity };
  }

  public getTotalQuantity(): number {
    return this.cartProductsSubject.value.reduce((sum, item) => sum + (item.orderQuantity || 0), 0);
  }
}
